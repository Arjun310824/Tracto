from rest_framework import serializers
from .models import Payment, Payout
from bookings.serializers import BookingSerializer



class PaymentSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source="booking", read_only=True)

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class PayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payout
        fields = "__all__"
        read_only_fields = ["owner", "status", "reference_id", "created_at"]

