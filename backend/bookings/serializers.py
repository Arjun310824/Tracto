from rest_framework import serializers
from datetime import date
from django.db.models import Q
from .models import Booking
from accounts.serializers import UserSerializer
from rental.serializers import TractorSerializer, ImplementSerializer
from reviews.models import Review


class SimpleReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "rating", "comment", "created_at"]


class BookingSerializer(serializers.ModelSerializer):
    customer_details = UserSerializer(source="customer", read_only=True)
    tractor_details = TractorSerializer(source="tractor", read_only=True)
    implement_details = ImplementSerializer(source="selected_implements", many=True, read_only=True)
    review = SimpleReviewSerializer(read_only=True)


    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = ("customer", "status", "total_amount", "created_at")

    def validate(self, attrs):
        tractor = attrs.get("tractor")
        start_date = attrs.get("start_date")
        end_date = attrs.get("end_date")
        rental_duration_type = attrs.get("rental_duration_type", "daily")
        rental_units = attrs.get("rental_units", 1)
        selected_implements = attrs.get("selected_implements", [])
        request = self.context.get("request")

        if not tractor.available or not tractor.is_approved_by_admin:
            raise serializers.ValidationError("This tractor is currently unavailable for rental.")

        if request and request.user and request.user == tractor.owner:
            raise serializers.ValidationError("Tractor owners cannot book their own tractors.")

        today = date.today()
        if start_date < today:
            raise serializers.ValidationError("Start date cannot be in the past.")

        if end_date < start_date:
            raise serializers.ValidationError("End date cannot be earlier than start date.")

        # Calculate days if daily
        days = (end_date - start_date).days + 1
        units = days if rental_duration_type == "daily" else rental_units
        attrs["rental_units"] = units

        # Base Tractor Fee
        base_fee = (tractor.rent_per_day * units) if rental_duration_type == "daily" else (tractor.rent_per_hour * units)

        # Implements Add-on Fee
        implement_fee = 0
        for impl in selected_implements:
            rate = impl.rent_per_day if rental_duration_type == "daily" else impl.rent_per_hour
            implement_fee += rate * units

        attrs["total_amount"] = base_fee + implement_fee


        # Overlap Validation
        overlapping_bookings = Booking.objects.filter(
            tractor=tractor,
            status__in=["pending", "approved", "paid"]
        ).filter(
            Q(start_date__lte=end_date) & Q(end_date__gte=start_date)
        )

        if self.instance:
            overlapping_bookings = overlapping_bookings.exclude(pk=self.instance.pk)

        if overlapping_bookings.exists():
            raise serializers.ValidationError("This tractor is not available for this particular date or time.")

        return attrs
