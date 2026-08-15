from django.db import models
from django.db.models import Avg
from accounts.models import User
from rental.models import Tractor
from bookings.models import Booking


class Review(models.Model):
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name="review"
    )
    tractor = models.ForeignKey(
        Tractor,
        on_delete=models.CASCADE,
        related_name="reviews"
    )
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reviews"
    )
    rating = models.PositiveSmallIntegerField(default=5)  # 1 to 5 stars
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review by {self.customer.email} - {self.rating}★ for {self.tractor.name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate Tractor Rating & Total Reviews
        reviews = Review.objects.filter(tractor=self.tractor)
        avg = reviews.aggregate(Avg("rating"))["rating__avg"] or 0.00
        count = reviews.count()
        self.tractor.avg_rating = round(avg, 2)
        self.tractor.total_reviews = count
        self.tractor.save()
