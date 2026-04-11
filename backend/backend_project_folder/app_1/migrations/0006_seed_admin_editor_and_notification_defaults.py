from django.db import migrations
from django.contrib.auth.hashers import make_password


JOURNAL_TITLES = [
    "Journal of Clinical Sciences Research",
    "Journal of Pharmaceutical Sciences Drug Technology",
    "Biochemistry & Physiology Journal",
    "Paediatrics & Childhood Obesity",
    "Health Care Research & Case Reports Journal",
    "Journal of Molecular Biology & Infectious Diseases",
    "Food & Nutritional Sciences Journal",
    "Genetics & Biotechnology Journal",
    "Neurological & Psychological Journal",
    "Journal of Gynaecology & Obstetrics",
]


def seed_data(apps, schema_editor):
    User = apps.get_model("app_1", "CustomUser")
    SiteSettings = apps.get_model("app_1", "SiteSettings")

    if not User.objects.filter(email="admin@quilivepublishers.com").exists():
        User.objects.create(
            email="admin@quilivepublishers.com",
            password=make_password("Admin@12345"),
            full_name="QuiLive Admin",
            role="ADMIN",
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )

    if not User.objects.filter(email="editor@quilivepublishers.com").exists():
        User.objects.create(
            email="editor@quilivepublishers.com",
            password=make_password("Editor@12345"),
            full_name="QuiLive Editor",
            role="EDITOR",
            pen_name="Editorial Desk",
            country="India",
            is_staff=True,
            is_superuser=False,
            is_active=True,
        )

    settings, _ = SiteSettings.objects.get_or_create(
        pk=1,
        defaults={
            "carousel_images": [],
            "social_links": {},
            "contact_info": {},
            "about_section": {},
            "submission_notifications": {},
        },
    )
    notifications = settings.submission_notifications or {}
    notifications.setdefault("common_email", "submissions@quilivepublishers.com")
    journal_emails = notifications.setdefault("journal_emails", {})
    for title in JOURNAL_TITLES:
        journal_emails.setdefault(title, "")
    settings.submission_notifications = notifications
    settings.save()


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("app_1", "0005_article_journal_name_sitesettings_submission_notifications"),
    ]

    operations = [
        migrations.RunPython(seed_data, noop),
    ]
