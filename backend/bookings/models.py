from django.db import models
from accounts.models import User
from rental.models import Tractor


class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("paid", "Paid"),
        ("rejected", "Rejected"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    DURATION_CHOICES = [
        ("daily", "Daily"),
        ("hourly", "Hourly"),
    ]

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bookings"
    )

    tractor = models.ForeignKey(
        Tractor,
        on_delete=models.CASCADE,
        related_name="bookings"
    )

    selected_implements = models.ManyToManyField("rental.Implement", blank=True, related_name="bookings")

    start_date = models.DateField()

    end_date = models.DateField()

    rental_duration_type = models.CharField(
        max_length=10,
        choices=DURATION_CHOICES,
        default="daily"
    )
    rental_units = models.PositiveIntegerField(default=1)

    purpose = models.CharField(max_length=255, blank=True, default="")
    notes = models.TextField(blank=True, default="")

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    STATUS_CHOICES = [
        ("pending", "Request Sent"),
        ("approved", "Owner Accepted"),
        ("arrived", "Arrived on Site"),
        ("in_progress", "Work In Progress"),
        ("paid", "Payment Done"),
        ("completed", "Completed"),
        ("rejected", "Rejected"),
        ("cancelled", "Cancelled"),
    ]

    DELIVERY_CHOICES = [
        ("owner_delivers", "Owner Delivers Tractor to My Farm"),
        ("customer_pickup", "Self Pickup from Owner Yard"),
    ]

    pickup_farm_location = models.CharField(max_length=255, blank=True, default="")
    delivery_type = models.CharField(max_length=30, choices=DELIVERY_CHOICES, default="owner_delivers")
    estimated_distance_km = models.DecimalField(max_digits=5, decimal_places=1, default=5.0)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )


    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"TRC{self.id:05d} - {self.customer.email} - {self.tractor.name}"