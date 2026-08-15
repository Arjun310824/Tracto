from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth

from accounts.models import User
from rental.models import Tractor
from bookings.models import Booking
from payments.models import Payment


class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != "admin":
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

        total_users = User.objects.count()
        total_owners = User.objects.filter(role="owner").count()
        total_customers = User.objects.filter(role="customer").count()
        total_tractors = Tractor.objects.count()
        total_bookings = Booking.objects.count()

        # Revenue from successful payments or paid bookings
        total_revenue_agg = Payment.objects.filter(status="success").aggregate(Sum("amount"))["amount__sum"]
        if total_revenue_agg is None:
            total_revenue_agg = Booking.objects.filter(status__in=["paid", "completed"]).aggregate(Sum("total_amount"))["total_amount__sum"] or 0

        # Monthly Revenue & Bookings
        monthly_bookings = (
            Booking.objects.annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"), revenue=Sum("total_amount"))
            .order_by("month")
        )

        monthly_data = []
        for item in monthly_bookings:
            month_str = item["month"].strftime("%b %Y") if item["month"] else "Unknown"
            monthly_data.append({
                "month": month_str,
                "bookings": item["count"],
                "revenue": float(item["revenue"] or 0)
            })

        # Top Rented Tractors
        top_tractors = (
            Tractor.objects.annotate(booking_count=Count("bookings"))
            .order_by("-booking_count")[:5]
            .values("id", "name", "brand", "model", "rent_per_day", "booking_count")
        )

        # Top Active Owners
        top_owners = (
            User.objects.filter(role="owner")
            .annotate(tractor_count=Count("tractors"))
            .order_by("-tractor_count")[:5]
            .values("id", "first_name", "last_name", "email", "phone", "tractor_count")
        )

        # Top Active Customers
        top_customers = (
            User.objects.filter(role="customer")
            .annotate(booking_count=Count("bookings"))
            .order_by("-booking_count")[:5]
            .values("id", "first_name", "last_name", "email", "phone", "booking_count")
        )


        # Popular Locations
        popular_locations = (
            Tractor.objects.values("district")
            .annotate(tractor_count=Count("id"))
            .order_by("-tractor_count")[:5]
        )

        return Response({
            "total_users": total_users,
            "total_owners": total_owners,
            "total_customers": total_customers,
            "total_tractors": total_tractors,
            "total_bookings": total_bookings,
            "total_revenue": float(total_revenue_agg),
            "monthly_data": monthly_data,
            "top_tractors": list(top_tractors),
            "top_owners": list(top_owners),
            "top_customers": list(top_customers),
            "popular_locations": list(popular_locations),
        })

