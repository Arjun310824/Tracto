import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from accounts.models import User
from rental.models import Tractor
from bookings.models import Booking
from reviews.models import Review
from datetime import date, timedelta

def seed_reviews():
    print("Seeding sample reviews...")

    customer = User.objects.filter(role="customer").first()
    if not customer:
        print("No customer found to seed reviews.")
        return

    tractors = Tractor.objects.all()

    sample_reviews_text = [
        (5, "Excellent tractor! Very powerful 45 HP engine, handled deep land plowing smoothly. Owner Ramesh bhai was very polite."),
        (5, "Top class condition tractor. Clean, well maintained, and fuel efficient. High rotavator performance."),
        (4, "Great experience renting this tractor. Delivered on time in Sanand. Highly recommended for harvesting."),
        (5, "Outstanding power and double clutch response. Land leveling completed 2 hours faster than expected."),
        (4, "Very reliable farm equipment. Good hydraulic lift capacity and smooth steering."),
    ]

    for idx, tractor in enumerate(tractors):
        # Create completed booking first so review can be attached
        booking, _ = Booking.objects.get_or_create(
            customer=customer,
            tractor=tractor,
            start_date=date.today() - timedelta(days=10 + idx),
            end_date=date.today() - timedelta(days=8 + idx),
            defaults={
                "rental_duration_type": "daily",
                "rental_units": 2,
                "purpose": "Farm Plowing",
                "total_amount": tractor.rent_per_day * 2,
                "status": "completed"
            }
        )
        booking.status = "completed"
        booking.save()

        # Add 2 reviews per tractor
        r1_star, r1_text = sample_reviews_text[idx % len(sample_reviews_text)]
        r2_star, r2_text = sample_reviews_text[(idx + 1) % len(sample_reviews_text)]

        Review.objects.get_or_create(
            booking=booking,
            defaults={
                "tractor": tractor,
                "customer": customer,
                "rating": r1_star,
                "comment": r1_text
            }
        )

    print("Finished seeding reviews successfully!")

if __name__ == "__main__":
    seed_reviews()
