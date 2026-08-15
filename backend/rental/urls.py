from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import TractorViewSet, WishlistViewSet, ImplementViewSet

router = SimpleRouter()
router.register(r"tractors", TractorViewSet, basename="tractor")
router.register(r"implements", ImplementViewSet, basename="implement")
router.register(r"wishlist", WishlistViewSet, basename="wishlist")


urlpatterns = [
    path("", include(router.urls)),
]
