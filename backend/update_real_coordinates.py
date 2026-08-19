import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from rental.models import Tractor

GUJARAT_COORDINATES = {
    "sanand": (22.9868, 72.3787),
    "ahmedabad": (23.0225, 72.5714),
    "jetpur": (21.7584, 70.6276),
    "rajkot": (22.3039, 70.8022),
    "visnagar": (23.6961, 72.5488),
    "mehsana": (23.5880, 72.3693),
    "babra": (21.8488, 71.3006),
    "amreli": (21.6032, 71.2221),
    "bardoli": (21.1192, 73.1118),
    "surat": (21.1702, 72.8311),
    "anand": (22.5645, 72.9289),
    "junagadh": (21.5222, 70.4579),
    "vadodara": (22.3072, 73.1812),
    "deesa": (24.2570, 72.1822),
    "banaskantha": (24.1717, 72.4346),
    "bhavnagar": (21.7645, 72.1519),
    "jamnagar": (22.4707, 70.0577),
    "bhuj": (23.2420, 69.6669),
    "morbi": (22.8173, 70.8378),
    "dholka": (22.7234, 72.4633),
}

updated_count = 0
for tr in Tractor.objects.all():
    loc_str = f"{tr.location} {tr.district} {tr.city_village}".lower()
    matched_coord = None
    for city, coord in GUJARAT_COORDINATES.items():
        if city in loc_str:
            matched_coord = coord
            break

    if not matched_coord:
        matched_coord = (22.9868, 72.3787)

    tr.latitude = matched_coord[0]
    tr.longitude = matched_coord[1]
    tr.save(update_fields=["latitude", "longitude"])
    updated_count += 1
    print(f"Updated {tr.name} ({tr.location}) -> Lat: {tr.latitude}, Lon: {tr.longitude}")

print(f"Successfully updated real coordinates for {updated_count} tractors.")
