from django.db import models
from accounts.models import User


class Tractor(models.Model):
    FUEL_CHOICES = (
        ("diesel", "Diesel"),
        ("petrol", "Petrol"),
        ("electric", "Electric"),
        ("hybrid", "Hybrid"),
    )

    TRANSMISSION_CHOICES = (
        ("manual", "Manual"),
        ("automatic", "Automatic"),
        ("hydrostatic", "Hydrostatic"),
    )

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tractors"
    )

    name = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    image = models.ImageField(
        upload_to="tractors/",
        blank=True,
        null=True
    )

    horsepower = models.PositiveIntegerField(default=45)
    manufacturing_year = models.PositiveIntegerField(default=2022)
    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES, default="diesel")
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES, default="manual")

    rent_per_hour = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=250.00
    )
    rent_per_day = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    location = models.CharField(max_length=150)
    state = models.CharField(max_length=100, default="Gujarat")
    district = models.CharField(max_length=100, default="Ahmedabad")
    city_village = models.CharField(max_length=100, blank=True, default="")
    pincode = models.CharField(max_length=10, blank=True, default="")

    latitude = models.DecimalField(max_digits=9, decimal_places=6, default=22.9868)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, default=72.3787)

    description = models.TextField(blank=True)
    available = models.BooleanField(default=True)

    is_approved_by_admin = models.BooleanField(default=True)

    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.brand} {self.model} ({self.name})"


class TractorImage(models.Model):
    tractor = models.ForeignKey(
        Tractor,
        on_delete=models.CASCADE,
        related_name="additional_images"
    )
    image = models.ImageField(upload_to="tractors/gallery/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.tractor.name}"


class Wishlist(models.Model):
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="wishlist"
    )
    tractor = models.ForeignKey(
        Tractor,
        on_delete=models.CASCADE,
        related_name="favorited_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("customer", "tractor")

    def __str__(self):
        return f"{self.customer.email} -> {self.tractor.name}"


class Implement(models.Model):
    CATEGORY_CHOICES = (
        ("rotavator", "Rotavator"),
        ("cultivator", "Cultivator / Plought"),
        ("trailer", "Trailer / Trolley"),
        ("harvester", "Combine Harvester / Thresher"),
        ("seeder", "Seed Drill / Seeder"),
        ("leveler", "Laser Land Leveler"),
        ("other", "Other Equipment"),
    )

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="implements")
    tractor = models.ForeignKey(Tractor, on_delete=models.SET_NULL, null=True, blank=True, related_name="attached_implements")
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="rotavator")
    rent_per_hour = models.DecimalField(max_digits=10, decimal_places=2, default=100.00)
    rent_per_day = models.DecimalField(max_digits=10, decimal_places=2, default=600.00)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="implements/", blank=True, null=True)
    available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


    