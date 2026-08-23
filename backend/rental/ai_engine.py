import math
from .models import Tractor, Implement


# Crop Requirements & Task Profiles Database
CROP_PROFILES = {
    "cotton": {"name": "Cotton (કપાસ)", "recommended_implements": ["cultivator", "rotavator", "seeder"], "base_hp": 45, "soil_factor": 1.1},
    "wheat": {"name": "Wheat (ઘઉં)", "recommended_implements": ["rotavator", "seeder", "harvester"], "base_hp": 40, "soil_factor": 1.0},
    "groundnut": {"name": "Groundnut (મગફળી)", "recommended_implements": ["cultivator", "leveler", "seeder"], "base_hp": 35, "soil_factor": 1.0},
    "sugarcane": {"name": "Sugarcane (શેરડી)", "recommended_implements": ["cultivator", "trailer", "rotavator"], "base_hp": 55, "soil_factor": 1.3},
    "paddy": {"name": "Paddy / Rice (ડાંગર)", "recommended_implements": ["rotavator", "harvester", "leveler"], "base_hp": 45, "soil_factor": 1.25},
    "vegetables": {"name": "Vegetables (શાકભાજી)", "recommended_implements": ["rotavator", "seeder"], "base_hp": 30, "soil_factor": 0.9},
    "general": {"name": "General Farming", "recommended_implements": ["cultivator", "rotavator", "trailer"], "base_hp": 40, "soil_factor": 1.0},
}

TASK_PROFILES = {
    "plowing": {"name": "Deep Plowing / Tilling", "hp_multiplier": 1.2, "hours_per_acre": 1.2, "category": "cultivator"},
    "rotavating": {"name": "Rotavation / Soil Finishing", "hp_multiplier": 1.15, "hours_per_acre": 0.8, "category": "rotavator"},
    "seeding": {"name": "Sowing & Seeding", "hp_multiplier": 0.9, "hours_per_acre": 0.6, "category": "seeder"},
    "harvesting": {"name": "Harvesting & Threshing", "hp_multiplier": 1.3, "hours_per_acre": 1.5, "category": "harvester"},
    "leveling": {"name": "Land Leveling", "hp_multiplier": 1.1, "hours_per_acre": 1.0, "category": "leveler"},
    "transport": {"name": "Trolley / Haulage", "hp_multiplier": 1.0, "hours_per_acre": 0.5, "category": "trailer"},
}

SOIL_FACTORS = {
    "soft": 0.9,      # Sandy / Light Soil
    "medium": 1.0,    # Loam / Medium Black Soil
    "hard": 1.25,     # Heavy Clay / Hard Black Soil
}


def calculate_ai_machinery_recommendation(crop_type, field_size_acres, soil_type, task_purpose, district=None):
    """
    AI Matcher Engine: Matches tractors & implements to agricultural needs.
    """
    try:
        field_acres = float(field_size_acres)
        if field_acres <= 0:
            field_acres = 5.0
    except (ValueError, TypeError):
        field_acres = 5.0

    crop = CROP_PROFILES.get(str(crop_type or 'general').lower(), CROP_PROFILES["general"])
    task = TASK_PROFILES.get(str(task_purpose or 'plowing').lower(), TASK_PROFILES["plowing"])
    soil_mult = SOIL_FACTORS.get(str(soil_type or 'medium').lower(), 1.0)


    # Required HP calculation logic
    target_hp = crop["base_hp"] * task["hp_multiplier"] * soil_mult
    if field_acres > 15:
        target_hp += 15
    elif field_acres > 8:
        target_hp += 8

    # Fetch available approved tractors
    tractors = Tractor.objects.filter(is_approved_by_admin=True, available=True)
    if district:
        district_tractors = tractors.filter(district__icontains=district)
        if district_tractors.exists():
            tractors = district_tractors

    recommendations = []

    for t in tractors:
        hp = t.horsepower
        
        # 1. HP Compatibility Score (0 - 40 pts)
        hp_diff = abs(hp - target_hp)
        if hp_diff <= 5:
            hp_score = 40
        elif hp_diff <= 15:
            hp_score = 30
        elif hp_diff <= 25:
            hp_score = 20
        else:
            hp_score = 10

        # 2. Rating & Review Score (0 - 25 pts)
        rating_score = float(t.avg_rating) * 5.0  # 5 star = 25 pts

        # 3. Value for Money Score (0 - 20 pts)
        rent = float(t.rent_per_hour or 250)
        if rent < 300:
            price_score = 20
        elif rent < 500:
            price_score = 15
        else:
            price_score = 10

        # 4. Attached Implements Bonus (0 - 15 pts)
        implements = Implement.objects.filter(tractor=t, available=True)
        matching_implements = [imp for imp in implements if imp.category == task["category"] or imp.category in crop["recommended_implements"]]
        implement_score = 15 if len(matching_implements) > 0 else (10 if implements.exists() else 0)

        total_match_score = min(100, int(hp_score + rating_score + price_score + implement_score))

        # Estimation Calculations
        est_hours = max(1.0, round(field_acres * task["hours_per_acre"] * (target_hp / max(30, hp)) * soil_mult, 1))
        est_fuel_liters = round(est_hours * (hp * 0.17), 1)  # Average 0.17L per HP per hour
        est_total_cost = round(est_hours * float(t.rent_per_hour), 2)

        # AI Reasoning text generation (Bilingual)
        reason_en = f"Recommended {hp} HP {t.brand} tractor for {field_acres} acres of {crop['name'].split(' ')[0]}. Expected completion in ~{est_hours} hrs."
        reason_gu = f"{field_acres} એકર {crop['name']} માટે {hp} HP શક્તિ ધરાવતું શ્રેષ્ઠ ટ્રેક્ટર. અંદાજિત સમય ~{est_hours} કલાક."

        recommendations.append({
            "tractor_id": t.id,
            "name": t.name,
            "brand": t.brand,
            "model": t.model,
            "horsepower": t.horsepower,
            "rent_per_hour": float(t.rent_per_hour),
            "rent_per_day": float(t.rent_per_day),
            "image": t.image.url if t.image else None,
            "avg_rating": float(t.avg_rating),
            "district": t.district,
            "match_score": total_match_score,
            "estimated_hours": est_hours,
            "estimated_fuel_liters": est_fuel_liters,
            "estimated_total_cost": est_total_cost,
            "matching_implements": [
                {"id": imp.id, "name": imp.name, "category": imp.category, "rent_per_hour": float(imp.rent_per_hour)}
                for imp in matching_implements
            ],
            "reason_en": reason_en,
            "reason_gu": reason_gu,
        })

    # Sort by match score descending
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)

    return {
        "crop": crop["name"],
        "field_size_acres": field_acres,
        "soil_type": soil_type,
        "task_purpose": task["name"],
        "target_hp": round(target_hp),
        "total_results": len(recommendations),
        "recommendations": recommendations[:6]  # Top 6 AI matches
    }


def calculate_ai_price_advisor(horsepower, manufacturing_year, brand, district=None):
    """
    AI Dynamic Price Suggestion for Equipment Owners
    """
    hp = float(horsepower or 45)
    year = int(manufacturing_year or 2022)
    age = max(0, 2026 - year)

    # Base hourly calculation
    base_hourly = 150 + (hp * 2.8) - (age * 10)
    base_hourly = max(200, min(900, base_hourly))

    suggested_hourly = round(base_hourly / 10) * 10
    suggested_daily = round((suggested_hourly * 7.5) / 50) * 50

    return {
        "horsepower": hp,
        "year": year,
        "recommended_rent_per_hour": suggested_hourly,
        "recommended_rent_per_day": suggested_daily,
        "market_range_hourly": [suggested_hourly - 40, suggested_hourly + 60],
        "market_range_daily": [suggested_daily - 300, suggested_daily + 400],
        "demand_index": "High" if hp >= 45 else "Medium",
        "pricing_tip": f"For a {hp} HP tractor, charging ₹{suggested_hourly}/hr attracts 35% more rental bookings in peak agricultural seasons."
    }
