from rest_framework import serializers
from .models import Review
from accounts.serializers import UserSerializer
from rental.serializers import TractorSerializer


class ReviewSerializer(serializers.ModelSerializer):
    customer_details = UserSerializer(source="customer", read_only=True)
    tractor_details = TractorSerializer(source="tractor", read_only=True)

    class Meta:
        model = Review
        fields = "__all__"
        read_only_fields = ["customer", "tractor", "created_at"]


    def validate(self, attrs):
        booking = attrs.get("booking")
        request = self.context.get("request")

        if request and request.user != booking.customer:
            raise serializers.ValidationError("Only the customer who booked this tractor can submit a review.")

        if booking.status not in ["completed", "paid"]:
            raise serializers.ValidationError("Reviews can only be submitted for completed or paid bookings.")

        if hasattr(booking, "review"):
            raise serializers.ValidationError("A review has already been submitted for this booking.")

        attrs["tractor"] = booking.tractor
        attrs["customer"] = booking.customer
        return attrs
