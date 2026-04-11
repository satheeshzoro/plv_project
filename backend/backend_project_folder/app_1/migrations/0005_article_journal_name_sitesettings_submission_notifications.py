from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app_1", "0004_article_downloads_article_read_time_article_views_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="article",
            name="journal_name",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="submission_notifications",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
