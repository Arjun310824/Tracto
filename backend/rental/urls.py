from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    TractorViewSet, WishlistViewSet, ImplementViewSet,
    ai_recommend_machinery_view, ai_price_advisor_view
)

router = SimpleRouter()
router.register(r"tractors", TractorViewSet, basename="tractor")
router.register(r"implements", ImplementViewSet, basename="implement")
router.register(r"wishlist", WishlistViewSet, basename="wishlist")


urlpatterns = [
    path("ai-recommend/", ai_recommend_machinery_view, name="ai-recommend-machinery"),
    path("rental/ai-recommend/", ai_recommend_machinery_view, name="rental-ai-recommend-machinery"),
    path("ai-price-advisor/", ai_price_advisor_view, name="ai-price-advisor"),
    path("rental/ai-price-advisor/", ai_price_advisor_view, name="rental-ai-price-advisor"),
    path("", include(router.urls)),
]


