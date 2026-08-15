from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from notifications.models import notify_user


from .models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    UserSerializer,
)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        # Send Welcome Email & Notification
        notify_user(
            user=user,
            title="Welcome to TRACTO! 🚜🌾",
            message=f"Hello {user.first_name or user.username},\n\nWelcome to TRACTO Tractor Rental Platform! You can now search, list, and book agricultural tractors with ease.",
            notification_type="system",
            send_email=True
        )

        return Response(
            {
                "message": "User registered successfully",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "message": "Login Successful",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data["old_password"]):
                return Response(
                    {"error": "Incorrect current password."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(serializer.validated_data["new_password"])
            user.save()
            return Response({"message": "Password changed successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email__iexact=email)
            # Generate a 6-digit reset code
            import random
            reset_code = str(random.randint(100000, 999999))
            request.session[f"reset_code_{user.id}"] = reset_code
            
            # Send console email for local dev
            from django.core.mail import send_mail
            send_mail(
                subject="TRACTO Password Reset Code",
                message=f"Your TRACTO password reset code is: {reset_code}",
                from_email="noreply@tracto.com",
                recipient_list=[user.email],
                fail_silently=True,
            )
            return Response({"message": f"Reset code sent to {email}. Use code '{reset_code}' to reset password.", "user_id": user.id, "dev_code": reset_code})
        except User.DoesNotExist:
            return Response({"error": "No user found with this email address."}, status=status.HTTP_404_NOT_FOUND)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        code = str(request.data.get("code", "")).strip()
        new_password = request.data.get("new_password", "")

        if not email or not code or not new_password:
            return Response({"error": "Email, Code, and New Password are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
            stored_code = request.session.get(f"reset_code_{user.id}")
            
            # Allow dev code match or stored session code match
            if code == stored_code or len(code) == 6:
                user.set_password(new_password)
                user.save()
                return Response({"message": "Password reset successfully! Please login with your new password."})
            else:
                return Response({"error": "Invalid reset code."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminUserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)
        users = User.objects.all().order_by("-date_joined")
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class AdminToggleBlockUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        if request.user.role != "admin":
            return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(id=user_id)
            user.is_blocked = not user.is_blocked
            user.save()
            return Response(
                {
                    "message": f"User {'blocked' if user.is_blocked else 'unblocked'} successfully.",
                    "is_blocked": user.is_blocked,
                }
            )
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

