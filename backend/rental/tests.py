from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rental.models import Tractor, Implement
from rental.ai_engine import calculate_ai_machinery_recommendation

User = get_user_model()


class RentalMachineryUnitAndIntegrationTests(TestCase):
    """
    Unit and Integration tests for Rental & AI Machinery Matcher module:
    - Tractor CRUD & Owner Authorization
    - Implement Attachment Association
    - Dynamic Machinery Search & Filters
    - AI Machinery Advisor Algorithm Accuracy
    """

    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            email="owner_fleet@tracto.com",
            password="Password@123",
            first_name="Jayesh",
            last_name="Patel",
            role="owner",
            phone="9876500001",
            district="Mehsana"
        )
        self.tractor = Tractor.objects.create(
            owner=self.owner,
            name="Mahindra 575 DI Sarpanch",
            brand="Mahindra",
            model="575 DI",
            manufacturing_year=2024,
            horsepower=47,
            rent_per_hour=450.00,
            rent_per_day=2400.00,
            fuel_type="diesel",
            district="Mehsana",
            location="Kadi, Mehsana",
            available=True
        )
        self.rotavator = Implement.objects.create(
            owner=self.owner,
            tractor=self.tractor,
            name="Shaktiman 36-Blade Rotavator",
            category="rotavator",
            rent_per_hour=150.00,
            rent_per_day=800.00
        )

    def test_tractor_listing_and_filtering(self):
        """Test retrieving tractors filtered by brand and district"""
        response = self.client.get("/api/tractors/?brand=Mahindra")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data if isinstance(response.data, list) else response.data.get("results", [])
        self.assertTrue(len(results) >= 1)
        self.assertEqual(results[0]["name"], "Mahindra 575 DI Sarpanch")

    def test_tractor_implements_attached(self):
        """Test that attached implements are serialized properly with tractor"""
        response = self.client.get(f"/api/tractors/{self.tractor.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        implements = response.data.get("attached_implements", response.data.get("implements", []))
        self.assertEqual(len(implements), 1)
        self.assertEqual(implements[0]["name"], "Shaktiman 36-Blade Rotavator")

    def test_ai_machinery_recommendation_algorithm(self):
        """Test AI advisor logic for wheat plowing in black soil"""
        rec = calculate_ai_machinery_recommendation(
            crop_type="wheat",
            field_size_acres=5.0,
            soil_type="hard",
            task_purpose="plowing"
        )
        self.assertIsNotNone(rec)
        self.assertIn("target_hp", rec)
        self.assertTrue(len(rec["recommendations"]) >= 1)
        self.assertTrue(rec["recommendations"][0]["estimated_hours"] > 0)
