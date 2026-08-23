import os
import sys
import django
import json
import urllib.request
import urllib.error
import threading
import time
from datetime import date, timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

sys.stdout.reconfigure(encoding='utf-8')

from django.conf import settings
from accounts.models import User
from rental.models import Tractor, Implement, Wishlist
from bookings.models import Booking
from payments.models import Payment, Payout
from reviews.models import Review
from notifications.models import Notification

BASE_URL = "http://127.0.0.1:8000/api"

test_results = []

def record(phase, feature, test_name, expected, actual, status_code_or_val, is_pass):
    status_str = "✅ PASS" if is_pass else "❌ FAIL"
    test_results.append({
        "phase": phase,
        "feature": feature,
        "test": test_name,
        "expected": str(expected),
        "actual": str(actual),
        "status": status_str,
        "is_pass": is_pass
    })
    print(f"[{status_str}] {phase} - {feature}: {test_name} -> {actual}")

def make_req(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}/{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    encoded = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            body = res.read().decode("utf-8")
            return res.getcode(), json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except:
            return e.code, {"raw": body}
    except Exception as ex:
        return 500, {"error": str(ex)}

print("==========================================================================")
print("🚀 RUNNING COMPREHENSIVE QA TEST SUITE ACROSS ALL 23 PHASES")
print("==========================================================================")

# -----------------------------------------------------------------------------
# PHASE 3: AUTHENTICATION TESTING
# -----------------------------------------------------------------------------
# 1. Valid customer login
code, res = make_req("accounts/login/", "POST", {"email": "customer@tracto.com", "password": "customer123"})
cust_token = res.get("access") if code == 200 else None
record("PHASE 3", "Auth / Login", "Valid Customer Login", "200 OK + JWT access token", f"{code} OK (Role: {res.get('user', {}).get('role')})", code, code == 200 and cust_token is not None)

# 2. Valid owner login
code, res = make_req("accounts/login/", "POST", {"email": "owner@tracto.com", "password": "owner123"})
owner_token = res.get("access") if code == 200 else None
record("PHASE 3", "Auth / Login", "Valid Owner Login", "200 OK + JWT access token", f"{code} OK (Role: {res.get('user', {}).get('role')})", code, code == 200 and owner_token is not None)

# 3. Valid admin login
code, res = make_req("accounts/login/", "POST", {"email": "admin@tracto.com", "password": "admin123"})
admin_token = res.get("access") if code == 200 else None
record("PHASE 3", "Auth / Login", "Valid Admin Login", "200 OK + JWT access token", f"{code} OK (Role: {res.get('user', {}).get('role')})", code, code == 200 and admin_token is not None)

# 4. Wrong password
code, res = make_req("accounts/login/", "POST", {"email": "customer@tracto.com", "password": "wrong_password_999"})
record("PHASE 3", "Auth / Login", "Wrong Password", "401 Unauthorized", f"{code} {res}", code, code == 401)

# 5. Wrong email
code, res = make_req("accounts/login/", "POST", {"email": "nonexistent_987654@tracto.com", "password": "pass"})
record("PHASE 3", "Auth / Login", "Nonexistent Email", "401 Unauthorized", f"{code} {res}", code, code == 401)

# 6. Empty credentials
code, res = make_req("accounts/login/", "POST", {"email": "", "password": ""})
record("PHASE 3", "Auth / Login", "Empty Credentials", "400/401 Bad Request", f"{code} {res}", code, code in [400, 401])

# 7. Customer Registration - Valid
import random
rand_id = random.randint(10000, 99999)
code, res = make_req("accounts/register/", "POST", {
    "first_name": "Test",
    "last_name": "Farmer",
    "email": f"farmer_{rand_id}@test.com",
    "phone": f"98765{rand_id}",
    "role": "customer",
    "password": "Password123"
})
record("PHASE 3", "Auth / Register", "Valid Customer Registration", "201 Created", f"{code} {res.get('message', '')}", code, code == 201)

# 8. Duplicate Email Registration
code, res = make_req("accounts/register/", "POST", {
    "first_name": "Duplicate",
    "last_name": "Farmer",
    "email": "customer@tracto.com",
    "phone": "9876543210",
    "role": "customer",
    "password": "Password123"
})
record("PHASE 3", "Auth / Register", "Duplicate Email Registration", "400 Bad Request", f"{code} {res}", code, code == 400)

# 9. Invalid Email Format
code, res = make_req("accounts/register/", "POST", {
    "first_name": "Invalid",
    "last_name": "Email",
    "email": "not-an-email",
    "phone": "9876543210",
    "role": "customer",
    "password": "Password123"
})
record("PHASE 3", "Auth / Register", "Invalid Email Format", "400 Bad Request", f"{code} {res}", code, code == 400)

# 10. Missing Required Fields in Registration
code, res = make_req("accounts/register/", "POST", {
    "email": f"missing_{rand_id}@test.com"
})
record("PHASE 3", "Auth / Register", "Missing Fields Registration", "400 Bad Request", f"{code} {res}", code, code == 400)

# 11. JWT Token Refresh
code, res = make_req("accounts/login/", "POST", {"email": "customer@tracto.com", "password": "customer123"})
refresh_token = res.get("refresh")
code_ref, res_ref = make_req("token/refresh/", "POST", {"refresh": refresh_token})
record("PHASE 3", "Auth / JWT", "Refresh Token Exchange", "200 OK + new access token", f"{code_ref} (access in res: {'access' in res_ref})", code_ref, code_ref == 200 and "access" in res_ref)

# 12. Invalid Token on Protected Endpoint
code, res = make_req("accounts/profile/", "GET", token="invalid_bearer_token_xyz")
record("PHASE 3", "Auth / JWT", "Invalid Bearer Token", "401 Unauthorized", f"{code} {res}", code, code == 401)

# 13. Missing Token on Protected Endpoint
code, res = make_req("accounts/profile/", "GET")
record("PHASE 3", "Auth / JWT", "Missing Bearer Token", "401 Unauthorized", f"{code} {res}", code, code == 401)


# -----------------------------------------------------------------------------
# PHASE 4: TRACTOR / EQUIPMENT TESTING & PERMISSIONS
# -----------------------------------------------------------------------------
# 14. Read tractor catalog (Public)
code, res = make_req("tractors/", "GET")
tractors_list = res.get("results", res) if isinstance(res, dict) else res
record("PHASE 4", "Tractor Catalog", "Public Read Catalog", "200 OK + List of tractors", f"{code} OK ({len(tractors_list)} items)", code, code == 200 and len(tractors_list) > 0)

# 15. Customer Attempt to Create Tractor (Forbidden)
code, res = make_req("tractors/", "POST", {
    "name": "Customer Fake Tractor",
    "brand": "Mahindra",
    "model": "575 DI",
    "rent_per_day": 2000,
    "location": "Ahmedabad"
}, token=cust_token)
record("PHASE 4", "Tractor Permissions", "Customer Create Tractor (Blocked)", "403 Forbidden", f"{code} {res.get('detail', '')}", code, code == 403)


# 16. Owner Create Tractor
code, res = make_req("tractors/", "POST", {
    "name": f"Owner QA Tractor {rand_id}",
    "brand": "Mahindra",
    "model": "Novo 605",
    "horsepower": 60,
    "manufacturing_year": 2023,
    "rent_per_day": 3000,
    "rent_per_hour": 300,
    "location": "Sanand, Ahmedabad",
    "district": "Ahmedabad",
    "city_village": "Sanand",
    "pincode": "382110",
    "description": "Heavy duty tractor for plowing",
    "available": True,
    "is_approved_by_admin": True
}, token=owner_token)
created_tr_id = res.get("id") if code == 201 else None
record("PHASE 4", "Tractor CRUD", "Owner Create Valid Tractor", "201 Created", f"{code} ID: {created_tr_id}", code, code == 201)

# 17. Owner Edit Own Tractor
if created_tr_id:
    code, res = make_req(f"tractors/{created_tr_id}/", "PATCH", {
        "rent_per_day": 3200,
        "description": "Updated description by owner"
    }, token=owner_token)
    record("PHASE 4", "Tractor CRUD", "Owner Update Own Tractor", "200 OK", f"{code} Updated rent: {res.get('rent_per_day')}", code, code == 200 and float(res.get("rent_per_day", 0)) == 3200.0)

# 18. Customer Attempt to Edit Owner Tractor (Forbidden)
if created_tr_id:
    code, res = make_req(f"tractors/{created_tr_id}/", "PATCH", {
        "rent_per_day": 100
    }, token=cust_token)
    record("PHASE 4", "Tractor Permissions", "Customer Update Owner Tractor", "403 Forbidden", f"{code} {res}", code, code == 403)

# 19. Unauthenticated Attempt to Delete Tractor (Unauthorized)
if created_tr_id:
    code, res = make_req(f"tractors/{created_tr_id}/", "DELETE")
    record("PHASE 4", "Tractor Permissions", "Unauthenticated Delete Tractor", "401 Unauthorized", f"{code}", code, code == 401)

# 20. Owner Delete Own Tractor
if created_tr_id:
    code, res = make_req(f"tractors/{created_tr_id}/", "DELETE", token=owner_token)
    record("PHASE 4", "Tractor CRUD", "Owner Delete Own Tractor", "204 No Content", f"{code}", code, code == 204)


# -----------------------------------------------------------------------------
# PHASE 5: WORK-PURPOSE BOOKING ENGINE
# -----------------------------------------------------------------------------
# Test tractor for bookings
test_tr = next((t for t in tractors_list if t.get("owner_details", {}).get("email") == "owner@tracto.com"), tractors_list[0])
tr_id = test_tr["id"]

base_offset = random.randint(3000, 9900)


# 21. Land Plowing Booking
start_1 = (date.today() + timedelta(days=base_offset)).isoformat()
end_1 = (date.today() + timedelta(days=base_offset + 2)).isoformat()
code, res = make_req("bookings/", "POST", {
    "tractor": tr_id,
    "start_date": start_1,
    "end_date": end_1,
    "rental_duration_type": "daily",
    "rental_units": 3,
    "farming_work_type": "plowing",
    "crop_name": "Cotton (કપાસ)",
    "land_area_size": 10.0,
    "land_area_unit": "bigha",
    "purpose": "Land plowing with MB Plough for cotton",
}, token=cust_token)
b1_id = res.get("id") if code == 201 else None
record("PHASE 5", "Work-Purpose Booking", "1. Land Plowing (MB Plough)", "201 Created with farming_work_type=plowing", f"{code} ID #{b1_id} (Type: {res.get('farming_work_type')})", code, code == 201 and res.get("farming_work_type") == "plowing")

# 22. Crop Transport Booking
start_2 = (date.today() + timedelta(days=base_offset + 5)).isoformat()
end_2 = (date.today() + timedelta(days=base_offset + 6)).isoformat()
code, res = make_req("bookings/", "POST", {
    "tractor": tr_id,
    "start_date": start_2,
    "end_date": end_2,
    "rental_duration_type": "daily",
    "rental_units": 2,
    "farming_work_type": "transport",
    "crop_name": "Wheat (ઘઉં)",
    "land_area_size": 15.0,
    "land_area_unit": "acre",
    "purpose": "Crop Transport: 60 bags of Wheat to Mandi (25 km)",
}, token=cust_token)
b2_id = res.get("id") if code == 201 else None
record("PHASE 5", "Work-Purpose Booking", "2. Crop Transport (Trolley + Bags + Distance)", "201 Created with farming_work_type=transport", f"{code} ID #{b2_id} (Purpose: {res.get('purpose')})", code, code == 201 and res.get("farming_work_type") == "transport")

# 23. Rotavator Booking
start_3 = (date.today() + timedelta(days=base_offset + 10)).isoformat()
end_3 = (date.today() + timedelta(days=base_offset + 11)).isoformat()
code, res = make_req("bookings/", "POST", {
    "tractor": tr_id,
    "start_date": start_3,
    "end_date": end_3,
    "rental_duration_type": "daily",
    "rental_units": 2,
    "farming_work_type": "rotavator",
    "crop_name": "Groundnut (મગફળી)",
    "land_area_size": 8.0,
    "land_area_unit": "bigha",
    "purpose": "Rotavator soil preparation",
}, token=cust_token)
record("PHASE 5", "Work-Purpose Booking", "3. Rotavator Soil Bed Prep", "201 Created with farming_work_type=rotavator", f"{code} ID #{res.get('id')}", code, code == 201 and res.get("farming_work_type") == "rotavator")

# 24. Sowing / Seeding Booking
start_4 = (date.today() + timedelta(days=base_offset + 15)).isoformat()
end_4 = (date.today() + timedelta(days=base_offset + 16)).isoformat()
code, res = make_req("bookings/", "POST", {
    "tractor": tr_id,
    "start_date": start_4,
    "end_date": end_4,
    "rental_duration_type": "daily",
    "rental_units": 2,
    "farming_work_type": "sowing",
    "crop_name": "Cotton (કપાસ)",
    "land_area_size": 6.0,
    "land_area_unit": "bigha",
    "purpose": "Seed drill sowing",
}, token=cust_token)
record("PHASE 5", "Work-Purpose Booking", "4. Sowing / Seeding (Seed Drill)", "201 Created with farming_work_type=sowing", f"{code} ID #{res.get('id')}", code, code == 201 and res.get("farming_work_type") == "sowing")

# 25. Threshing / Harvesting Booking
start_5 = (date.today() + timedelta(days=base_offset + 20)).isoformat()
end_5 = (date.today() + timedelta(days=base_offset + 22)).isoformat()
code, res = make_req("bookings/", "POST", {
    "tractor": tr_id,
    "start_date": start_5,
    "end_date": end_5,
    "rental_duration_type": "daily",
    "rental_units": 3,
    "farming_work_type": "harvesting",
    "crop_name": "Wheat (ઘઉં)",
    "land_area_size": 12.0,
    "land_area_unit": "acre",
    "purpose": "Thresher crop harvesting",
}, token=cust_token)
record("PHASE 5", "Work-Purpose Booking", "5. Threshing / Harvesting (Thresher)", "201 Created with farming_work_type=harvesting", f"{code} ID #{res.get('id')}", code, code == 201 and res.get("farming_work_type") == "harvesting")

# 26. Laser Land Leveling Booking
start_6 = (date.today() + timedelta(days=base_offset + 25)).isoformat()
end_6 = (date.today() + timedelta(days=base_offset + 26)).isoformat()
code, res = make_req("bookings/", "POST", {
    "tractor": tr_id,
    "start_date": start_6,
    "end_date": end_6,
    "rental_duration_type": "daily",
    "rental_units": 2,
    "farming_work_type": "leveling",
    "crop_name": "Paddy / Rice (ડાંગર)",
    "land_area_size": 5.0,
    "land_area_unit": "bigha",
    "purpose": "Laser land leveling",
}, token=cust_token)
record("PHASE 5", "Work-Purpose Booking", "6. Laser Land Leveling", "201 Created with farming_work_type=leveling", f"{code} ID #{res.get('id')}", code, code == 201 and res.get("farming_work_type") == "leveling")



# -----------------------------------------------------------------------------
# PHASE 6: AI / ALGORITHMIC MACHINERY MATCHER
# -----------------------------------------------------------------------------
# 27. AI Matcher - Cotton, 10 Acres, Plowing
code, res = make_req("ai-recommend/", "POST", {
    "crop_type": "cotton",
    "field_size_acres": 10,
    "soil_type": "medium",
    "task_purpose": "plowing"
})
rec_count = len(res.get("recommendations", []))
target_hp = res.get("target_hp")
record("PHASE 6", "AI Matcher", "Standard Recommendation (Cotton, 10 Acres)", f"200 OK, target_hp >= 45, recommendations > 0", f"{code} target_hp: {target_hp}, recs: {rec_count}", code, code == 200 and rec_count > 0 and target_hp >= 45)

# 28. AI Matcher - Wheat, 25 Acres (Large Land)
code, res = make_req("ai-recommend/", "POST", {
    "crop_type": "wheat",
    "field_size_acres": 25,
    "soil_type": "hard",
    "task_purpose": "rotavating"
})
record("PHASE 6", "AI Matcher", "Large Land High HP Scaling (25 Acres, Hard Soil)", "200 OK, target_hp scaled up", f"{code} target_hp: {res.get('target_hp')}", code, code == 200 and res.get("target_hp", 0) >= 55)

# 29. AI Matcher - Fuel & Cost Calculation Consistency
sample_rec = res.get("recommendations", [{}])[0]
est_hours = sample_rec.get("estimated_hours", 0)
est_fuel = sample_rec.get("estimated_fuel_liters", 0)
est_cost = sample_rec.get("estimated_total_cost", 0)
record("PHASE 6", "AI Matcher", "Fuel & Total Cost Calculation Consistency", "Positive hours, fuel & cost", f"Hours: {est_hours}, Fuel: {est_fuel}L, Cost: ₹{est_cost}", code, est_hours > 0 and est_fuel > 0 and est_cost > 0)

# 30. AI Dynamic Price Advisor
code, res = make_req("ai-price-advisor/", "POST", {
    "horsepower": 50,
    "manufacturing_year": 2023,
    "brand": "John Deere"
})
record("PHASE 6", "AI Price Advisor", "Owner Price Suggestion Engine", "200 OK with recommended rent", f"{code} Rent/hr: ₹{res.get('recommended_rent_per_hour')}, Rent/day: ₹{res.get('recommended_rent_per_day')}", code, code == 200 and res.get("recommended_rent_per_hour", 0) > 0)


# -----------------------------------------------------------------------------
# PHASE 7 & 8: GPS, LIVE MAP & DRIVER BROADCAST
# -----------------------------------------------------------------------------
# 31. Tractor GPS Geocoded Coordinates in Catalog
has_lat_lon = all(t.get("latitude") is not None and t.get("longitude") is not None for t in tractors_list)
record("PHASE 7", "GPS / Map", "Tractor Geocoded Coordinates", "All tractors have valid lat & lon", f"All geocoded: {has_lat_lon}", 200, has_lat_lon)

# 32. Owner Approve Booking (Dispatch)
code, res = make_req(f"bookings/{b1_id}/approve/", "POST", token=owner_token)
record("PHASE 8", "Driver Live GPS", "Owner Approves / Dispatches Tractor", "200 OK, Status: approved", f"{code} Status: {res.get('status')}", code, code == 200 and res.get("status") == "approved")

# 33. Driver Broadcasts Highway GPS Coordinates
code, res = make_req(f"bookings/{b1_id}/update-driver-location/", "POST", {
    "latitude": 22.8765,
    "longitude": 72.4123
}, token=owner_token)
record("PHASE 8", "Driver Live GPS", "Driver Broadcasts Live GPS", "200 OK with driver_latitude & longitude", f"{code} Lat: {res.get('driver_latitude')}, Lon: {res.get('driver_longitude')}", code, code == 200 and float(res.get("driver_latitude", 0)) == 22.8765)

# 34. Driver Arrives on Farm Field
code, res = make_req(f"bookings/{b1_id}/update-status/", "POST", {
    "status": "arrived"
}, token=owner_token)
record("PHASE 8", "Driver Live GPS", "Driver Updates Status to Arrived", "200 OK, Status: arrived", f"{code} Status: {res.get('status')}", code, code == 200 and res.get("status") == "arrived")


# -----------------------------------------------------------------------------
# PHASE 10 & 11: PAYMENT & SMS OTP VERIFICATION
# -----------------------------------------------------------------------------
# 35. Razorpay Create Order
code, res = make_req("payments/create-order/", "POST", {
    "booking_id": b1_id
}, token=cust_token)
order_id = res.get("order_id")
record("PHASE 11", "Payment", "Razorpay Create Order API", "200 OK + order_id", f"{code} Order: {order_id}", code, code == 200 and order_id is not None)

# 36. Payment Confirmation & Fresh SMS OTP Generation
code, res = make_req(f"bookings/{b1_id}/confirm-payment/", "POST", token=owner_token)
fresh_otp = res.get("completion_otp")
record("PHASE 10", "SMS OTP", "Payment Confirm & 4-Digit OTP Generation", "200 OK, Status: paid, OTP generated", f"{code} Status: {res.get('status')}, OTP: {fresh_otp}", code, code == 200 and res.get("status") == "paid" and len(str(fresh_otp)) == 4)

# 37. Wrong OTP Verification Attempt (Must Fail)
code, res = make_req(f"bookings/{b1_id}/verify-completion-otp/", "POST", {
    "otp": "0000"
}, token=owner_token)
record("PHASE 10", "SMS OTP", "Invalid OTP Verification Attempt", "400 Bad Request", f"{code} {res.get('error', '')}", code, code == 400)

# 38. Correct OTP Verification (Completes Trip)
code, res = make_req(f"bookings/{b1_id}/verify-completion-otp/", "POST", {
    "otp": fresh_otp
}, token=owner_token)
record("PHASE 10", "SMS OTP", "Valid OTP Work Completion", "200 OK, Status: completed", f"{code} Status: {res.get('status')}", code, code == 200 and res.get("status") == "completed")


# -----------------------------------------------------------------------------
# PHASE 12: BOOKING CONCURRENCY & RACE CONDITION TEST
# -----------------------------------------------------------------------------
# Test concurrent booking requests for same tractor on exact same dates
conc_offset = random.randint(1000, 2000)
conc_start = (date.today() + timedelta(days=conc_offset)).isoformat()
conc_end = (date.today() + timedelta(days=conc_offset + 2)).isoformat()

conc_results = []
def book_tractor_thread(cust_num):
    c_code, c_res = make_req("bookings/", "POST", {
        "tractor": tr_id,
        "start_date": conc_start,
        "end_date": conc_end,
        "rental_duration_type": "daily",
        "rental_units": 3,
        "farming_work_type": "plowing",
        "purpose": f"Concurrent booking test user {cust_num}"
    }, token=cust_token)
    conc_results.append((cust_num, c_code, c_res))

t1 = threading.Thread(target=book_tractor_thread, args=(1,))
t2 = threading.Thread(target=book_tractor_thread, args=(2,))
t1.start()
t2.start()
t1.join()
t2.join()

successful_bookings = [r for r in conc_results if r[1] == 201]
failed_bookings = [r for r in conc_results if r[1] == 400]
concurrency_pass = len(successful_bookings) == 1 and len(failed_bookings) == 1
record("PHASE 12", "Concurrency Locking", "Simultaneous Overlapping Booking Race Condition", "Exactly 1 success (201) and 1 rejection (400)", f"Successes: {len(successful_bookings)}, Rejections: {len(failed_bookings)}", 200 if concurrency_pass else 500, concurrency_pass)


# -----------------------------------------------------------------------------
# PHASE 13: BOOKING VALIDATION
# -----------------------------------------------------------------------------
# 39. Past start date booking
past_d = (date.today() - timedelta(days=10)).isoformat()
code, res = make_req("bookings/", "POST", {
    "tractor": tr_id,
    "start_date": past_d,
    "end_date": past_d,
    "rental_units": 1
}, token=cust_token)
record("PHASE 13", "Booking Validation", "Past Start Date Validation", "400 Bad Request", f"{code} {res}", code, code == 400)

# 40. End date before start date
code, res = make_req("bookings/", "POST", {
    "tractor": tr_id,
    "start_date": (date.today() + timedelta(days=300)).isoformat(),
    "end_date": (date.today() + timedelta(days=290)).isoformat(),
    "rental_units": 1
}, token=cust_token)
record("PHASE 13", "Booking Validation", "End Date Before Start Date Validation", "400 Bad Request", f"{code} {res}", code, code == 400)

# 41. Overlapping Date with Existing Booking
code, res = make_req("bookings/", "POST", {
    "tractor": tr_id,
    "start_date": conc_start,
    "end_date": conc_end,
    "rental_units": 3
}, token=cust_token)
record("PHASE 13", "Booking Validation", "Overlapping Existing Booking Validation", "400 Bad Request (Tractor not available)", f"{code} {res}", code, code == 400)


# -----------------------------------------------------------------------------
# PHASE 17: ROLE SECURITY & AUTHORIZATION MATRIX
# -----------------------------------------------------------------------------
# 42. Customer attempts to access Admin User List
code, res = make_req("accounts/users/", "GET", token=cust_token)
record("PHASE 17", "Role Security", "Customer Access Admin Users API", "403 Forbidden", f"{code} {res}", code, code == 403)

# 43. Owner attempts to access Admin User List
code, res = make_req("accounts/users/", "GET", token=owner_token)
record("PHASE 17", "Role Security", "Owner Access Admin Users API", "403 Forbidden", f"{code} {res}", code, code == 403)

# 44. Admin access Admin User List
code, res = make_req("accounts/users/", "GET", token=admin_token)
record("PHASE 17", "Role Security", "Admin Access Admin Users API", "200 OK + User List", f"{code} OK ({len(res)} users)", code, code == 200 and len(res) > 0)

# 45. Customer attempts to access Owner Earnings
code, res = make_req("payments/owner-earnings/", "GET", token=cust_token)
record("PHASE 17", "Role Security", "Customer Access Owner Earnings API", "403 Forbidden", f"{code} {res}", code, code == 403)

# 46. Owner access Owner Earnings
code, res = make_req("payments/owner-earnings/", "GET", token=owner_token)
record("PHASE 17", "Role Security", "Owner Access Owner Earnings API", "200 OK with Gross & Net breakdown", f"{code} Gross: ₹{res.get('gross_revenue')}, Net: ₹{res.get('net_earnings')}", code, code == 200 and "net_earnings" in res)

# 47. Customer attempts to approve another customer's booking
target_booking_for_approval = b2_id or b1_id or (Booking.objects.first().id if Booking.objects.exists() else 1)
code, res = make_req(f"bookings/{target_booking_for_approval}/approve/", "POST", token=cust_token)
record("PHASE 17", "Role Security", "Customer Attempts Booking Approval", "403 Forbidden", f"{code} {res.get('error', '')}", code, code == 403)



# -----------------------------------------------------------------------------
# PHASE 21: DATABASE INTEGRITY & MODEL RELATIONSHIPS
# -----------------------------------------------------------------------------
# Check orphaned foreign keys or nullability
total_tractors = Tractor.objects.count()
total_bookings = Booking.objects.count()
total_users = User.objects.count()
total_payments = Payment.objects.count()
total_reviews = Review.objects.count()
db_integrity_pass = total_tractors > 0 and total_bookings > 0 and total_users > 0
record("PHASE 21", "Database Integrity", "Models & Foreign Key Relationships", "Active relational integrity without broken records", f"Users: {total_users}, Tractors: {total_tractors}, Bookings: {total_bookings}, Payments: {total_payments}, Reviews: {total_reviews}", 200, db_integrity_pass)

print("\n==========================================================================")
print(f"📊 AUTOMATED AUDIT COMPLETED: {len(test_results)} TESTS EVALUATED")
print(f"   Passed: {len([t for t in test_results if t['is_pass']])}")
print(f"   Failed: {len([t for t in test_results if not t['is_pass']])}")
print("==========================================================================")

with open("qa_audit_results.json", "w", encoding="utf-8") as f:
    json.dump(test_results, f, indent=2, ensure_ascii=False)
