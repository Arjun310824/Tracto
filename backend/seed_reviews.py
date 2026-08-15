import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from accounts.models import User
from rental.models import Tractor
from bookings.models import Booking
from reviews.models import Review
from datetime import date, timedelta

def seed_all_tractor_reviews():
    print("Seeding reviews for all tractors...")

    customers = list(User.objects.filter(role="customer"))
    if not customers:
        print("No customers found.")
        return

    tractors = Tractor.objects.all()

    gu_en_reviews = [
        (5, "ખૂબ જ શક્તિશાળી ટ્રેક્ટર અને ઓનર દ્વારા સમયસર ડિલિવરી. ખેતરની ખેડ માટે ઉત્તમ. (Very powerful engine and timely delivery by owner. Highly satisfied for farm plowing.)"),
        (5, "Top class condition tractor. Clean, well maintained, and fuel efficient. High rotavator performance. (રોટાવેટર અને બળતણ માટે ખૂબ જ સારું.)"),
        (4, "ખેડ અને વાવણી માટે સારું ટ્રેક્ટર. કલાક દીઠ વ્યાજબી ભાડું. (Good experience renting for sowing. Reasonable hourly rate.)"),
        (5, "Outstanding power and double clutch response. Land leveling completed 2 hours faster than expected."),
        (4, "Very reliable farm equipment. Good hydraulic lift capacity and smooth steering. (ખેતીના ઓજારો સાથે સારું પરફોર્મન્સ.)"),
        (5, "ખૂબ જ નમ્ર માલિક અને ઉત્તમ ટ્રેક્ટર સર્વિસ. (Extremely polite owner and excellent tractor condition.)"),
    ]

    count = 0
    for idx, tractor in enumerate(tractors):
        customer = customers[idx % len(customers)]
        
        # Create completed booking 1
        b1, _ = Booking.objects.get_or_create(
            customer=customer,
            tractor=tractor,
            start_date=date.today() - timedelta(days=15 + idx * 2),
            end_date=date.today() - timedelta(days=13 + idx * 2),
            defaults={
                "rental_duration_type": "daily",
                "rental_units": 2,
                "purpose": "Land Plowing",
                "total_amount": tractor.rent_per_day * 2,
                "status": "completed"
            }
        )
        b1.status = "completed"
        b1.save()

        star1, text1 = gu_en_reviews[idx % len(gu_en_reviews)]
        r1, created1 = Review.objects.get_or_create(
            booking=b1,
            defaults={
                "tractor": tractor,
                "customer": customer,
                "rating": star1,
                "comment": text1
            }
        )
        if created1:
            count += 1

        # Create completed booking 2
        customer2 = customers[(idx + 1) % len(customers)]
        b2, _ = Booking.objects.get_or_create(
            customer=customer2,
            tractor=tractor,
            start_date=date.today() - timedelta(days=5 + idx * 2),
            end_date=date.today() - timedelta(days=4 + idx * 2),
            defaults={
                "rental_duration_type": "hourly",
                "rental_units": 6,
                "purpose": "Rotavator Work",
                "total_amount": tractor.rent_per_hour * 6,
                "status": "completed"
            }
        )
        b2.status = "completed"
        b2.save()

        star2, text2 = gu_en_reviews[(idx + 3) % len(gu_en_reviews)]
        r2, created2 = Review.objects.get_or_create(
            booking=b2,
            defaults={
                "tractor": tractor,
                "customer": customer2,
                "rating": star2,
                "comment": text2
            }
        )
        if created2:
            count += 1

        # Force update tractor rating & review count
        reviews = Review.objects.filter(tractor=tractor)
        avg = sum(r.rating for r in reviews) / max(1, len(reviews))
        tractor.avg_rating = round(avg, 2)
        tractor.total_reviews = len(reviews)
        tractor.save()

    print(f"Finished seeding! Added {count} new reviews across all {len(tractors)} tractors.")

if __name__ == "__main__":
    seed_all_tractor_reviews()
