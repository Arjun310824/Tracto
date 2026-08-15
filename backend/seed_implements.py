import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from rental.models import Tractor, Implement
from accounts.models import User

owner = User.objects.filter(role="owner").first()
tractors = Tractor.objects.all()

implements_data = [
    {
        "name": "Heavy Duty 36-Blade Rotavator",
        "category": "rotavator",
        "rent_per_hour": 150.00,
        "rent_per_day": 800.00,
        "description": "High performance multi-speed rotavator for fine soil tillage and seedbed preparation.",
    },
    {
        "name": "9-Tyne Rigid Cultivator / Plough",
        "category": "cultivator",
        "rent_per_hour": 100.00,
        "rent_per_day": 500.00,
        "description": "Heavy duty steel cultivator suitable for deep soil aeration and root removal.",
    },
    {
        "name": "Tipping Hydraulic Trailer (5 Ton Capacity)",
        "category": "trailer",
        "rent_per_hour": 120.00,
        "rent_per_day": 600.00,
        "description": "Robust dual axle hydraulic tipping trailer for farm crop transport and heavy hauling.",
    },
    {
        "name": "Automatic Zero Till Seed Drill",
        "category": "seeder",
        "rent_per_hour": 180.00,
        "rent_per_day": 900.00,
        "description": "Precision seed & fertilizer drill for wheat, groundnut, and cotton sowing.",
    },
    {
        "name": "Laser Guided Land Leveler",
        "category": "leveler",
        "rent_per_hour": 250.00,
        "rent_per_day": 1200.00,
        "description": "Laser transmitter guided leveler for perfect field leveling and water conservation.",
    },
]

for t in tractors:
    for data in implements_data:
        impl, created = Implement.objects.get_or_create(
            owner=t.owner,
            tractor=t,
            name=f"{data['name']} ({t.brand})",
            defaults={
                "category": data["category"],
                "rent_per_hour": data["rent_per_hour"],
                "rent_per_day": data["rent_per_day"],
                "description": data["description"],
                "available": True,
            }
        )

print(f"Successfully seeded {Implement.objects.count()} agricultural implements!")
