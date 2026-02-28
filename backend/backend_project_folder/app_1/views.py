from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.contrib.auth import login, logout
from django.conf import settings
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import F
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, CreateAPIView, ListCreateAPIView
from rest_framework.authentication import SessionAuthentication

from .models import Article, SiteSettings
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
        })

# ==============================================================================
# ARTICLE & SUBMISSION VIEWS
# ==============================================================================

class MySubmissionsAPIView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]
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
        article.assigned_to_id = editor_id
        article.status = "UNDER_REVIEW"
        article.save()
        return Response({"message": "Editor assigned successfully"})

class EditorTasksAPIView(APIView):
    permission_classes = [IsEditor]
    def get(self, request):
        articles = Article.objects.filter(assigned_to=request.user)
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
        Article.objects.filter(pk=pk).update(views=F('views') + 1)
        return Response({"message": "View counted"})

class IncrementArticleDownloadAPIView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, pk):
        Article.objects.filter(pk=pk).update(downloads=F('downloads') + 1)
        return Response({"message": "Download counted"})

class TrendingArticlesAPIView(ListAPIView):
    serializer_class = ArticleListSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        # Last 7 days
        one_week_ago = timezone.now().date() - timedelta(days=7)
        # Filter published, recent. Sort by (views + downloads*2) desc
        return Article.objects.filter(
            status="PUBLISHED",
            published_date__gte=one_week_ago
        ).annotate(
            popularity=F('views') + F('downloads') * 2
        ).order_by('-popularity')[:6]
    def get_serializer_context(self):
        return {'request': self.request}

class SubmissionCreateAPIView(CreateAPIView):
    authentication_classes = [SessionAuthentication]
    serializer_class = ArticleCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            submitted_by=self.request.user,
            status="PENDING"
        )

class UpdateSubmissionStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        article = Article.objects.get(pk=pk)
        new_status = request.data.get("status")

        if request.user.role == "EDITOR":
            if article.assigned_to != request.user:
                return Response({"error": "Not your assigned article"}, status=403)

            if new_status not in ["COMPLETED", "REJECTED"]:
                return Response({"error": "Invalid status for editor"}, status=400)

        elif request.user.role == "ADMIN":
            if new_status not in ["PUBLISHED", "REJECTED"]:
                return Response({"error": "Invalid status for admin"}, status=400)

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
    permission_classes = [IsAuthenticated, IsAdmin]
    def get_queryset(self):
        return User.objects.filter(role="EDITOR")
    def get_serializer_class(self):
        if self.request.method == "POST":
            return EditorCreateSerializer
        return EditorSerializer

class UserListAPIView(ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    def get_queryset(self):
        return User.objects.filter(role="USER")

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
