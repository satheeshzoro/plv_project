from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.contrib.auth import login, logout
from django.conf import settings
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Count, F, Q
from django.db.models.functions import ExtractMonth
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


def get_profile_image_url(request, user):
    if not getattr(user, "profile_image", None):
        return None
    try:
        return request.build_absolute_uri(user.profile_image.url)
    except Exception:
        return None


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
                    "profile_image": get_profile_image_url(request, user),
                    "requires_profile_image": user.role == "EDITOR" and not bool(user.profile_image),
                    "mapped_journal_category": getattr(user, "mapped_journal_category", None),
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
            "profile_image": get_profile_image_url(request, user),
            "requires_profile_image": user.role == "EDITOR" and not bool(user.profile_image),
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


class SubmissionHistoryAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated, IsUser]

    def get(self, request):
        articles = Article.objects.filter(submitted_by=request.user).order_by("-created_at")
        serializer = ArticleListSerializer(articles, many=True, context={"request": request})
        return Response(serializer.data)

class AssignEditorAPIView(APIView):
    permission_classes = [IsAdmin]
    def patch(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        editor_id = request.data.get("editor_id")
        if editor_id in [None, "", "null"]:
            article.assigned_to = None
            if article.status == "UNDER_REVIEW":
                article.status = "PENDING"
            article.save()
            return Response({"message": "Editor unassigned successfully"})

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

        if article.status not in ["PENDING", "UNDER_REVIEW"]:
            return Response(
                {"detail": "Only pending or under-review submissions can be assigned."},
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


class ProfileSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        submitted_articles = Article.objects.filter(submitted_by=user)
        total_submissions = submitted_articles.count()
        published_submissions = submitted_articles.filter(status="PUBLISHED").count()

        return Response(
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "whatsapp": user.whatsapp,
                "pen_name": user.pen_name,
                "country": user.country,
                "profile_image": get_profile_image_url(request, user),
                "requires_profile_image": user.role == "EDITOR" and not bool(user.profile_image),
                "mapped_journal_category": getattr(user, "mapped_journal_category", None),
                "total_submissions": total_submissions,
                "published_submissions": published_submissions,
            }
        )

    def patch(self, request):
        user = request.user

        full_name = (request.data.get("full_name") or user.full_name).strip()
        email = (request.data.get("email") or user.email).strip().lower()
        whatsapp = (request.data.get("whatsapp") or "").strip() or None
        pen_name = (request.data.get("pen_name") or "").strip() or None
        country = (request.data.get("country") or "").strip() or None

        if not full_name:
            return Response({"detail": "full_name is required"}, status=400)

        if not email:
            return Response({"detail": "email is required"}, status=400)

        if User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
            return Response({"detail": "A user with this email already exists."}, status=400)

        user.full_name = full_name
        user.email = email
        user.whatsapp = whatsapp
        user.pen_name = pen_name
        user.country = country
        user.save()

        submitted_articles = Article.objects.filter(submitted_by=user)
        return Response(
            {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "whatsapp": user.whatsapp,
                "pen_name": user.pen_name,
                "country": user.country,
                "profile_image": get_profile_image_url(request, user),
                "requires_profile_image": user.role == "EDITOR" and not bool(user.profile_image),
                "mapped_journal_category": getattr(user, "mapped_journal_category", None),
                "total_submissions": submitted_articles.count(),
                "published_submissions": submitted_articles.filter(status="PUBLISHED").count(),
            }
        )


class EditorProfileImageAPIView(APIView):
    permission_classes = [IsAuthenticated, IsEditor]

    def get(self, request):
        return Response(
            {
                "id": request.user.id,
                "profile_image": get_profile_image_url(request, request.user),
                "requires_profile_image": not bool(request.user.profile_image),
            }
        )

    def put(self, request):
        serializer = EditorProfileImageUploadSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "message": "Profile image uploaded successfully.",
                "profile_image": get_profile_image_url(request, request.user),
                "requires_profile_image": not bool(request.user.profile_image),
            },
            status=status.HTTP_200_OK,
        )


class UserDirectoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = (
            User.objects.filter(role="USER")
            .annotate(
                submitted_count=Count("submissions"),
                published_count=Count("submissions", filter=Q(submissions__status="PUBLISHED")),
            )
            .order_by("full_name")
        )

        return Response(
            [
                {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "pen_name": user.pen_name,
                    "submitted_count": user.submitted_count,
                    "published_count": user.published_count,
                }
                for user in users
            ]
        )


class RecentPublishedAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = min(int(request.query_params.get("limit", 10)), 50)
        articles = (
            Article.objects.filter(status="PUBLISHED")
            .order_by("-published_date", "-created_at")[:limit]
        )

        results = [
            {
                "article_id": article.id,
                "article_title": article.title,
                "journal_name": article.journal_name,
                "author_name": article.author_name,
                "author_email": article.author_email,
                "published_date": article.published_date,
                "views": article.views,
                "downloads": article.downloads,
            }
            for article in articles
        ]
        return Response(results)


class DashboardAnalyticsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ["ADMIN", "EDITOR"]:
            return Response({"detail": "Only admin or editor can access analytics."}, status=403)

        now = timezone.now()
        year_param = request.query_params.get("year")
        month_param = request.query_params.get("month")

        try:
            year = int(year_param) if year_param else now.year
        except (TypeError, ValueError):
            return Response({"detail": "year must be a valid integer"}, status=400)

        if year < 2000 or year > now.year + 1:
            return Response({"detail": "year is out of allowed range"}, status=400)

        month = None
        if month_param:
            try:
                month = int(month_param)
            except (TypeError, ValueError):
                return Response({"detail": "month must be a valid integer"}, status=400)
            if month < 1 or month > 12:
                return Response({"detail": "month must be between 1 and 12"}, status=400)

        submissions_qs = Article.objects.all()
        if request.user.role == "EDITOR":
            submissions_qs = submissions_qs.filter(assigned_to=request.user)
            if request.user.mapped_journal_category:
                submissions_qs = submissions_qs.filter(category=request.user.mapped_journal_category)

        year_submissions = submissions_qs.filter(created_at__year=year)
        monthly_counts = (
            year_submissions
            .annotate(month_index=ExtractMonth("created_at"))
            .values("month_index")
            .annotate(total=Count("id"))
            .order_by("month_index")
        )
        monthly_count_map = {row["month_index"]: row["total"] for row in monthly_counts}
        submissions_trend = [
            {"month": idx, "count": monthly_count_map.get(idx, 0)}
            for idx in range(1, 13)
        ]

        visitors_qs = ArticleView.objects.all()
        if request.user.role == "EDITOR":
            visitors_qs = visitors_qs.filter(article__assigned_to=request.user)
            if request.user.mapped_journal_category:
                visitors_qs = visitors_qs.filter(article__category=request.user.mapped_journal_category)

        visitors_qs = visitors_qs.filter(created_at__year=year)
        if month:
            visitors_qs = visitors_qs.filter(created_at__month=month)
            year_submissions = year_submissions.filter(created_at__month=month)

        article_metrics_qs = Article.objects.filter(status="PUBLISHED")
        if request.user.role == "EDITOR":
            article_metrics_qs = article_metrics_qs.filter(assigned_to=request.user)
            if request.user.mapped_journal_category:
                article_metrics_qs = article_metrics_qs.filter(category=request.user.mapped_journal_category)

        article_metrics = [
            {
                "article_id": article.id,
                "title": article.title,
                "author_name": article.author_name,
                "journal_name": article.journal_name,
                "views": article.views,
                "downloads": article.downloads,
                "published_date": article.published_date,
            }
            for article in article_metrics_qs.order_by("-published_date", "-created_at")[:50]
        ]

        return Response(
            {
                "year": year,
                "month": month,
                "visitors_count": visitors_qs.count(),
                "submissions_count": year_submissions.count(),
                "submissions_trend": submissions_trend,
                "article_metrics": article_metrics,
            }
        )

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

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


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
