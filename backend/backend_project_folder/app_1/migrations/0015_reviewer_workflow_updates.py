from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("app_1", "0014_sitevisitorcounter"),
    ]

    operations = [
        migrations.AddField(
            model_name="article",
            name="reviewer_assigned_to",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="reviewer_assigned_articles",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="article",
            name="reviewer_form",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="article",
            name="reviewer_report",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="article",
            name="reviewer_submitted_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="article",
            name="status",
            field=models.CharField(
                choices=[
                    ("PENDING", "Pending"),
                    ("UNDER_REVIEW", "Under Review"),
                    ("EDITOR_COMPLETED", "Editor Completed"),
                    ("UNDER_REVIEWER_REVIEW", "Under Reviewer Review"),
                    ("REVIEWER_COMPLETED", "Reviewer Completed"),
                    ("COMPLETED", "Completed"),
                    ("PUBLISHED", "Published"),
                    ("ARCHIVED", "Archived"),
                    ("REJECTED", "Rejected"),
                ],
                default="PENDING",
                max_length=32,
            ),
        ),
        migrations.AlterField(
            model_name="customuser",
            name="role",
            field=models.CharField(
                choices=[
                    ("USER", "User"),
                    ("EDITOR", "Editor"),
                    ("REVIEWER", "Reviewer"),
                    ("ADMIN", "Admin"),
                ],
                default="USER",
                max_length=10,
            ),
        ),
    ]
