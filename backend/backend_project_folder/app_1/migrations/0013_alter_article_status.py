from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app_1", "0012_customuser_profile_image"),
    ]

    operations = [
        migrations.AlterField(
            model_name="article",
            name="status",
            field=models.CharField(
                choices=[
                    ("PENDING", "Pending"),
                    ("UNDER_REVIEW", "Under Review"),
                    ("COMPLETED", "Completed"),
                    ("PUBLISHED", "Published"),
                    ("ARCHIVED", "Archived"),
                    ("REJECTED", "Rejected"),
                ],
                default="PENDING",
                max_length=20,
            ),
        ),
    ]
