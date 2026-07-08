from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import UserManager


class User(AbstractUser):
    ROLE_CHOICES = (
        ("customer", "Customer"),
        ("owner", "Owner"),
        ("admin", "Admin"),
    )

    username = None

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="customer"
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    def __str__(self):
        return self.email