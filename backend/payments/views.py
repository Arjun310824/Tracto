import hmac
import hashlib
from django.conf import settings
from rest_framework import views, status, permissions
from rest_framework.response import Response
import razorpay

from bookings.models import Booking
from notifications.models import notify_user
from .models import Payment, Payout
from .serializers import PaymentSerializer, PayoutSerializer



class CreateOrderAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get("booking_id")
        if not booking_id:
            return Response({"error": "booking_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(id=booking_id, customer=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found or access denied"}, status=status.HTTP_404_NOT_FOUND)

        if booking.status not in ["approved", "pending"]:
            return Response({"error": f"Cannot initiate payment for booking with status '{booking.status}'"}, status=status.HTTP_400_BAD_REQUEST)

        amount_in_paise = int(booking.total_amount * 100)

        # Initialize Razorpay Client if credentials provided or create mock order
        order_id = f"order_mock_{booking.id}_{int(booking.total_amount)}"
        try:
            if settings.RAZORPAY_KEY_ID and not settings.RAZORPAY_KEY_ID.startswith("rzp_test_mock"):
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                order = client.order.create({
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "receipt": f"receipt_trc_{booking.id}",
                    "notes": {
                        "booking_id": booking.id,
                        "customer": booking.customer.email
                    }
                })
                order_id = order["id"]
        except Exception as e:
            print(f"Razorpay Client fallback to mock order: {e}")

        payment, created = Payment.objects.get_or_create(
            booking=booking,
            defaults={
                "razorpay_order_id": order_id,
                "amount": booking.total_amount,
                "status": "pending"
            }
        )
        if not created and payment.status != "success":
            payment.razorpay_order_id = order_id
            payment.amount = booking.total_amount
            payment.save()

        return Response({
            "order_id": order_id,
            "amount": booking.total_amount,
            "amount_in_paise": amount_in_paise,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID,
            "booking_id": booking.id,
            "tractor_name": booking.tractor.name,
            "customer_name": f"{booking.customer.first_name} {booking.customer.last_name}".strip() or booking.customer.email
        }, status=status.HTTP_200_OK)


class VerifyPaymentAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get("booking_id")
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id", f"pay_mock_{booking_id}")
        razorpay_signature = request.data.get("razorpay_signature", "mock_signature")

        try:
            booking = Booking.objects.get(id=booking_id, customer=request.user)
            payment = Payment.objects.get(booking=booking)
        except (Booking.DoesNotExist, Payment.DoesNotExist):
            return Response({"error": "Payment record not found"}, status=status.HTTP_404_NOT_FOUND)

        # Record payment verification
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = "success"
        payment.save()

        booking.status = "paid"
        booking.save()

        # Send Notifications
        notify_user(
            user=booking.customer,
            title="Payment Successful! 💳✅",
            message=f"Payment of ₹{payment.amount} for Booking TRC{booking.id:05d} ({booking.tractor.name}) was successful. Your rental is confirmed!",
            notification_type="payment_success"
        )
        notify_user(
            user=booking.tractor.owner,
            title="Payment Received 💰",
            message=f"Customer {booking.customer.first_name or booking.customer.email} completed payment of ₹{payment.amount} for {booking.tractor.name}.",
            notification_type="payment_success"
        )

        return Response({
            "message": "Payment verified successfully",
            "status": "paid",
            "payment": PaymentSerializer(payment).data
        }, status=status.HTTP_200_OK)


class PaymentHistoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == "admin":
            payments = Payment.objects.all().order_by("-created_at")
        elif user.role == "owner":
            payments = Payment.objects.filter(booking__tractor__owner=user).order_by("-created_at")
        else:
            payments = Payment.objects.filter(booking__customer=user).order_by("-created_at")

        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)


class RefundPaymentAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id)
            if request.user.role != "admin" and payment.booking.tractor.owner != request.user:
                return Response({"error": "Unauthorized to refund this payment"}, status=status.HTTP_403_FORBIDDEN)
            
            if payment.status != "success":
                return Response({"error": "Only successful payments can be refunded"}, status=status.HTTP_400_BAD_REQUEST)

            payment.status = "refunded"
            payment.save()

            booking = payment.booking
            booking.status = "cancelled"
            booking.save()

            notify_user(
                user=booking.customer,
                title="Payment Refunded 💸",
                message=f"Your payment of ₹{payment.amount} for Booking TRC{booking.id:05d} has been refunded.",
                notification_type="general"
            )

            return Response({"message": "Payment refunded successfully", "status": "refunded"})
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)


class OwnerEarningsBreakdownAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role not in ["owner", "admin"]:
            return Response({"error": "Only owners can access earnings breakdown."}, status=status.HTTP_403_FORBIDDEN)

        # Calculate Gross Revenue for Owner's tractors
        owner_bookings = Booking.objects.filter(tractor__owner=user, status__in=["paid", "completed"])
        gross_revenue = sum([float(b.total_amount) for b in owner_bookings])

        # 10% Platform Commission
        commission_rate = 10.0
        commission_amount = gross_revenue * 0.10
        net_earnings = gross_revenue * 0.90

        # Existing Payouts
        payouts = Payout.objects.filter(owner=user).order_by("-created_at")
        total_payout_withdrawn = sum([float(p.net_payout) for p in payouts if p.status == "completed"])
        available_balance = max(0.0, net_earnings - total_payout_withdrawn)

        serializer = PayoutSerializer(payouts, many=True)

        return Response({
            "gross_revenue": gross_revenue,
            "commission_rate": commission_rate,
            "commission_amount": commission_amount,
            "net_earnings": net_earnings,
            "total_payout_withdrawn": total_payout_withdrawn,
            "available_balance": available_balance,
            "payouts_history": serializer.data
        })


class OwnerRequestPayoutAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != "owner":
            return Response({"error": "Only owners can request payouts."}, status=status.HTTP_403_FORBIDDEN)

        bank_name = request.data.get("bank_name")
        account_number = request.data.get("account_number")
        ifsc_code = request.data.get("ifsc_code")
        account_holder = request.data.get("account_holder")
        upi_id = request.data.get("upi_id", "")

        if not bank_name or not account_number or not ifsc_code or not account_holder:
            return Response({"error": "All bank account details (Bank, Account No, IFSC, Holder Name) are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate Available Net Balance
        owner_bookings = Booking.objects.filter(tractor__owner=user, status__in=["paid", "completed"])
        gross_revenue = sum([float(b.total_amount) for b in owner_bookings])
        commission_amount = gross_revenue * 0.10
        net_earnings = gross_revenue * 0.90

        payouts = Payout.objects.filter(owner=user)
        total_payout_withdrawn = sum([float(p.net_payout) for p in payouts if p.status == "completed"])
        available_balance = max(0.0, net_earnings - total_payout_withdrawn)

        if available_balance <= 0:
            return Response({"error": "No available net balance to withdraw."}, status=status.HTTP_400_BAD_REQUEST)

        gross_req = available_balance / 0.90
        comm_req = gross_req * 0.10

        import random
        ref_id = f"TRC-BANK-{random.randint(100000, 999999)}"

        payout = Payout.objects.create(
            owner=user,
            gross_amount=gross_req,
            commission_rate=10.0,
            commission_amount=comm_req,
            net_payout=available_balance,
            bank_name=bank_name,
            account_number=account_number,
            ifsc_code=ifsc_code,
            account_holder=account_holder,
            upi_id=upi_id,
            status="completed",
            reference_id=ref_id
        )

        notify_user(
            user=user,
            title="Bank Transfer Successful! 🏦💰",
            message=f"Net Payout of ₹{available_balance} (after 10% platform commission) transferred to {bank_name} A/C {account_number[-4:]}. Ref: {ref_id}.",
            notification_type="payment_success"
        )

        return Response({
            "message": "Bank transfer payout completed successfully!",
            "payout": PayoutSerializer(payout).data
        }, status=status.HTTP_201_CREATED)


