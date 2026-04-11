from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Article(models.Model):
    CATEGORY_CHOICES = (
        ("Medical Sciences", "Medical Sciences"),
        ("Biotechnology", "Biotechnology"),
        ("Environmental Science", "Environmental Science"),
    )

    JOURNAL_NAME_CHOICES = (
        ("Journal of Clinical Sciences Research", "Journal of Clinical Sciences Research"),
        ("Journal of Pharmaceutical Sciences Drug Technology", "Journal of Pharmaceutical Sciences Drug Technology"),
        ("Biochemistry & Physiology Journal", "Biochemistry & Physiology Journal"),
        ("Paediatrics & Childhood Obesity", "Paediatrics & Childhood Obesity"),
        ("Health Care Research & Case Reports Journal", "Health Care Research & Case Reports Journal"),
        ("Journal of Molecular Biology & Infectious Diseases", "Journal of Molecular Biology & Infectious Diseases"),
        ("Food & Nutritional Sciences Journal", "Food & Nutritional Sciences Journal"),
        ("Genetics & Biotechnology Journal", "Genetics & Biotechnology Journal"),
        ("Neurological & Psychological Journal", "Neurological & Psychological Journal"),
        ("Journal of Gynaecology & Obstetrics", "Journal of Gynaecology & Obstetrics"),
    )

    ARTICLE_TYPE_CHOICES = (
        ("Research Paper", "Research Paper"),
        ("Review Article", "Review Article"),
        ("Case Study", "Case Study"),
        ("Technical Report", "Technical Report"),
        ("Short Communication", "Short Communication"),
    )

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

    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    journal_name = models.CharField(max_length=255, choices=JOURNAL_NAME_CHOICES)
    article_type = models.CharField(max_length=100, choices=ARTICLE_TYPE_CHOICES)

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
    editor_report = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    published_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.title


class ArticleView(models.Model):
    article = models.ForeignKey(
        Article,
        related_name="view_events",
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        User,
        related_name="article_views",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"View for {self.article_id} at {self.created_at}"


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
    submission_notifications = models.JSONField(default=dict, blank=True)

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
    JOURNAL_CATEGORY_CHOICES = Article.CATEGORY_CHOICES

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
    mapped_journal_category = models.CharField(
        max_length=100,
        choices=JOURNAL_CATEGORY_CHOICES,
        blank=True,
        null=True,
    )

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
