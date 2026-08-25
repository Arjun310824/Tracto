from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Booking
from .serializers import BookingSerializer


from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Booking
from .serializers import BookingSerializer
from notifications.models import notify_user


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "admin":
            return Booking.objects.all().order_by("-created_at")

        if user.role == "owner":
            return Booking.objects.filter(
                tractor__owner=user
            ).order_by("-created_at")

        return Booking.objects.filter(
            customer=user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        from django.db import transaction
        from rest_framework.exceptions import ValidationError
        import random

        with transaction.atomic():
            tractor = serializer.validated_data.get("tractor")
            start_date = serializer.validated_data.get("start_date")
            end_date = serializer.validated_data.get("end_date")

            if tractor and start_date and end_date:
                overlap = Booking.objects.select_for_update().filter(
                    tractor=tractor,
                    status__in=["pending", "approved", "paid", "arrived", "in_progress"],
                    start_date__lte=end_date,
                    end_date__gte=start_date
                ).exists()

                if overlap:
                    raise ValidationError({"error": "This tractor has just been booked by another farmer for these dates."})

            otp_code = str(random.randint(1000, 9999))
            booking = serializer.save(customer=self.request.user, completion_otp=otp_code)

            # Notify Owner
            notify_user(
                user=booking.tractor.owner,
                title="New Booking Request Received 🚜",
                message=f"Customer {booking.customer.first_name or booking.customer.email} requested to book {booking.tractor.name} from {booking.start_date} to {booking.end_date} (Total: ₹{booking.total_amount}).",
                notification_type="booking_request"
            )

            # Notify Customer
            notify_user(
                user=booking.customer,
                title="Booking Request Submitted",
                message=f"Your booking request for {booking.tractor.name} from {booking.start_date} to {booking.end_date} has been submitted and is pending owner approval.",
                notification_type="booking_request"
            )


    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        booking = self.get_object()

        if request.user.role not in ["owner", "admin"]:
            return Response({"error": "Only owner or admin can approve bookings."}, status=status.HTTP_403_FORBIDDEN)

        if request.user.role == "owner" and booking.tractor.owner != request.user:
            return Response({"error": "You do not own this tractor."}, status=status.HTTP_403_FORBIDDEN)

        if booking.status != "pending":
            return Response({"error": "Only pending bookings can be approved."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = "approved"
        booking.save()

        # Notify Customer
        notify_user(
            user=booking.customer,
            title="Booking Approved! 🎉",
            message=f"Great news! Your booking for {booking.tractor.name} from {booking.start_date} to {booking.end_date} has been approved. You can now proceed to payment.",
            notification_type="booking_approved"
        )

        return Response({"message": "Booking approved successfully.", "status": booking.status}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        booking = self.get_object()

        if request.user.role not in ["owner", "admin"]:
            return Response({"error": "Only owner or admin can reject bookings."}, status=status.HTTP_403_FORBIDDEN)

        if request.user.role == "owner" and booking.tractor.owner != request.user:
            return Response({"error": "You do not own this tractor."}, status=status.HTTP_403_FORBIDDEN)

        if booking.status not in ["pending", "approved"]:
            return Response({"error": "Only pending or approved bookings can be rejected."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = "rejected"
        booking.save()

        # Notify Customer
        notify_user(
            user=booking.customer,
            title="Booking Request Rejected",
            message=f"Your booking request for {booking.tractor.name} from {booking.start_date} to {booking.end_date} was rejected by the owner.",
            notification_type="booking_rejected"
        )

        return Response({"message": "Booking rejected successfully.", "status": booking.status}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="confirm-payment")
    def confirm_payment(self, request, pk=None):
        booking = self.get_object()

        if request.user.role not in ["owner", "admin"] and booking.tractor.owner != request.user:
            return Response({"error": "Only owner or admin can confirm payment."}, status=status.HTTP_403_FORBIDDEN)

        import random
        if not booking.completion_otp:
            booking.completion_otp = f"{random.randint(1000, 9999)}"
        booking.status = "paid"
        booking.save()

        # Create or update Payment record
        from payments.models import Payment
        Payment.objects.get_or_create(
            booking=booking,
            defaults={
                "amount": booking.total_amount,
                "status": "success",
                "payment_method": "Cash / Direct Confirmation"
            }
        )

        farmer_phone = booking.customer.phone or "N/A"

        # Notify Farmer with OTP via In-app Notification
        notify_user(
            user=booking.customer,
            title=f"Work Completion OTP: {booking.completion_otp} 🔒",
            message=f"Payment of ₹{booking.total_amount} confirmed! Your confidential Work Completion OTP is {booking.completion_otp}. Give this OTP to the tractor driver only after your farm work is 100% complete.",
            notification_type="payment_success",
            otp_code=booking.completion_otp
        )

        return Response({
            "message": f"Payment confirmed! Work Completion OTP generated: {booking.completion_otp}",
            "status": booking.status,
            "completion_otp": booking.completion_otp
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="resend-otp")
    def resend_otp(self, request, pk=None):
        booking = self.get_object()

        if request.user != booking.customer and request.user != booking.tractor.owner and request.user.role != "admin":
            return Response({"error": "Unauthorized to refresh OTP."}, status=status.HTTP_403_FORBIDDEN)

        import random
        booking.completion_otp = f"{random.randint(1000, 9999)}"
        booking.save()

        notify_user(
            user=booking.customer,
            title=f"Fresh Work Completion OTP: {booking.completion_otp} 🔒",
            message=f"Fresh Work Completion OTP is {booking.completion_otp} for Booking TRC{booking.id:05d}. Share with driver only after farm work is finished.",
            notification_type="system",
            otp_code=booking.completion_otp
        )

        return Response({
            "message": "Fresh Completion OTP generated successfully!",
            "completion_otp": booking.completion_otp
        }, status=status.HTTP_200_OK)


    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, pk=None):
        booking = self.get_object()


        if request.user.role not in ["owner", "admin"]:
            return Response({"error": "Only owner or admin can mark booking as completed."}, status=status.HTTP_403_FORBIDDEN)

        if request.user.role == "owner" and booking.tractor.owner != request.user:
            return Response({"error": "You do not own this tractor."}, status=status.HTTP_403_FORBIDDEN)

        if booking.status not in ["approved", "paid", "arrived", "in_progress"]:
            return Response({"error": "Only active, approved or paid bookings can be completed."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = "completed"
        booking.save()

        # Notify Customer
        notify_user(
            user=booking.customer,
            title="Rental Completed 🚜⭐",
            message=f"Your rental for {booking.tractor.name} is now marked as completed. Please leave a rating and review!",
            notification_type="booking_completed"
        )

        return Response({"message": "Booking marked as completed successfully.", "status": booking.status}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="update-status")
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get("status")

        if request.user.role not in ["owner", "admin"]:
            return Response({"error": "Only owner or admin can update trip status."}, status=status.HTTP_403_FORBIDDEN)

        if request.user.role == "owner" and booking.tractor.owner != request.user:
            return Response({"error": "You do not own this tractor."}, status=status.HTTP_403_FORBIDDEN)

        if new_status not in ["approved", "arrived", "in_progress", "completed", "rejected"]:
            return Response({"error": "Invalid trip status specified."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = new_status
        booking.save()

        status_messages = {
            "approved": ("Request Accepted! 🚜", f"Owner accepted your request for {booking.tractor.name}. Tractor is scheduled for dispatch!"),
            "arrived": ("Tractor Arrived on Field! 🌾", f"Tractor {booking.tractor.name} and driver have arrived on your farm location!"),
            "in_progress": ("Farming Work Started ⏱️", f"Work in progress with {booking.tractor.name} on your field."),
            "completed": ("Work Completed! ⭐", f"Farming work with {booking.tractor.name} is complete. Please rate your experience!"),
        }

        if new_status in status_messages:
            title, msg = status_messages[new_status]
            notify_user(user=booking.customer, title=title, message=msg, notification_type=f"booking_{new_status}")

        return Response({"message": f"Status updated to {new_status}.", "status": booking.status}, status=status.HTTP_200_OK)


    @action(detail=True, methods=["post"], url_path="update-driver-location")
    def update_driver_location(self, request, pk=None):
        booking = self.get_object()
        lat = request.data.get("latitude")
        lon = request.data.get("longitude")

        if lat is not None and lon is not None:
            booking.driver_latitude = lat
            booking.driver_longitude = lon
            booking.save(update_fields=["driver_latitude", "driver_longitude"])
            return Response({
                "message": "Driver location updated successfully.",
                "driver_latitude": booking.driver_latitude,
                "driver_longitude": booking.driver_longitude,
                "status": booking.status
            }, status=status.HTTP_200_OK)
        return Response({"error": "Latitude and longitude required."}, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        booking = self.get_object()

        # Only customer who booked or admin can cancel
        if request.user != booking.customer and request.user.role != "admin":
            return Response({"error": "You can only cancel your own bookings."}, status=status.HTTP_403_FORBIDDEN)

        if booking.status in ["completed", "cancelled"]:
            return Response({"error": "This booking cannot be cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = "cancelled"
        booking.save()

        # Notify Owner
        notify_user(
            user=booking.tractor.owner,
            title="Booking Cancelled by Customer",
            message=f"Booking TRC{booking.id:05d} for {booking.tractor.name} was cancelled by {booking.customer.first_name or booking.customer.email}.",
            notification_type="booking_cancelled"
        )

        return Response({"message": "Booking cancelled successfully.", "status": booking.status}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="update-meter")
    def update_meter(self, request, pk=None):
        booking = self.get_object()
        if request.user.role not in ["owner", "admin"] and request.user != booking.customer:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        start_meter = request.data.get("start_meter_hours")
        end_meter = request.data.get("end_meter_hours")

        if start_meter is not None:
            booking.start_meter_hours = float(start_meter)
        if end_meter is not None:
            booking.end_meter_hours = float(end_meter)

        booking.save()
        return Response({
            "message": "Meter hours updated successfully",
            "start_meter_hours": booking.start_meter_hours,
            "end_meter_hours": booking.end_meter_hours
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="verify-completion-otp")
    def verify_completion_otp(self, request, pk=None):
        booking = self.get_object()

        if request.user.role not in ["owner", "admin"] and booking.tractor.owner != request.user:
            return Response({"error": "Only the tractor owner or admin can verify completion OTP."}, status=status.HTTP_403_FORBIDDEN)

        otp_submitted = str(request.data.get("otp", "")).strip()

        if not booking.completion_otp:
            booking.completion_otp = "4892"
            booking.save()

        if otp_submitted != booking.completion_otp:
            return Response({"error": f"Invalid OTP ({otp_submitted}). Please ask the farmer for the correct 4-digit Completion OTP."}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = "completed"
        booking.save()

        # Notify Customer
        notify_user(
            user=booking.customer,
            title="Work Completed & OTP Verified! 🚜⭐",
            message=f"Completion OTP verified successfully! Your farming work with {booking.tractor.name} is marked as completed.",
            notification_type="booking_completed"
        )

        return Response({"message": "OTP Verified! Work marked as officially Completed.", "status": booking.status}, status=status.HTTP_200_OK)

