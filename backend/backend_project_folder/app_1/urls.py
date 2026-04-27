# from django.urls import path
# from .views import RegisterAPIView, LoginAPIView, LogoutAPIView,CSRFTokenAPIView

# urlpatterns = [
#     path("register/", RegisterAPIView.as_view(), name="register"),
#     path("login/", LoginAPIView.as_view(), name="login"),
#     path("logout/", LogoutAPIView.as_view(), name="logout"),
#     path("csrf/", CSRFTokenAPIView.as_view(), name="csrf")
# ]


from django.urls import path

from .views import (
    RegisterAPIView,
    LoginAPIView,
    LogoutAPIView,
    CSRFTokenAPIView,
    CurrentUserAPIView,
)

from .views import (
    SubmissionCreateAPIView,
    MySubmissionsAPIView,
    SubmissionHistoryAPIView,
    AllSubmissionsAPIView,
    PublishedArticlesAPIView,
    IncrementArticleViewAPIView,
    IncrementArticleDownloadAPIView,
    TrendingArticlesAPIView,
    AssignEditorAPIView,
    AssignReviewerAPIView,
    ReviewerSubmissionReviewAPIView,
    UpdateSubmissionStatusAPIView,
    ReviewerTasksAPIView,
    PublishedReviewerReportAPIView,
    RecentPublishedAPIView,
    DashboardAnalyticsAPIView,
    AdminArchivedJournalsAPIView,
    AdminJournalModerationAPIView,
    AdminPublishedArticleCreateAPIView,
)

from .views import (
    EditorListCreateAPIView,
    ReviewerListCreateAPIView,
    EditorTasksAPIView,
    UpdateEditorCategoryAPIView,
    EditorProfileImageAPIView,
    UserListAPIView,
    PromoteUserToEditorAPIView,
    UserRoleUpdateAPIView,
    ProfileSummaryAPIView,
    UserDirectoryAPIView,
)

from .views import (
    SiteSettingsAPIView,
    SiteVisitorCountAPIView,
)

urlpatterns = [

    # ===================== AUTH =====================
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    path("csrf/", CSRFTokenAPIView.as_view(), name="csrf"),
    path("user/me/", CurrentUserAPIView.as_view(), name="current-user"),
    path("profile/", ProfileSummaryAPIView.as_view(), name="profile-summary"),
    path("users/directory/", UserDirectoryAPIView.as_view(), name="user-directory"),

    # ===================== ARTICLES / SUBMISSIONS =====================
    # User submits article
    path("submissions/", SubmissionCreateAPIView.as_view(), name="submission-create"),

    # User dashboard (own submissions)
    path("submissions/my/", MySubmissionsAPIView.as_view(), name="my-submissions"),
    path("submissions/history/", SubmissionHistoryAPIView.as_view(), name="submission-history"),

    # Admin dashboard (all submissions)
    path("submissions/all/", AllSubmissionsAPIView.as_view(), name="all-submissions"),

    # Public journals (published only)
    path("journals/", PublishedArticlesAPIView.as_view(), name="published-journals"),
    path(
        "admin/journals/archived/",
        AdminArchivedJournalsAPIView.as_view(),
        name="admin-archived-journals",
    ),
    path(
        "admin/journals/<int:pk>/",
        AdminJournalModerationAPIView.as_view(),
        name="admin-journal-moderation",
    ),
    path(
        "admin/journals/publish/",
        AdminPublishedArticleCreateAPIView.as_view(),
        name="admin-journal-publish",
    ),

    # Analytics & Trending
    path("articles/<int:pk>/view/", IncrementArticleViewAPIView.as_view(), name="article-view"),
    path("articles/<int:pk>/download/", IncrementArticleDownloadAPIView.as_view(), name="article-download"),
    path("articles/trending/", TrendingArticlesAPIView.as_view(), name="trending-articles"),
    path("recent-published/", RecentPublishedAPIView.as_view(), name="recent-published"),
    path("analytics/dashboard/", DashboardAnalyticsAPIView.as_view(), name="dashboard-analytics"),

    # Admin assigns editor
    path(
        "submissions/<int:pk>/assign/",
        AssignEditorAPIView.as_view(),
        name="assign-editor",
    ),
    path(
        "submissions/<int:pk>/assign-reviewer/",
        AssignReviewerAPIView.as_view(),
        name="assign-reviewer",
    ),
    path(
        "submissions/<int:pk>/reviewer-report/",
        ReviewerSubmissionReviewAPIView.as_view(),
        name="submission-reviewer-report",
    ),

    # Editor/Admin updates status
    path(
        "submissions/<int:pk>/status/",
        UpdateSubmissionStatusAPIView.as_view(),
        name="update-submission-status",
    ),

    # ===================== EDITORS =====================
    # Admin: list + create editors
    path("editors/", EditorListCreateAPIView.as_view(), name="editors"),
    path("reviewers/", ReviewerListCreateAPIView.as_view(), name="reviewers"),
    path("editors/<int:pk>/category/", UpdateEditorCategoryAPIView.as_view(), name="editor-category"),
    path("editors/me/profile-image/", EditorProfileImageAPIView.as_view(), name="editor-profile-image"),

    # Editor dashboard tasks
    path("editor/tasks/", EditorTasksAPIView.as_view(), name="editor-tasks"),
    path("reviewer/tasks/", ReviewerTasksAPIView.as_view(), name="reviewer-tasks"),

    # ===================== USERS =====================
    path("users/", UserListAPIView.as_view(), name="user-list"),
    path("users/<int:pk>/promote-editor/", PromoteUserToEditorAPIView.as_view(), name="promote-user-to-editor"),
    path("users/<int:pk>/role/", UserRoleUpdateAPIView.as_view(), name="user-role-update"),
    path("journals/<int:pk>/reviewer-report/", PublishedReviewerReportAPIView.as_view(), name="journal-reviewer-report"),

    # ===================== SITE SETTINGS =====================
    path("settings/", SiteSettingsAPIView.as_view(), name="site-settings"),
    path("site-visitors/", SiteVisitorCountAPIView.as_view(), name="site-visitors"),
]
