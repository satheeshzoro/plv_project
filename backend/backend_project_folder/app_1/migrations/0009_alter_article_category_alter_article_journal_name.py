from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app_1", "0008_alter_article_article_type"),
    ]

    operations = [
        migrations.AlterField(
            model_name="article",
            name="category",
            field=models.CharField(
                choices=[
                    ("Medical Sciences", "Medical Sciences"),
                    ("Biotechnology", "Biotechnology"),
                    ("Environmental Science", "Environmental Science"),
                ],
                max_length=100,
            ),
        ),
        migrations.AlterField(
            model_name="article",
            name="journal_name",
            field=models.CharField(
                choices=[
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
                ],
                max_length=255,
            ),
        ),
    ]
