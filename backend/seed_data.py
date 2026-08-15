import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from accounts.models import User
from rental.models import Tractor

def seed():
    print("Seeding TRACTO database...")

    # 1. Admin
    admin, created = User.objects.get_or_create(
        email="admin@tracto.com",
        defaults={
            "first_name": "System",
            "last_name": "Admin",
            "phone": "9876543210",
            "role": "admin",
            "is_staff": True,
            "is_superuser": True,
            "state": "Gujarat",
            "district": "Ahmedabad"
        }
    )
    if created:
        admin.set_password("admin123")
        admin.save()
        print("Created admin: admin@tracto.com / admin123")

    # 2. Owner
    owner, created = User.objects.get_or_create(
        email="owner@tracto.com",
        defaults={
            "first_name": "Ramesh",
            "last_name": "Patel",
            "phone": "9825012345",
            "role": "owner",
            "state": "Gujarat",
            "district": "Ahmedabad",
            "village": "Sanand"
        }
    )
    if created:
        owner.set_password("owner123")
        owner.save()
        print("Created owner: owner@tracto.com / owner123")

    # 3. Customer
    customer, created = User.objects.get_or_create(
        email="customer@tracto.com",
        defaults={
            "first_name": "Arjun",
            "last_name": "Jadav",
            "phone": "9909012345",
            "role": "customer",
            "state": "Gujarat",
            "district": "Ahmedabad",
            "village": "Dholka"
        }
    )
    if created:
        customer.set_password("customer123")
        customer.save()
        print("Created customer: customer@tracto.com / customer123")

    # 4. Sample Tractors
    tractors_data = [
        {
            "name": "Mahindra 575 DI",
            "brand": "Mahindra",
            "model": "575 DI Power Plus",
            "horsepower": 45,
            "manufacturing_year": 2023,
            "fuel_type": "diesel",
            "transmission": "manual",
            "rent_per_hour": 300,
            "rent_per_day": 2500,
            "location": "Sanand, Ahmedabad",
            "state": "Gujarat",
            "district": "Ahmedabad",
            "city_village": "Sanand",
            "pincode": "382110",
            "description": "Heavy duty 45 HP Mahindra tractor with rotavator attachment available for farm plowing and land preparation.",
            "available": True,
            "is_approved_by_admin": True,
            "avg_rating": 4.80,
            "total_reviews": 12,
        },
        {
            "name": "Swaraj 744 FE",
            "brand": "Swaraj",
            "model": "744 FE Multi Speed",
            "horsepower": 48,
            "manufacturing_year": 2022,
            "fuel_type": "diesel",
            "transmission": "manual",
            "rent_per_hour": 350,
            "rent_per_day": 2800,
            "location": "Dholka, Ahmedabad",
            "state": "Gujarat",
            "district": "Ahmedabad",
            "city_village": "Dholka",
            "pincode": "382220",
            "description": "High performance 48 HP Swaraj tractor, fuel efficient with double clutch and oil immersed brakes.",
            "available": True,
            "is_approved_by_admin": True,
            "avg_rating": 4.60,
            "total_reviews": 8,
        },
        {
            "name": "John Deere 5050 D",
            "brand": "John Deere",
            "model": "5050 D 4WD",
            "horsepower": 50,
            "manufacturing_year": 2024,
            "fuel_type": "diesel",
            "transmission": "manual",
            "rent_per_hour": 400,
            "rent_per_day": 3200,
            "location": "Kadi, Mehsana",
            "state": "Gujarat",
            "district": "Mehsana",
            "city_village": "Kadi",
            "pincode": "382715",
            "description": "Premium 4 Wheel Drive John Deere tractor with power steering and high lifting capacity for heavy agricultural work.",
            "available": True,
            "is_approved_by_admin": True,
            "avg_rating": 4.90,
            "total_reviews": 15,
        },
        {
            "name": "Sonalika DI 750 III",
            "brand": "Sonalika",
            "model": "DI 750 III RX",
            "horsepower": 55,
            "manufacturing_year": 2023,
            "fuel_type": "diesel",
            "transmission": "manual",
            "rent_per_hour": 450,
            "rent_per_day": 3500,
            "location": "Anand City",
            "state": "Gujarat",
            "district": "Anand",
            "city_village": "Anand",
            "pincode": "388001",
            "description": "55 HP powerful Sonalika tractor ideal for heavy haulage, threshing, and deep cultivation.",
            "available": True,
            "is_approved_by_admin": True,
            "avg_rating": 4.70,
            "total_reviews": 6,
        },
        {
            "name": "Farmtrac 60 Powermaxx",
            "brand": "Farmtrac",
            "model": "60 EPI Powermaxx",
            "horsepower": 55,
            "manufacturing_year": 2023,
            "fuel_type": "diesel",
            "transmission": "manual",
            "rent_per_hour": 420,
            "rent_per_day": 3300,
            "location": "Nadiad, Kheda",
            "state": "Gujarat",
            "district": "Kheda",
            "city_village": "Nadiad",
            "pincode": "387001",
            "description": "Reliable Farmtrac tractor equipped with modern hydraulics and LED headlamps.",
            "available": True,
            "is_approved_by_admin": True,
            "avg_rating": 4.50,
            "total_reviews": 5,
        }
    ]

    for t_data in tractors_data:
        tractor, t_created = Tractor.objects.get_or_create(
            name=t_data["name"],
            owner=owner,
            defaults=t_data
        )
        if t_created:
            print(f"Created tractor: {tractor.name}")

    print("Seeding finished successfully!")

if __name__ == "__main__":
    seed()
