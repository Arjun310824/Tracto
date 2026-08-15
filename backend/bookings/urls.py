from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import BookingViewSet


router = SimpleRouter()
router.register(r"bookings", BookingViewSet, basename="booking")

urlpatterns = [
    path("", include(router.urls)),
]