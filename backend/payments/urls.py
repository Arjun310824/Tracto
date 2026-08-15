from django.urls import path
from .views import (
    CreateOrderAPIView,
    VerifyPaymentAPIView,
    PaymentHistoryView,
    RefundPaymentAPIView,
    OwnerEarningsBreakdownAPIView,
    OwnerRequestPayoutAPIView
)

urlpatterns = [
    path("create-order/", CreateOrderAPIView.as_view(), name="create-payment-order"),
    path("verify/", VerifyPaymentAPIView.as_view(), name="verify-payment"),
    path("history/", PaymentHistoryView.as_view(), name="payment-history"),
    path("<int:payment_id>/refund/", RefundPaymentAPIView.as_view(), name="refund-payment"),
    path("owner-earnings/", OwnerEarningsBreakdownAPIView.as_view(), name="owner-earnings-breakdown"),
    path("request-payout/", OwnerRequestPayoutAPIView.as_view(), name="owner-request-payout"),
]


