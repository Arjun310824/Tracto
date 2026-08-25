from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class AccountsUnitAndIntegrationTests(TestCase):
    """
    Unit and Integration tests for Accounts module:
    - User Registration & Roles
    - JWT Authentication & Token Exchange
    - Profile Management
    - Role Permission Guard
    """

    def setUp(self):
        self.client = APIClient()
        self.farmer_data = {
            "email": "farmer_test@tracto.com",
            "password": "Password@123",
            "first_name": "Ramesh",
            "last_name": "Patel",
            "phone": "9876543210",
            "role": "customer",
            "district": "Ahmedabad",
            "village": "Sanand"
        }
        self.owner_data = {
            "email": "owner_test@tracto.com",
            "password": "Password@123",
            "first_name": "Mukesh",
            "last_name": "Shah",
            "phone": "9876543211",
            "role": "owner",
            "district": "Rajkot",
            "village": "Gondal"
        }

    def test_customer_registration_success(self):
        """Test registering a new customer/farmer account"""
        response = self.client.post("/api/accounts/register/", self.farmer_data, format="json")
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.assertTrue(User.objects.filter(email="farmer_test@tracto.com").exists())
        user = User.objects.get(email="farmer_test@tracto.com")
        self.assertEqual(user.role, "customer")
        self.assertEqual(user.district, "Ahmedabad")

    def test_owner_registration_and_login_jwt(self):
        """Test owner registration and subsequent JWT token issuance"""
        reg_response = self.client.post("/api/accounts/register/", self.owner_data, format="json")
        self.assertIn(reg_response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

        login_response = self.client.post("/api/accounts/login/", {
            "email": "owner_test@tracto.com",
            "password": "Password@123"
        }, format="json")
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)
        self.assertIn("refresh", login_response.data)
        self.assertEqual(login_response.data["user"]["role"], "owner")

    def test_invalid_login_credentials(self):
        """Test rejection of incorrect password"""
        self.client.post("/api/accounts/register/", self.farmer_data, format="json")
        response = self.client.post("/api/accounts/login/", {
            "email": "farmer_test@tracto.com",
            "password": "WrongPassword"
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_retrieval_with_token(self):
        """Test fetching authenticated user profile"""
        self.client.post("/api/accounts/register/", self.farmer_data, format="json")
        login_res = self.client.post("/api/accounts/login/", {
            "email": "farmer_test@tracto.com",
            "password": "Password@123"
        }, format="json")
        token = login_res.data["access"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        profile_res = self.client.get("/api/accounts/profile/")
        self.assertEqual(profile_res.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_res.data["email"], "farmer_test@tracto.com")
        self.assertEqual(profile_res.data["first_name"], "Ramesh")
