from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app_1", "0010_articleview"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="mapped_journal_category",
            field=models.CharField(
                blank=True,
                choices=[
                    ("Medical Sciences", "Medical Sciences"),
                    ("Biotechnology", "Biotechnology"),
                    ("Environmental Science", "Environmental Science"),
                ],
                max_length=100,
                null=True,
            ),
        ),
    ]
