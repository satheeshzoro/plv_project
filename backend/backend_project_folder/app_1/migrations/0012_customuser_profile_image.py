from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app_1", "0011_customuser_mapped_journal_category"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="profile_image",
            field=models.ImageField(blank=True, null=True, upload_to="editors/profile/"),
        ),
    ]
