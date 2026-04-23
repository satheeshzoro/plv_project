from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app_1", "0013_alter_article_status"),
    ]

    operations = [
        migrations.CreateModel(
            name="SiteVisitorCounter",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("count", models.PositiveBigIntegerField(default=0)),
            ],
        ),
    ]
