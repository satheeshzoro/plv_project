from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.contrib.auth import login, logout
from django.conf import settings
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Count, F, Q
from django.core.mail import send_mail
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, CreateAPIView, ListCreateAPIView
from rest_framework.authentication import SessionAuthentication

from .models import Article, ArticleView, SiteSettings
from .serializers import *
from .permissions import IsAdmin, IsEditor, IsUser

User = get_user_model()

# ==============================================================================
# AUTHENTICATION VIEWS
# ==============================================================================

class RegisterAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)

class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():
            user = serializer.validated_data["user"]

            # Auto-fix: If user is a superuser but role is not ADMIN, fix it.
            if user.is_superuser and user.role != "ADMIN":
                user.role = "ADMIN"
                user.save()

            login(request, user)           # creates session
            
            return Response(
                {
                    "message": "Login successful",
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                    "full_name": user.full_name,
                },
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(
            {"message": "Logged out successfully"},
            status=status.HTTP_200_OK
        )

class CSRFTokenAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        csrf_token = get_token(request)
        return Response({
            "csrfToken": csrf_token
        })

class CurrentUserAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "mapped_journal_category": getattr(user, "mapped_journal_category", None),
        })

# ==============================================================================
# ARTICLE & SUBMISSION VIEWS
# ==============================================================================

class MySubmissionsAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated, IsUser]
    def get(self, request):
        articles = Article.objects.filter(submitted_by=request.user)
        serializer = ArticleListSerializer(articles, many=True, context={"request": request})
        return Response(serializer.data)

class AssignEditorAPIView(APIView):
    permission_classes = [IsAdmin]
    def patch(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        editor_id = request.data.get("editor_id")
        if not editor_id:
            return Response(
                {"detail": "editor_id is required"},
                status=400
            )

        editor = get_object_or_404(User, pk=editor_id, role="EDITOR")

        if not editor.mapped_journal_category:
            return Response(
                {"detail": "Editor must have a mapped journal category before assignment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if editor.mapped_journal_category != article.category:
            return Response(
                {"detail": "Editor can only be assigned submissions from their mapped journal category."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if article.status != "PENDING":
            return Response(
                {"detail": "Only pending submissions can be assigned."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        article.assigned_to = editor
        article.status = "UNDER_REVIEW"
        article.save()
        return Response({"message": "Editor assigned successfully"})

class EditorTasksAPIView(APIView):
    permission_classes = [IsEditor]
    def get(self, request):
        articles = Article.objects.filter(assigned_to=request.user)
        if request.user.mapped_journal_category:
            articles = articles.filter(category=request.user.mapped_journal_category)
        serializer = ArticleListSerializer(articles, many=True, context={"request": request})
        return Response(serializer.data)

class PublishedArticlesAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        articles = Article.objects.filter(status="PUBLISHED")
        serializer = ArticleListSerializer(articles, many=True, context={"request": request})
        return Response(serializer.data)

class IncrementArticleViewAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        Article.objects.filter(pk=pk).update(views=F('views') + 1)
        ArticleView.objects.create(
            article=article,
            user=request.user if request.user.is_authenticated else None,
        )
        article.refresh_from_db(fields=["views"])
        return Response({"message": "View counted", "views": article.views})

class IncrementArticleDownloadAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, pk):
        Article.objects.filter(pk=pk).update(downloads=F('downloads') + 1)
        return Response({"message": "Download counted"})

class TrendingArticlesAPIView(ListAPIView):
    serializer_class = ArticleListSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        one_week_ago = timezone.now() - timedelta(days=7)
        return Article.objects.filter(
            status="PUBLISHED",
        ).annotate(
            weekly_views=Count(
                "view_events",
                filter=Q(view_events__created_at__gte=one_week_ago),
            ),
        ).order_by("-weekly_views", "-views", "-published_date")[:6]
    def get_serializer_context(self):
        return {'request': self.request}

class SubmissionCreateAPIView(CreateAPIView):
    authentication_classes = [SessionAuthentication]
    serializer_class = ArticleCreateSerializer
    permission_classes = [IsAuthenticated, IsUser]

    def perform_create(self, serializer):
        article = serializer.save(
            submitted_by=self.request.user,
            status="PENDING"
        )
        self.send_submission_notifications(article)

    def send_submission_notifications(self, article):
        site_settings = SiteSettings.get_solo()
        notifications = site_settings.submission_notifications or {}
        common_email = notifications.get("common_email", "").strip()
        journal_emails = notifications.get("journal_emails", {}) or {}
        journal_email = journal_emails.get(article.journal_name, "").strip()

        recipients = []
        if common_email:
            recipients.append(common_email)
        if journal_email and journal_email not in recipients:
            recipients.append(journal_email)

        if not recipients:
            return

        subject = f"New manuscript submission: {article.journal_name or article.category}"
        message = (
            f"A new manuscript has been submitted.\n\n"
            f"Author: {article.author_name}\n"
            f"Author email: {article.author_email}\n"
            f"Journal: {article.journal_name or 'Not provided'}\n"
            f"Category: {article.category}\n"
            f"Article type: {article.article_type}\n"
            f"Word count: {article.word_count}\n"
            f"Submission ID: {article.id}\n"
        )

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
            fail_silently=True,
        )

class UpdateSubmissionStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        new_status = request.data.get("status")
        editor_report = (request.data.get("editor_report") or "").strip()

        if request.user.role == "EDITOR":
            if article.assigned_to != request.user:
                return Response({"error": "Not your assigned article"}, status=403)

            if not request.user.mapped_journal_category:
                return Response({"error": "No journal category mapped to this editor"}, status=403)

            if article.category != request.user.mapped_journal_category:
                return Response({"error": "This submission is outside your mapped journal category"}, status=403)

            if new_status not in ["COMPLETED", "REJECTED"]:
                return Response({"error": "Invalid status for editor"}, status=400)

            if not editor_report:
                return Response({"error": "editor_report is required"}, status=400)

            article.editor_report = editor_report

        elif request.user.role == "ADMIN":
            if new_status not in ["PUBLISHED", "REJECTED"]:
                return Response({"error": "Invalid status for admin"}, status=400)

            if new_status == "PUBLISHED" and article.status != "COMPLETED":
                return Response(
                    {"error": "Only completed submissions can be published"},
                    status=400,
                )

            if new_status == "PUBLISHED":
                article.published_date = timezone.now().date()

        else:
            return Response({"error": "Unauthorized"}, status=403)

        article.status = new_status
        article.save()

        return Response({"message": f"Status updated to {new_status}"}, status=200)

class AllSubmissionsAPIView(ListAPIView):
    serializer_class = ArticleListSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    def get_queryset(self):
        return Article.objects.all().order_by("-created_at")
    def get_serializer_context(self):
        return {'request': self.request}

# ==============================================================================
# USER & EDITOR MANAGEMENT VIEWS
# ==============================================================================

class EditorListCreateAPIView(ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]

    def get_queryset(self):
        return User.objects.filter(role="EDITOR")
    def get_serializer_class(self):
        if self.request.method == "POST":
            return EditorCreateSerializer
        return EditorSerializer


class UpdateEditorCategoryAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        editor = get_object_or_404(User, pk=pk, role="EDITOR")
        serializer = EditorCategoryMappingSerializer(
            editor,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(EditorSerializer(editor).data, status=status.HTTP_200_OK)

class UserListAPIView(ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    def get_queryset(self):
        return User.objects.filter(role="USER")

class PromoteUserToEditorAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)

        if user.role != "USER":
            return Response(
                {"detail": "Only users with USER role can be promoted to editor."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.role = "EDITOR"
        user.pen_name = request.data.get("pen_name", user.pen_name)
        user.country = request.data.get("country", user.country)
        user.mapped_journal_category = None
        user.save()

        return Response(
            {
                "message": "User promoted to editor successfully",
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
            },
            status=status.HTTP_200_OK,
        )

# ==============================================================================
# SITE SETTINGS VIEW
# ==============================================================================

class SiteSettingsAPIView(APIView):
    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsAdmin()]
    def get(self, request):
        settings = SiteSettings.get_solo()
        serializer = SiteSettingsSerializer(settings)
        return Response(serializer.data)
    def put(self, request):
        settings = SiteSettings.get_solo()
        serializer = SiteSettingsSerializer(settings, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
