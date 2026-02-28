# # from django.db import models
# # from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
# # from .managers import CustomUserManager

# # class CustomUser(AbstractBaseUser, PermissionsMixin):
# #     email = models.EmailField(unique=True)
# #     full_name = models.CharField(max_length=150)
# #     is_active = models.BooleanField(default=True)
# #     is_staff = models.BooleanField(default=False)

# #     objects = CustomUserManager()

# #     USERNAME_FIELD = "email"
# #     REQUIRED_FIELDS = ["full_name"]

# #     def __str__(self):
# #         return self.email



# # accounts/models.py
# from django.db import models
# from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
# from .managers import CustomUserManager

# class CustomUser(AbstractBaseUser, PermissionsMixin):

#     ROLE_CHOICES = (
#         ("USER", "User"),
#         ("EDITOR", "Editor"),
#         ("ADMIN", "Admin"),
#     )

#     email = models.EmailField(unique=True)
#     full_name = models.CharField(max_length=150)

#     role = models.CharField(
#         max_length=10,
#         choices=ROLE_CHOICES,
#         default="USER"
#     )

#     # editor-specific
#     pen_name = models.CharField(max_length=100, blank=True, null=True)

#     # common profile
#     country = models.CharField(max_length=100, blank=True, null=True)
#     whatsapp = models.CharField(max_length=20, blank=True, null=True)

#     is_active = models.BooleanField(default=True)
#     is_staff = models.BooleanField(default=False)

#     objects = CustomUserManager()

#     USERNAME_FIELD = "email"
#     REQUIRED_FIELDS = ["full_name"]

#     def __str__(self):
#         return self.email


# articles/models.py
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Article(models.Model):

    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("UNDER_REVIEW", "Under Review"),
        ("COMPLETED", "Completed"),
        ("PUBLISHED", "Published"),
        ("REJECTED", "Rejected"),
    )

    title = models.CharField(max_length=255)
    author_name = models.CharField(max_length=150)
    author_email = models.EmailField()

    category = models.CharField(max_length=100)
    article_type = models.CharField(max_length=100)

    file = models.FileField(upload_to="articles/pdfs/")
    image = models.ImageField(upload_to="articles/images/")

    views = models.IntegerField(default=0)
    downloads = models.IntegerField(default=0)
    word_count = models.IntegerField(default=0)
    read_time = models.IntegerField(default=0) # in minutes

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    submitted_by = models.ForeignKey(
        User,
        related_name="submissions",
        on_delete=models.CASCADE
    )

    assigned_to = models.ForeignKey(
        User,
        related_name="assigned_articles",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    created_at = models.DateTimeField(auto_now_add=True)
    published_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.title


# core/models.py
from django.db import models

# class SiteSettings(models.Model):
#     carousel_images = models.JSONField(default=list)
#     social_links = models.JSONField(default=dict)
#     contact_info = models.JSONField(default=dict)
#     about_text = models.TextField()

#     def __str__(self):
#         return "Site Settings"


class SiteSettings(models.Model):
    carousel_images = models.JSONField(default=list, blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    contact_info = models.JSONField(default=dict, blank=True)
    about_section = models.JSONField(default=dict, blank=True)

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Site Settings"

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import CustomUserManager


class CustomUser(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = (
        ("USER", "User"),
        ("EDITOR", "Editor"),
        ("ADMIN", "Admin"),
    )

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default="USER"
    )

    # Editor-specific
    pen_name = models.CharField(max_length=100, blank=True, null=True)

    # Common profile
    country = models.CharField(max_length=100, blank=True, null=True)
    whatsapp = models.CharField(max_length=20, blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    def save(self, *args, **kwargs):
        """
        Sync role with Django permission system
        """
        if self.role == "ADMIN":
            self.is_staff = True
            self.is_superuser = True
        elif self.role == "EDITOR":
            self.is_staff = True
            self.is_superuser = False
        else:
            self.is_staff = False
            self.is_superuser = False

        super().save(*args, **kwargs)

    @property
    def is_admin(self):
        return self.role == "ADMIN"

    @property
    def is_editor(self):
        return self.role == "EDITOR"

    def __str__(self):
        return self.email
