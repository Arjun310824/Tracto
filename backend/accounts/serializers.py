from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True)

    class Meta:
        model=User
        fields=[
            "first_name",
            "last_name",
            "email",
            "phone",
            "role",
            "password"
        ]
def create(self,validated_data):
    password=validated_data.pop("Password")
    user=User(**validated_data)
    user.set_password(password)
    user.save()

    return user