from rest_framework import serializers
from django.contrib.auth import get_user_model
from PIL import Image

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    country = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    whatsapp = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = ("email", "full_name", "password", "country", "whatsapp")

    def validate_email(self, value):
        normalized_email = value.strip().lower()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return normalized_email

    def validate_full_name(self, value):
        full_name = value.strip()
        if not full_name:
            raise serializers.ValidationError("Full name is required.")
        return full_name

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


# login

from rest_framework import serializers
from django.contrib.auth import authenticate

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data["email"].strip().lower()
        user = authenticate(
            self.context["request"],
            email=email,
            password=data["password"],
        )

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        data["email"] = email
        data["user"] = user
        return data


# articles/serializers.py
from rest_framework import serializers
from .models import Article

class ArticleCreateSerializer(serializers.ModelSerializer):
    JOURNAL_CATEGORY_MAP = {
        "Journal of Clinical Sciences Research": "Medical Sciences",
        "Journal of Pharmaceutical Sciences Drug Technology": "Biotechnology",
        "Biochemistry & Physiology Journal": "Biotechnology",
        "Paediatrics & Childhood Obesity": "Medical Sciences",
        "Health Care Research & Case Reports Journal": "Medical Sciences",
        "Journal of Molecular Biology & Infectious Diseases": "Biotechnology",
        "Food & Nutritional Sciences Journal": "Environmental Science",
        "Genetics & Biotechnology Journal": "Biotechnology",
        "Neurological & Psychological Journal": "Medical Sciences",
        "Journal of Gynaecology & Obstetrics": "Medical Sciences",
    }

    # Map frontend fields to backend model fields
    full_name = serializers.CharField(source='author_name')
    email = serializers.EmailField(source='author_email')
    journal_name = serializers.ChoiceField(choices=Article.JOURNAL_NAME_CHOICES)
    category = serializers.ChoiceField(choices=Article.CATEGORY_CHOICES)
    article_type = serializers.ChoiceField(choices=Article.ARTICLE_TYPE_CHOICES)

    class Meta:
        model = Article
        fields = ['full_name', 'email', 'category', 'journal_name', 'article_type', 'file', 'image', 'word_count']

    def validate(self, attrs):
        journal_name = attrs.get("journal_name")
        category = attrs.get("category")
        expected_category = self.JOURNAL_CATEGORY_MAP.get(journal_name)

        if expected_category and category != expected_category:
            raise serializers.ValidationError(
                {
                    "category": (
                        f'"{journal_name}" must be submitted under "{expected_category}".'
                    )
                }
            )

        return attrs

    def create(self, validated_data):
        # Auto-generate title from filename since frontend doesn't send it
        if 'file' in validated_data:
            validated_data['title'] = validated_data['file'].name

        # Calculate read time (approx 200 words per minute)
        word_count = validated_data.get('word_count', 0)
        if word_count:
            validated_data['read_time'] = max(1, round(int(word_count) / 200))

        # submitted_by is passed by the view's perform_create, so we don't need to overwrite it
        # unless it's missing
        return super().create(validated_data)

class AdminPublishedArticleCreateSerializer(serializers.ModelSerializer):
    JOURNAL_CATEGORY_MAP = ArticleCreateSerializer.JOURNAL_CATEGORY_MAP

    journal_name = serializers.ChoiceField(choices=Article.JOURNAL_NAME_CHOICES)
    category = serializers.ChoiceField(choices=Article.CATEGORY_CHOICES)
    article_type = serializers.ChoiceField(choices=Article.ARTICLE_TYPE_CHOICES)

    class Meta:
        model = Article
        fields = [
            "title",
            "author_name",
            "author_email",
            "category",
            "journal_name",
            "article_type",
            "file",
            "image",
            "word_count",
        ]

    def validate(self, attrs):
        journal_name = attrs.get("journal_name")
        category = attrs.get("category")
        expected_category = self.JOURNAL_CATEGORY_MAP.get(journal_name)

        if expected_category and category != expected_category:
            raise serializers.ValidationError(
                {
                    "category": (
                        f'"{journal_name}" must be submitted under "{expected_category}".'
                    )
                }
            )

        return attrs

    def create(self, validated_data):
        word_count = validated_data.get("word_count", 0)
        if word_count:
            validated_data["read_time"] = max(1, round(int(word_count) / 200))
        return super().create(validated_data)


class ArticleListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Article
        fields = "__all__"

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "full_name", "role")


# accounts/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class EditorSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    requires_profile_image = serializers.SerializerMethodField()

    def get_profile_image(self, obj):
        if not obj.profile_image:
            return None
        request = self.context.get("request")
        url = obj.profile_image.url
        return request.build_absolute_uri(url) if request else url

    def get_requires_profile_image(self, obj):
        return obj.role == "EDITOR" and not bool(obj.profile_image)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "pen_name",
            "country",
            "mapped_journal_category",
            "profile_image",
            "requires_profile_image",
        )


# core/serializers.py
from rest_framework import serializers
from .models import SiteSettings

class SiteSettingsSerializer(serializers.ModelSerializer):

    class Meta:
        model = SiteSettings
        fields = "__all__"

class ArticleStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=["COMPLETED", "REJECTED"]
    )


class ArticlePublishSerializer(serializers.Serializer):
    publish = serializers.BooleanField()

class EditorCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("email", "full_name", "pen_name", "password", "mapped_journal_category")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(
            **validated_data,
            role="EDITOR",
            password=password
        )
        return user


class EditorCategoryMappingSerializer(serializers.ModelSerializer):
    mapped_journal_category = serializers.ChoiceField(
        choices=Article.CATEGORY_CHOICES,
        allow_blank=True,
        allow_null=True,
        required=False,
    )

    class Meta:
        model = User
        fields = ("mapped_journal_category",)


class EditorProfileImageUploadSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=True)

    class Meta:
        model = User
        fields = ("profile_image",)

    def validate_profile_image(self, image_file):
        max_size = int(1.5 * 1024 * 1024)
        if image_file.size > max_size:
            raise serializers.ValidationError("Image size must be at most 1.5 MB.")

        try:
            img = Image.open(image_file)
            width, height = img.size
        except Exception as exc:
            raise serializers.ValidationError("Invalid image file.") from exc
        finally:
            image_file.seek(0)

        if width < 64 or height < 64 or width > 500 or height > 500:
            raise serializers.ValidationError("Image dimensions must be between 64x64 and 500x500 pixels.")

        return image_file
