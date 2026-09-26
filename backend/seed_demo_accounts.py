import os
import django
from datetime import date, timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from accounts.models import User
from rental.models import Tractor, Implement, TractorImage
from bookings.models import Booking
from payments.models import Payment
from reviews.models import Review

print("Seeding demo owners, customers, tractors, implements, and bookings...")

# 1. Create Owners
owners_data = [
    {"email": "owner@tracto.com", "first_name": "Ramesh", "last_name": "Patel", "phone": "9876543210", "village": "Sanand", "district": "Ahmedabad", "state": "Gujarat", "pincode": "382110"},
    {"email": "owner_jignesh@tracto.com", "first_name": "Jignesh", "last_name": "Shah", "phone": "9825012345", "village": "Jetpur", "district": "Rajkot", "state": "Gujarat", "pincode": "360370"},
    {"email": "owner_bhavesh@tracto.com", "first_name": "Bhavesh", "last_name": "Chaudhary", "phone": "9909054321", "village": "Visnagar", "district": "Mehsana", "state": "Gujarat", "pincode": "384315"},
    {"email": "owner_mansukh@tracto.com", "first_name": "Mansukhbhai", "last_name": "Vaghani", "phone": "9712398765", "village": "Babra", "district": "Amreli", "state": "Gujarat", "pincode": "365421"},
    {"email": "owner_sanjay@tracto.com", "first_name": "Sanjay", "last_name": "Parmar", "phone": "9426011223", "village": "Bardoli", "district": "Surat", "state": "Gujarat", "pincode": "394601"},
]

created_owners = []
for o in owners_data:
    user, created = User.objects.get_or_create(
        email=o["email"],
        defaults={
            "first_name": o["first_name"],
            "last_name": o["last_name"],
            "role": "owner",
            "phone": o["phone"],
            "village": o["village"],
            "district": o["district"],
            "state": o["state"],
            "pincode": o["pincode"],
        }
    )
    if created:
        user.set_password("owner123")
        user.save()
    created_owners.append(user)

print(f"Created/Verified {len(created_owners)} Owner accounts.")

# 2. Create Customers
customers_data = [
    {"email": "customer@tracto.com", "first_name": "Arjun", "last_name": "Jadav", "phone": "9123456789", "village": "Dholka", "district": "Ahmedabad", "state": "Gujarat", "pincode": "382220"},
    {"email": "customer_vijay@tracto.com", "first_name": "Vijay", "last_name": "Rathod", "phone": "9898011223", "village": "Petlad", "district": "Anand", "state": "Gujarat", "pincode": "388450"},
    {"email": "customer_rahul@tracto.com", "first_name": "Rahul", "last_name": "Solanki", "phone": "9723044556", "village": "Keshod", "district": "Junagadh", "state": "Gujarat", "pincode": "362220"},
    {"email": "customer_harshad@tracto.com", "first_name": "Harshad", "last_name": "Patel", "phone": "9408077889", "village": "Dabhoi", "district": "Vadodara", "state": "Gujarat", "pincode": "391110"},
    {"email": "customer_kiran@tracto.com", "first_name": "Kiran", "last_name": "Rabari", "phone": "9662033445", "village": "Deesa", "district": "Banaskantha", "state": "Gujarat", "pincode": "385535"},
]

created_customers = []
for c in customers_data:
    user, created = User.objects.get_or_create(
        email=c["email"],
        defaults={
            "first_name": c["first_name"],
            "last_name": c["last_name"],
            "role": "customer",
            "phone": c["phone"],
            "village": c["village"],
            "district": c["district"],
            "state": c["state"],
            "pincode": c["pincode"],
        }
    )
    if created:
        user.set_password("customer123")
        user.save()
    created_customers.append(user)

print(f"Created/Verified {len(created_customers)} Customer accounts.")

# 2.1 Create Admin User
admin_user, admin_created = User.objects.get_or_create(
    email="admin@tracto.com",
    defaults={
        "first_name": "Tracto",
        "last_name": "Admin",
        "role": "admin",
        "is_staff": True,
        "is_superuser": True,
        "phone": "9999999999",
        "village": "Gandhinagar",
        "district": "Gandhinagar",
        "state": "Gujarat",
        "pincode": "382010",
    }
)
if admin_created:
    admin_user.set_password("admin123")
    admin_user.save()
print("Created/Verified Admin account (admin@tracto.com).")

# 3. Create Tractors and Implements for Owners
tractors_seed = [
    {
        "owner": created_owners[0],
        "name": "Mahindra 575 DI Power Plus",
        "brand": "Mahindra",
        "model": "575 DI",
        "horsepower": 45,
        "manufacturing_year": 2023,
        "rent_per_day": 2500.00,
        "rent_per_hour": 250.00,
        "location": "Sanand, Ahmedabad",
        "district": "Ahmedabad",
        "city_village": "Sanand",
        "pincode": "382110",
        "description": "Heavy duty 45 HP Mahindra tractor suitable for land tillage, rotavator, and deep plowing.",
        "image": "tractors/mahindra_gen.png",
    },
    {
        "owner": created_owners[1],
        "name": "Swaraj 744 FE Super",
        "brand": "Swaraj",
        "model": "744 FE",
        "horsepower": 48,
        "manufacturing_year": 2022,
        "rent_per_day": 2800.00,
        "rent_per_hour": 280.00,
        "location": "Jetpur, Rajkot",
        "district": "Rajkot",
        "city_village": "Jetpur",
        "pincode": "360370",
        "description": "Powerful 48 HP Swaraj tractor for cotton and groundnut farming with high fuel efficiency.",
        "image": "tractors/swaraj_gen.png",
    },
    {
        "owner": created_owners[2],
        "name": "John Deere 5050 D 4WD",
        "brand": "John Deere",
        "model": "5050 D",
        "horsepower": 50,
        "manufacturing_year": 2024,
        "rent_per_day": 3200.00,
        "rent_per_hour": 320.00,
        "location": "Visnagar, Mehsana",
        "district": "Mehsana",
        "city_village": "Visnagar",
        "pincode": "384315",
        "description": "4-Wheel Drive premium 50 HP John Deere tractor equipped with power steering and dual clutch.",
        "image": "tractors/johndeere_gen.png",
    },
    {
        "owner": created_owners[3],
        "name": "Sonalika DI 750 III RX",
        "brand": "Sonalika",
        "model": "DI 750 III",
        "horsepower": 55,
        "manufacturing_year": 2023,
        "rent_per_day": 3000.00,
        "rent_per_hour": 300.00,
        "location": "Babra, Amreli",
        "district": "Amreli",
        "city_village": "Babra",
        "pincode": "365421",
        "description": "High torque 55 HP Sonalika tractor ideal for heavy hauling, harvesting, and laser leveling.",
        "image": "tractors/sonalika_gen.png",
    },
    {
        "owner": created_owners[4],
        "name": "Farmtrac 60 Powermaxx",
        "brand": "Farmtrac",
        "model": "60 Powermaxx",
        "horsepower": 50,
        "manufacturing_year": 2023,
        "rent_per_day": 2900.00,
        "rent_per_hour": 290.00,
        "location": "Bardoli, Surat",
        "district": "Surat",
        "city_village": "Bardoli",
        "pincode": "394601",
        "description": "50 HP Farmtrac tractor engineered for sugarcane fields and heavy trolley transport.",
        "image": "tractors/farmtrac_gen.png",
    },
]

created_tractors = []
for t in tractors_seed:
    tr, created = Tractor.objects.get_or_create(
        name=t["name"],
        defaults={
            "owner": t["owner"],
            "brand": t["brand"],
            "model": t["model"],
            "horsepower": t["horsepower"],
            "manufacturing_year": t["manufacturing_year"],
            "rent_per_day": t["rent_per_day"],
            "rent_per_hour": t["rent_per_hour"],
            "location": t["location"],
            "district": t["district"],
            "city_village": t["city_village"],
            "pincode": t["pincode"],
            "description": t["description"],
            "image": t["image"],
            "available": True,
            "is_approved_by_admin": True,
            "avg_rating": 4.8,
            "total_reviews": 3,
        }
    )
    created_tractors.append(tr)

print(f"Created/Verified {len(created_tractors)} tractors across different owners.")

# 4. Attach Implements
for tr in created_tractors:
    Implement.objects.get_or_create(
        owner=tr.owner,
        tractor=tr,
        name=f"Shaktiman 36-Blade Rotavator ({tr.brand})",
        defaults={
            "category": "rotavator",
            "rent_per_day": 800.00,
            "rent_per_hour": 150.00,
            "description": "High performance 6-feet rotavator for fine soil tillage.",
            "available": True,
        }
    )
    Implement.objects.get_or_create(
        owner=tr.owner,
        tractor=tr,
        name=f"9-Tyne Heavy Cultivator ({tr.brand})",
        defaults={
            "category": "cultivator",
            "rent_per_day": 500.00,
            "rent_per_hour": 100.00,
            "description": "Steel cultivator for deep soil aeration and weeding.",
            "available": True,
        }
    )

print("Attached implements to owner tractors.")

# 5. Create Sample Bookings and Payments
today = date.today()

booking_samples = [
    {
        "customer": created_customers[0],
        "tractor": created_tractors[0],
        "start_date": today + timedelta(days=1),
        "end_date": today + timedelta(days=3),
        "units": 3,
        "status": "approved",
        "purpose": "Cotton field soil plowing and rotavator work",
    },
    {
        "customer": created_customers[1],
        "tractor": created_tractors[1],
        "start_date": today - timedelta(days=5),
        "end_date": today - timedelta(days=2),
        "units": 4,
        "status": "completed",
        "purpose": "Groundnut sowing and field preparation",
    },
    {
        "customer": created_customers[2],
        "tractor": created_tractors[2],
        "start_date": today + timedelta(days=10),
        "end_date": today + timedelta(days=12),
        "units": 3,
        "status": "pending",
        "purpose": "Wheat land leveling and seeding",
    },
]

for b in booking_samples:
    total = b["tractor"].rent_per_day * b["units"]
    booking, created = Booking.objects.get_or_create(
        customer=b["customer"],
        tractor=b["tractor"],
        start_date=b["start_date"],
        end_date=b["end_date"],
        defaults={
            "rental_duration_type": "daily",
            "rental_units": b["units"],
            "purpose": b["purpose"],
            "total_amount": total,
            "status": b["status"],
        }
    )
    if b["status"] == "completed":
        Payment.objects.get_or_create(
            booking=booking,
            defaults={
                "razorpay_order_id": f"order_demo_{booking.id}",
                "razorpay_payment_id": f"pay_demo_{booking.id}",
                "amount": total,
                "status": "success",
                "payment_method": "Razorpay Sandbox",
            }
        )
        Review.objects.get_or_create(
            booking=booking,
            customer=booking.customer,
            tractor=booking.tractor,
            defaults={
                "rating": 5,
                "comment": "Excellent tractor performance and prompt delivery by the owner. Very satisfied!",
            }
        )

print("Successfully seeded demo accounts, tractors, implements, bookings, payments, and reviews!")
