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
    WORK_TYPE_CHOICES = [

        ("plowing", "🌾 Land Plowing / Tillage (જમીન ખેડવા / ખેડાણ)"),
        ("transport", "🚛 Crop Transport / Trolley Haulage (પાક માલવહન / ટ્રોલી)"),
        ("rotavator", "🔄 Fine Soil Bed Prep (રોટાવેટર / માટી ભભરાવવી)"),
        ("sowing", "🌱 Sowing / Seeding (વાવણી / ઓરણી)"),
        ("harvesting", "🚜 Threshing / Harvesting (કાપણી / થ્રેશર)"),
        ("leveling", "📐 Land Leveling (જમીન સમથળ / લેવલિંગ)"),
        ("spraying", "💧 Pesticide Spraying (દવા છંટકાવ)"),
        ("general", "⚙️ General Agricultural Work (સામાન્ય ખેતીકામ)"),
    ]

    farming_work_type = models.CharField(
        max_length=50,
        choices=WORK_TYPE_CHOICES,
        default="plowing",
        blank=True
    )
    crop_name = models.CharField(max_length=100, blank=True, default="Cotton (કપાસ)")
    land_area_size = models.DecimalField(max_digits=6, decimal_places=2, default=5.0)
    land_area_unit = models.CharField(max_length=20, default="bigha")

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


    start_meter_hours = models.DecimalField(max_digits=8, decimal_places=1, default=0.0, null=True, blank=True)
    end_meter_hours = models.DecimalField(max_digits=8, decimal_places=1, default=0.0, null=True, blank=True)

    driver_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    driver_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    completion_otp = models.CharField(max_length=6, default="4892", blank=True)


    created_at = models.DateTimeField(auto_now_add=True)



    def __str__(self):
        return f"TRC{self.id:05d} - {self.customer.email} - {self.tractor.name}"