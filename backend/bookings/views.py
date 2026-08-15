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
        booking = serializer.save(customer=self.request.user)

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

    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, pk=None):
        booking = self.get_object()

        if request.user.role not in ["owner", "admin"]:
            return Response({"error": "Only owner or admin can mark booking as completed."}, status=status.HTTP_403_FORBIDDEN)

        if request.user.role == "owner" and booking.tractor.owner != request.user:
            return Response({"error": "You do not own this tractor."}, status=status.HTTP_403_FORBIDDEN)

        if booking.status not in ["approved", "paid"]:
            return Response({"error": "Only approved or paid bookings can be completed."}, status=status.HTTP_400_BAD_REQUEST)

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
