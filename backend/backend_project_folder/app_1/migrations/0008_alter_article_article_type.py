from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app_1", "0007_article_editor_report"),
    ]

    operations = [
        migrations.AlterField(
            model_name="article",
            name="article_type",
            field=models.CharField(
                choices=[
                    ("Research Paper", "Research Paper"),
                    ("Review Article", "Review Article"),
                    ("Case Study", "Case Study"),
                    ("Technical Report", "Technical Report"),
                    ("Short Communication", "Short Communication"),
                ],
                max_length=100,
            ),
        ),
    ]
