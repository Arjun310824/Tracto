from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Tractor, TractorImage, Wishlist, Implement


class TractorImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = TractorImage
        fields = ["id", "image", "created_at"]


class ImplementSerializer(serializers.ModelSerializer):

    owner_details = UserSerializer(source="owner", read_only=True)

    class Meta:
        model = Implement
        fields = "__all__"
        read_only_fields = ["owner", "created_at"]


class TractorSerializer(serializers.ModelSerializer):
    owner_details = UserSerializer(source="owner", read_only=True)
    additional_images = TractorImageSerializer(many=True, read_only=True)
    attached_implements = ImplementSerializer(many=True, read_only=True)
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = Tractor
        fields = "__all__"
        read_only_fields = ["owner", "avg_rating", "total_reviews", "created_at"]

    def validate_image(self, value):
        if value:
            # 5MB size limit check
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Image file size cannot exceed 5MB.")
            ext = value.name.split(".")[-1].lower()
            if ext not in ["jpg", "jpeg", "png", "webp"]:
                raise serializers.ValidationError("Only JPG, JPEG, PNG, and WEBP image files are allowed.")
        return value

    def get_is_favorite(self, obj):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            return Wishlist.objects.filter(customer=request.user, tractor=obj).exists()
        return False


class WishlistSerializer(serializers.ModelSerializer):
    tractor_details = TractorSerializer(source="tractor", read_only=True)

    class Meta:
        model = Wishlist
        fields = ["id", "customer", "tractor", "tractor_details", "created_at"]
        read_only_fields = ["customer", "created_at"]
