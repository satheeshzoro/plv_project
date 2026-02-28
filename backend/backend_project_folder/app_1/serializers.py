from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("email", "full_name", "password")

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
        user = authenticate(
            self.context["request"],
            email=data["email"],
            password=data["password"],
        )

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        data["user"] = user
        return data


# articles/serializers.py
from rest_framework import serializers
from .models import Article

class ArticleCreateSerializer(serializers.ModelSerializer):
    # Map frontend fields to backend model fields
    full_name = serializers.CharField(source='author_name')
    email = serializers.EmailField(source='author_email')

    class Meta:
        model = Article
        fields = ['full_name', 'email', 'category', 'article_type', 'file', 'image', 'word_count']

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

    class Meta:
        model = User
        fields = ("id", "email", "full_name", "pen_name")


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
        fields = ("email", "full_name", "pen_name", "password")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(
            **validated_data,
            role="EDITOR",
            password=password
        )
        return user
