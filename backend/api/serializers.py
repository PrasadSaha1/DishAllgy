from django.contrib.auth.models import User
from rest_framework import serializers
import re
# from .models import Note

class UserSerializer(serializers.ModelSerializer):
    confirmPassword = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, default=" ", allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "username", "password", "confirmPassword", "email"]
        extra_kwargs = {"password": {"write_only": True},             
                        "email": {"required": False, "allow_blank": True},}

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value
    
    def validate_email(self, data):
        if data.strip() == "":
            return data
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(pattern, data):
            raise serializers.ValidationError("Invalid email format.")
        return data

    def validate(self, data):
        print(data)
        if data["password"] != data["confirmPassword"]:
            print("Passwords do not match.")
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop("confirmPassword")
        user = User.objects.create_user(**validated_data)
        return user

