from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app_1", "0006_seed_admin_editor_and_notification_defaults"),
    ]

    operations = [
        migrations.AddField(
            model_name="article",
            name="editor_report",
            field=models.TextField(blank=True, default=""),
        ),
    ]
