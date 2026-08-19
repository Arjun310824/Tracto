import os
import django
import json
from datetime import date, timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}/{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.getcode(), json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except:
            return e.code, {"raw": body}

import sys
sys.stdout.reconfigure(encoding='utf-8')

print("================================================================")
print("TRACTO PLATFORM - END-TO-END AUTOMATED VERIFICATION SUITE")
print("================================================================")


# 1. Test Customer Login
print("\n[TEST 1] Testing Customer Authentication...")
code, res = make_request("accounts/login/", method="POST", data={
    "email": "customer@tracto.com",
    "password": "customer123"
})
assert code == 200, f"Customer login failed: {res}"
customer_token = res["access"]
customer_user = res["user"]
print(f"✅ Customer Login OK: {customer_user['first_name']} {customer_user['last_name']} ({customer_user['role']})")

# 2. Test Owner Login
print("\n[TEST 2] Testing Owner Authentication...")
code, res = make_request("accounts/login/", method="POST", data={
    "email": "owner@tracto.com",
    "password": "owner123"
})
assert code == 200, f"Owner login failed: {res}"
owner_token = res["access"]
owner_user = res["user"]
print(f"✅ Owner Login OK: {owner_user['first_name']} {owner_user['last_name']} ({owner_user['role']})")

# 3. Test Admin Login
print("\n[TEST 3] Testing Admin Authentication...")
code, res = make_request("accounts/login/", method="POST", data={
    "email": "admin@tracto.com",
    "password": "admin123"
})
assert code == 200, f"Admin login failed: {res}"
admin_token = res["access"]
admin_user = res["user"]
print(f"✅ Admin Login OK: {admin_user['first_name']} ({admin_user['role']})")

# 4. Test Tractor Catalog & Real Coordinates
print("\n[TEST 4] Testing Tractor Catalog & GPS Geocoding...")
code, res = make_request("tractors/", method="GET")
assert code == 200, f"Tractor catalog failed: {res}"
tractors = res.get("results", res) if isinstance(res, dict) else res
print(f"✅ Retrieved {len(tractors)} tractors from catalog.")

# Find tractor owned by Ramesh Patel (owner@tracto.com)
sample_tractor = next((t for t in tractors if t.get("owner_details", {}).get("email") == "owner@tracto.com"), tractors[0])
print(f"   Target Tractor: {sample_tractor['brand']} {sample_tractor['model']} | Owner: {sample_tractor.get('owner_details', {}).get('email')} | Location: {sample_tractor['location']} | Lat: {sample_tractor.get('latitude')}, Lon: {sample_tractor.get('longitude')}")



# 5. Create Work Purpose Booking (Cotton Plowing with MB Plough)
print("\n[TEST 5] Creating Agricultural Work Purpose Booking...")
import random
offset = random.randint(30, 200)
start_d = (date.today() + timedelta(days=offset)).isoformat()
end_d = (date.today() + timedelta(days=offset + 2)).isoformat()

booking_payload = {
    "tractor": sample_tractor["id"],
    "start_date": start_d,
    "end_date": end_d,
    "rental_duration_type": "daily",
    "rental_units": 3,
    "farming_work_type": "plowing",
    "crop_name": "Cotton (કપાસ)",
    "land_area_size": 10.0,
    "land_area_unit": "bigha",
    "purpose": "Cotton land deep plowing and seed bed preparation",
    "notes": "Farmer requires driver early morning at 7 AM"
}
code, res = make_request("bookings/", method="POST", data=booking_payload, token=customer_token)
assert code in [200, 201], f"Booking creation failed: {res}"
booking_id = res["id"]
completion_otp = res.get("completion_otp")
print(f"✅ Booking Created successfully! ID: #{booking_id} | Status: {res['status']} | Total: ₹{res['total_amount']}")
print(f"   Generated SMS Completion OTP: {completion_otp}")

# 6. Owner Accepts Booking
print("\n[TEST 6] Owner Dispatches Booking...")
code, res = make_request(f"bookings/{booking_id}/approve/", method="POST", token=owner_token)
assert code == 200, f"Approve failed: {res}"
print(f"✅ Booking Approved/Dispatched! Status: {res['status']}")

# 7. Driver Broadcasts Live Phone GPS Coordinates
print("\n[TEST 7] Driver Broadcasts Real Live GPS Coordinates on Highway...")
code, res = make_request(f"bookings/{booking_id}/update-driver-location/", method="POST", data={
    "latitude": 22.8540,
    "longitude": 72.4210
}, token=owner_token)
assert code == 200, f"Driver GPS update failed: {res}"
print(f"✅ Driver Live GPS Transmitted: Lat: {res['driver_latitude']}, Lon: {res['driver_longitude']}")

# 8. Driver Arrives on Farmer Field
print("\n[TEST 8] Driver Arrives on Farm...")
code, res = make_request(f"bookings/{booking_id}/update-status/", method="POST", data={
    "status": "arrived"
}, token=owner_token)
assert code == 200, f"Arrive status failed: {res}"
print(f"✅ Driver Arrived on Field! Status: {res['status']}")

# 9. Payment Confirmation
print("\n[TEST 9] Confirming Payment Received on Farm...")
code, res = make_request(f"bookings/{booking_id}/confirm-payment/", method="POST", token=owner_token)
assert code == 200, f"Payment confirmation failed: {res}"
payment_otp = res.get("completion_otp", completion_otp)
print(f"✅ Payment Confirmed! Status: {res['status']} | Fresh SMS OTP for Work Completion: {payment_otp}")

# 10. Verify Work Completion OTP
print("\n[TEST 10] Verifying Farmer 4-Digit SMS OTP to Finish Work...")
code, res = make_request(f"bookings/{booking_id}/verify-completion-otp/", method="POST", data={
    "otp": payment_otp
}, token=owner_token)
assert code == 200, f"OTP verification failed: {res}"
print(f"✅ Completion OTP Verified Successfully! Trip Finished: Status: {res['status']}")



print("\n================================================================")
print("🎉 ALL 10 END-TO-END VERIFICATION TESTS PASSED WITH 100% SUCCESS!")
print("================================================================")
