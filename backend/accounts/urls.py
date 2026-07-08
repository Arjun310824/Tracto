from django.urls import path
from .views import register

urlpatterns = [
    # path("test/", test_api),
    path("register/",register)
]