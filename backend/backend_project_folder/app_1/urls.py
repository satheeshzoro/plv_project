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
    AllSubmissionsAPIView,
    PublishedArticlesAPIView,
    IncrementArticleViewAPIView,
    IncrementArticleDownloadAPIView,
    TrendingArticlesAPIView,
    AssignEditorAPIView,
    UpdateSubmissionStatusAPIView,
)

from .views import (
    EditorListCreateAPIView,
    EditorTasksAPIView,
    UpdateEditorCategoryAPIView,
    UserListAPIView,
    PromoteUserToEditorAPIView,
)

from .views import (
    SiteSettingsAPIView,
)

urlpatterns = [

    # ===================== AUTH =====================
    path("register/", RegisterAPIView.as_view(), name="register"),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("logout/", LogoutAPIView.as_view(), name="logout"),
    path("csrf/", CSRFTokenAPIView.as_view(), name="csrf"),
    path("user/me/", CurrentUserAPIView.as_view(), name="current-user"),

    # ===================== ARTICLES / SUBMISSIONS =====================
    # User submits article
    path("submissions/", SubmissionCreateAPIView.as_view(), name="submission-create"),

    # User dashboard (own submissions)
    path("submissions/my/", MySubmissionsAPIView.as_view(), name="my-submissions"),

    # Admin dashboard (all submissions)
    path("submissions/all/", AllSubmissionsAPIView.as_view(), name="all-submissions"),

    # Public journals (published only)
    path("journals/", PublishedArticlesAPIView.as_view(), name="published-journals"),

    # Analytics & Trending
    path("articles/<int:pk>/view/", IncrementArticleViewAPIView.as_view(), name="article-view"),
    path("articles/<int:pk>/download/", IncrementArticleDownloadAPIView.as_view(), name="article-download"),
    path("articles/trending/", TrendingArticlesAPIView.as_view(), name="trending-articles"),

    # Admin assigns editor
    path(
        "submissions/<int:pk>/assign/",
        AssignEditorAPIView.as_view(),
        name="assign-editor",
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
    path("editors/<int:pk>/category/", UpdateEditorCategoryAPIView.as_view(), name="editor-category"),

    # Editor dashboard tasks
    path("editor/tasks/", EditorTasksAPIView.as_view(), name="editor-tasks"),

    # ===================== USERS =====================
    path("users/", UserListAPIView.as_view(), name="user-list"),
    path("users/<int:pk>/promote-editor/", PromoteUserToEditorAPIView.as_view(), name="promote-user-to-editor"),

    # ===================== SITE SETTINGS =====================
    path("settings/", SiteSettingsAPIView.as_view(), name="site-settings"),
]
