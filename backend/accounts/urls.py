from django.urls import path
from .views import register, LoginAPIView

urlpatterns = [
    path("register/", register),
    path("login/", LoginAPIView.as_view(), name="login"),
]