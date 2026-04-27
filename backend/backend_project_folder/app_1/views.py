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

from .models import Article, ArticleView, SiteSettings, SiteVisitorCounter
from .serializers import *
from .permissions import IsAdmin, IsEditor, IsReviewer, IsEditorOrReviewer, IsUser

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
            # Keep session alive for configured duration (default: 4 hours).
            request.session.set_expiry(getattr(settings, "SESSION_COOKIE_AGE", 14400))
            
            return Response(
                {
                    "message": "Login successful",
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                    "full_name": user.full_name,
                    "profile_image": get_profile_image_url(request, user),
                    "requires_profile_image": user.role in ["EDITOR", "REVIEWER"] and not bool(user.profile_image),
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
            "requires_profile_image": user.role in ["EDITOR", "REVIEWER"] and not bool(user.profile_image),
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
            article.reviewer_assigned_to = None
            article.reviewer_report = ""
            article.reviewer_form = {}
            article.reviewer_submitted_at = None
            if article.status == "UNDER_REVIEW":
                article.status = "PENDING"
            article.save()
            return Response({"message": "Editor unassigned successfully"})

        editor = get_object_or_404(User, pk=editor_id, role="EDITOR")

        if article.status not in ["PENDING", "UNDER_REVIEW"]:
            return Response(
                {"detail": "Only pending or under-review submissions can be assigned."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        article.assigned_to = editor
        article.reviewer_assigned_to = None
        article.reviewer_report = ""
        article.reviewer_form = {}
        article.reviewer_submitted_at = None
        article.status = "UNDER_REVIEW"
        article.save()
        return Response({"message": "Editor assigned successfully"})

class EditorTasksAPIView(APIView):
    permission_classes = [IsEditor]
    def get(self, request):
        articles = Article.objects.filter(assigned_to=request.user)
        serializer = ArticleListSerializer(articles, many=True, context={"request": request})
        return Response(serializer.data)


class ReviewerTasksAPIView(APIView):
    permission_classes = [IsReviewer]

    def get(self, request):
        articles = Article.objects.filter(reviewer_assigned_to=request.user)
        serializer = ArticleListSerializer(articles, many=True, context={"request": request})
        return Response(serializer.data)


class AssignReviewerAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        if request.user.role not in ["EDITOR", "ADMIN"]:
            return Response({"detail": "Only editor or admin can assign reviewer."}, status=403)

        if request.user.role == "EDITOR" and article.assigned_to != request.user:
            return Response({"detail": "Only the assigned editor can assign reviewer."}, status=403)

        serializer = ReviewerAssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reviewer_id = serializer.validated_data.get("reviewer_id")

        if reviewer_id in [None, "", "null"]:
            article.reviewer_assigned_to = None
            article.reviewer_report = ""
            article.reviewer_form = {}
            article.reviewer_submitted_at = None
            if article.status in ["UNDER_REVIEWER_REVIEW", "REVIEWER_COMPLETED"]:
                article.status = "EDITOR_COMPLETED"
            article.save()
            return Response({"message": "Reviewer unassigned successfully"})

        if article.status not in ["EDITOR_COMPLETED", "UNDER_REVIEWER_REVIEW", "REVIEWER_COMPLETED"]:
            return Response(
                {"detail": "Only editor-completed submissions can be sent to reviewer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reviewer = get_object_or_404(User, pk=reviewer_id, role="REVIEWER")
        article.reviewer_assigned_to = reviewer
        article.status = "UNDER_REVIEWER_REVIEW"
        article.save(update_fields=["reviewer_assigned_to", "status"])
        return Response({"message": "Reviewer assigned successfully"})


class ReviewerSubmissionReviewAPIView(APIView):
    permission_classes = [IsAuthenticated, IsReviewer]

    def post(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        if article.reviewer_assigned_to != request.user:
            return Response({"detail": "This submission is not assigned to you."}, status=403)

        serializer = ReviewerReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data

        article.reviewer_form = payload
        article.reviewer_report = (
            f"Reviewer: {payload.get('reviewer_name') or request.user.full_name}\n"
            f"Recommend for publication: {'Yes' if payload.get('recommend_for_publication') else 'No'}\n"
            f"Decision: {payload.get('reviewer_decision')}\n\n"
            f"Comments:\n{payload.get('comments_and_feedback')}"
        )
        article.reviewer_submitted_at = timezone.now()
        article.status = "REVIEWER_COMPLETED"
        article.save(
            update_fields=[
                "reviewer_form",
                "reviewer_report",
                "reviewer_submitted_at",
                "status",
            ]
        )

        return Response(
            {
                "message": "Reviewer report submitted successfully.",
                "reviewer_form": article.reviewer_form,
                "reviewer_report": article.reviewer_report,
            },
            status=status.HTTP_200_OK,
        )


class PublishedReviewerReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        is_privileged = (
            request.user.role == "ADMIN"
            or article.assigned_to_id == request.user.id
            or article.reviewer_assigned_to_id == request.user.id
            or article.submitted_by_id == request.user.id
        )

        if article.status != "PUBLISHED" and not is_privileged:
            return Response({"detail": "Reviewer report is available after publication."}, status=403)

        return Response(
            {
                "article_id": article.id,
                "article_title": article.title,
                "status": article.status,
                "reviewer_report": article.reviewer_report,
                "reviewer_form": article.reviewer_form,
                "reviewer_submitted_at": article.reviewer_submitted_at,
                "editor_report": article.editor_report,
            }
        )

class PublishedArticlesAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        articles = Article.objects.filter(status="PUBLISHED")
        serializer = ArticleListSerializer(articles, many=True, context={"request": request})
        return Response(serializer.data)


class AdminArchivedJournalsAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        articles = Article.objects.filter(status="ARCHIVED").order_by("-published_date", "-created_at")
        serializer = ArticleListSerializer(articles, many=True, context={"request": request})
        return Response(serializer.data)


class AdminJournalModerationAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        action = (request.data.get("action") or "archive").strip().lower()

        if action == "archive":
            if article.status != "PUBLISHED":
                return Response(
                    {"detail": "Only published journals can be archived."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            article.status = "ARCHIVED"
            article.save(update_fields=["status"])
            return Response({"message": "Journal archived successfully."}, status=status.HTTP_200_OK)

        if action == "unarchive":
            if article.status != "ARCHIVED":
                return Response(
                    {"detail": "Only archived journals can be unarchived."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            article.status = "PUBLISHED"
            if not article.published_date:
                article.published_date = timezone.now().date()
                article.save(update_fields=["status", "published_date"])
            else:
                article.save(update_fields=["status"])
            return Response({"message": "Journal unarchived successfully."}, status=status.HTTP_200_OK)

        return Response(
            {"detail": "Invalid action. Use 'archive' or 'unarchive'."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, pk):
        article = get_object_or_404(Article, pk=pk)

        if article.status not in ["PUBLISHED", "ARCHIVED"]:
            return Response(
                {"detail": "Only published or archived journals can be deleted from this endpoint."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        article.delete()
        return Response({"message": "Journal deleted successfully."}, status=status.HTTP_200_OK)


class AdminPublishedArticleCreateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = AdminPublishedArticleCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        article = serializer.save(
            submitted_by=request.user,
            status="PUBLISHED",
            published_date=timezone.now().date(),
        )
        return Response(
            {
                "message": "Article published successfully.",
                "article": ArticleListSerializer(article, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )

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

            if new_status not in ["EDITOR_COMPLETED", "COMPLETED", "REJECTED"]:
                return Response({"error": "Invalid status for editor"}, status=400)

            if new_status in ["EDITOR_COMPLETED", "REJECTED"] and not editor_report:
                return Response({"error": "editor_report is required"}, status=400)

            if new_status == "COMPLETED" and article.status != "REVIEWER_COMPLETED":
                return Response(
                    {"error": "Reviewer feedback is required before sending to admin"},
                    status=400,
                )

            if new_status == "COMPLETED" and not article.reviewer_report:
                return Response(
                    {"error": "Reviewer report not found"},
                    status=400,
                )

            if editor_report:
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
                "requires_profile_image": user.role in ["EDITOR", "REVIEWER"] and not bool(user.profile_image),
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
                "requires_profile_image": user.role in ["EDITOR", "REVIEWER"] and not bool(user.profile_image),
                "mapped_journal_category": getattr(user, "mapped_journal_category", None),
                "total_submissions": submitted_articles.count(),
                "published_submissions": submitted_articles.filter(status="PUBLISHED").count(),
            }
        )


class EditorProfileImageAPIView(APIView):
    permission_classes = [IsAuthenticated, IsEditorOrReviewer]

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
        if request.user.role not in ["ADMIN", "EDITOR", "REVIEWER"]:
            return Response({"detail": "Only admin, editor, or reviewer can access analytics."}, status=403)

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
        elif request.user.role == "REVIEWER":
            submissions_qs = submissions_qs.filter(reviewer_assigned_to=request.user)

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
        elif request.user.role == "REVIEWER":
            visitors_qs = visitors_qs.filter(article__reviewer_assigned_to=request.user)

        visitors_qs = visitors_qs.filter(created_at__year=year)
        if month:
            visitors_qs = visitors_qs.filter(created_at__month=month)
            year_submissions = year_submissions.filter(created_at__month=month)

        article_metrics_qs = Article.objects.filter(status="PUBLISHED")
        if request.user.role == "EDITOR":
            article_metrics_qs = article_metrics_qs.filter(assigned_to=request.user)
        elif request.user.role == "REVIEWER":
            article_metrics_qs = article_metrics_qs.filter(reviewer_assigned_to=request.user)

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


class ReviewerListCreateAPIView(ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]

    def get_queryset(self):
        return User.objects.filter(role="REVIEWER")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ReviewerCreateSerializer
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

class UserRoleUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserRoleUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role = serializer.validated_data["role"]

        user.role = role
        if "pen_name" in serializer.validated_data:
            user.pen_name = serializer.validated_data.get("pen_name") or None
        if "country" in serializer.validated_data:
            user.country = serializer.validated_data.get("country") or None

        if role == "EDITOR":
            user.mapped_journal_category = serializer.validated_data.get("mapped_journal_category") or None
        else:
            user.mapped_journal_category = None

        user.save()

        return Response(
            {
                "message": "User role updated successfully",
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
            },
            status=status.HTTP_200_OK,
        )


class PromoteUserToEditorAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
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


class SiteVisitorCountAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        counter = SiteVisitorCounter.get_solo()
        return Response({"count": counter.count}, status=status.HTTP_200_OK)

    def post(self, request):
        counter = SiteVisitorCounter.get_solo()
        SiteVisitorCounter.objects.filter(pk=counter.pk).update(count=F("count") + 1)
        counter.refresh_from_db(fields=["count"])
        return Response({"count": counter.count}, status=status.HTTP_200_OK)
