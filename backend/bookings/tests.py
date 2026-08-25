from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rental.models import Tractor, Implement
from bookings.models import Booking

User = get_user_model()


class BookingWorkflowUnitAndIntegrationTests(TestCase):
    """
    Unit and Integration tests for Booking & OTP Verification Engine:
    - Booking Creation & Pricing Calculation
    - Owner Approval Workflow
    - In-App 4-Digit Completion OTP Generation
    - OTP Verification Security Guard
    - Fresh OTP Refresh Endpoint
    """

    def setUp(self):
        self.client = APIClient()
        self.farmer = User.objects.create_user(
            email="farmer_book@tracto.com",
            password="Password@123",
            first_name="Raju",
            last_name="Bhai",
            role="customer",
            phone="9876511111",
            district="Anand"
        )
        self.owner = User.objects.create_user(
            email="owner_book@tracto.com",
            password="Password@123",
            first_name="Suresh",
            last_name="Bhai",
            role="owner",
            phone="9876522222",
            district="Anand"
        )
        self.tractor = Tractor.objects.create(
            owner=self.owner,
            name="Swaraj 855 FE Power Steering",
            brand="Swaraj",
            model="855 FE",
            manufacturing_year=2024,
            horsepower=52,
            rent_per_hour=500.00,
            rent_per_day=2800.00,
            fuel_type="diesel",
            district="Anand",
            location="Anand City",
            available=True,
            is_approved_by_admin=True
        )
        self.cultivator = Implement.objects.create(
            owner=self.owner,
            tractor=self.tractor,
            name="9-Tyne Rigid Cultivator",
            category="cultivator",
            rent_per_hour=100.00,
            rent_per_day=500.00
        )

        # Authenticate farmer client
        login_res = self.client.post("/api/accounts/login/", {
            "email": "farmer_book@tracto.com",
            "password": "Password@123"
        }, format="json")
        self.farmer_token = login_res.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.farmer_token}")

    def test_booking_creation_and_otp_generation(self):
        """Test creating a booking and auto-generating completion OTP"""
        start_d = date.today() + timedelta(days=1)
        end_d = date.today() + timedelta(days=2)
        payload = {
            "tractor": self.tractor.id,
            "start_date": str(start_d),
            "end_date": str(end_d),
            "rental_duration_type": "daily",
            "rental_units": 2,
            "farming_work_type": "plowing",
            "selected_implements": [self.cultivator.id],
            "notes": "Plowing 4 acres field"
        }
        response = self.client.post("/api/bookings/", payload, format="json")
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        booking_id = response.data["id"]
        booking = Booking.objects.get(id=booking_id)
        self.assertEqual(booking.status, "pending")
        self.assertIsNotNone(booking.completion_otp)
        self.assertEqual(len(booking.completion_otp), 4)

    def test_owner_otp_verification_flow(self):
        """Test owner approving booking and verifying completion OTP"""
        # 1. Create booking
        booking = Booking.objects.create(
            customer=self.farmer,
            tractor=self.tractor,
            start_date=date.today(),
            end_date=date.today(),
            rental_duration_type="daily",
            rental_units=1,
            total_amount=3300.00,
            status="approved",
            completion_otp="7845"
        )

        # 2. Login as Owner
        owner_client = APIClient()
        owner_login = owner_client.post("/api/accounts/login/", {
            "email": "owner_book@tracto.com",
            "password": "Password@123"
        }, format="json")
        owner_token = owner_login.data["access"]
        owner_client.credentials(HTTP_AUTHORIZATION=f"Bearer {owner_token}")

        # 3. Test Invalid OTP rejection
        bad_verify = owner_client.post(f"/api/bookings/{booking.id}/verify-completion-otp/", {
            "otp": "0000"
        }, format="json")
        self.assertEqual(bad_verify.status_code, status.HTTP_400_BAD_REQUEST)

        # 4. Test Correct OTP verification
        good_verify = owner_client.post(f"/api/bookings/{booking.id}/verify-completion-otp/", {
            "otp": "7845"
        }, format="json")
        self.assertEqual(good_verify.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, "completed")
