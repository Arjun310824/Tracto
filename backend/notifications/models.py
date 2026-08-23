from django.db import models
from accounts.models import User
from django.core.mail import send_mail
from django.conf import settings


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ("booking_request", "Booking Request"),
        ("booking_approved", "Booking Approved"),
        ("booking_rejected", "Booking Rejected"),
        ("booking_cancelled", "Booking Cancelled"),
        ("payment_success", "Payment Success"),
        ("booking_completed", "Booking Completed"),
        ("system", "System Notification"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default="system")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} - {self.title}"


def notify_user(user, title, message, notification_type="system", send_email=True, otp_code=None):
    """Utility function to create DB notification, send email, and trigger real SMS."""
    # Create DB notification
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type
    )

    # Trigger Real SMS if OTP is present or phone is available
    if otp_code and getattr(user, "phone", None):
        try:
            from .sms_service import send_sms_otp
            send_sms_otp(phone_number=user.phone, otp_code=otp_code, purpose="Work Completion")
        except Exception as e:
            print(f"Error sending SMS OTP: {e}")

    # Send Email Notification
    if send_email and user.email:
        try:
            send_mail(
                subject=f"[TRACTO] {title}",
                message=f"Hello {user.first_name or 'User'},\n\n{message}\n\nThank you,\nTRACTO Rental Team",
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@tracto.com"),
                recipient_list=[user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Error sending email to {user.email}: {e}")

    return notification

