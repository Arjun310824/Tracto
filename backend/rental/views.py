from datetime import date
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q

from .models import Tractor, TractorImage, Wishlist, Implement
from .serializers import TractorSerializer, TractorImageSerializer, WishlistSerializer, ImplementSerializer
from .permissions import IsOwnerOrReadOnly
from .ai_engine import calculate_ai_machinery_recommendation, calculate_ai_price_advisor
from bookings.models import Booking



class ImplementViewSet(viewsets.ModelViewSet):
    queryset = Implement.objects.all()
    serializer_class = ImplementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Implement.objects.all()
        tractor_id = self.request.query_params.get("tractor_id", None)
        category = self.request.query_params.get("category", None)

        if tractor_id:
            queryset = queryset.filter(tractor_id=tractor_id)
        if category:
            queryset = queryset.filter(category=category)

        return queryset.filter(available=True)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TractorViewSet(viewsets.ModelViewSet):

    queryset = Tractor.objects.all()
    serializer_class = TractorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = Tractor.objects.all()

        # Non-admins only see approved tractors (owners also see their own unapproved ones)
        if not (user.is_authenticated and user.role == "admin"):
            if user.is_authenticated and user.role == "owner":
                queryset = queryset.filter(Q(is_approved_by_admin=True) | Q(owner=user))
            else:
                queryset = queryset.filter(is_approved_by_admin=True)

        # Automatic Date Availability Exclusions:
        # Exclude tractors that are currently booked today (status: approved/paid, start_date <= today <= end_date)
        today = date.today()
        currently_booked_tractor_ids = Booking.objects.filter(
            status__in=["approved", "paid"],
            start_date__lte=today,
            end_date__gte=today
        ).values_list("tractor_id", flat=True)

        # Allow tractor owners to see their own tractors in My Tractors even if booked
        if not (user.is_authenticated and user.role == "owner"):
            queryset = queryset.exclude(id__in=currently_booked_tractor_ids)

        # Target date window filtering (if customer searches for specific dates)
        params = getattr(self.request, "query_params", self.request.GET)
        req_start = params.get("start_date", None)
        req_end = params.get("end_date", None)
        if req_start and req_end:
            overlapping_tractor_ids = Booking.objects.filter(
                status__in=["pending", "approved", "paid"],
                start_date__lte=req_end,
                end_date__gte=req_start
            ).values_list("tractor_id", flat=True)
            queryset = queryset.exclude(id__in=overlapping_tractor_ids)

        # Filters & Search
        search = params.get("search", None)
        brand = params.get("brand", None)
        min_price = params.get("min_price", None)
        max_price = params.get("max_price", None)
        min_hp = params.get("min_hp", None)
        max_hp = params.get("max_hp", None)
        location = params.get("location", None)
        district = params.get("district", None)
        state = params.get("state", None)
        availability = params.get("available", None)
        owner_id = params.get("owner_id", None)
        sort_by = params.get("sort_by", None)



        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(brand__icontains=search) |
                Q(model__icontains=search) |
                Q(location__icontains=search) |
                Q(district__icontains=search) |
                Q(description__icontains=search)
            )

        if brand:
            queryset = queryset.filter(brand__iexact=brand)
        if min_price:
            queryset = queryset.filter(rent_per_day__gte=min_price)
        if max_price:
            queryset = queryset.filter(rent_per_day__lte=max_price)
        if min_hp:
            queryset = queryset.filter(horsepower__gte=min_hp)
        if max_hp:
            queryset = queryset.filter(horsepower__lte=max_hp)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if district:
            queryset = queryset.filter(district__icontains=district)
        if state:
            queryset = queryset.filter(state__icontains=state)
        if availability is not None:
            is_avail = availability.lower() in ['true', '1']
            queryset = queryset.filter(available=is_avail)
        if owner_id:
            queryset = queryset.filter(owner_id=owner_id)

        # Sorting
        if sort_by == "lowest_price":
            queryset = queryset.order_by("rent_per_day")
        elif sort_by == "highest_price":
            queryset = queryset.order_by("-rent_per_day")
        elif sort_by == "rating":
            queryset = queryset.order_by("-avg_rating")
        elif sort_by == "newest":
            queryset = queryset.order_by("-created_at")
        else:
            queryset = queryset.order_by("-created_at")

        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def upload_images(self, request, pk=None):
        tractor = self.get_object()
        if tractor.owner != request.user and request.user.role != "admin":
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        images = request.FILES.getlist("images")
        saved_images = []
        for img in images:
            t_img = TractorImage.objects.create(tractor=tractor, image=img)
            saved_images.append(TractorImageSerializer(t_img).data)

        return Response({"message": "Images uploaded successfully", "images": saved_images})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def toggle_approval(self, request, pk=None):
        if request.user.role != "admin":
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

        tractor = self.get_object()
        tractor.is_approved_by_admin = not tractor.is_approved_by_admin
        tractor.save()
        return Response({
            "message": f"Tractor {'approved' if tractor.is_approved_by_admin else 'unapproved'} successfully",
            "is_approved_by_admin": tractor.is_approved_by_admin
        })


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(customer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    @action(detail=False, methods=["post"], url_path="toggle")
    def toggle(self, request):
        tractor_id = request.data.get("tractor_id")
        if not tractor_id:
            return Response({"error": "tractor_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tractor = Tractor.objects.get(id=tractor_id)
        except Tractor.DoesNotExist:
            return Response({"error": "Tractor not found"}, status=status.HTTP_404_NOT_FOUND)

        wishlist_item = Wishlist.objects.filter(customer=request.user, tractor=tractor).first()
        if wishlist_item:
            wishlist_item.delete()
            return Response({"message": "Removed from wishlist", "is_favorite": False})
        else:
            Wishlist.objects.create(customer=request.user, tractor=tractor)
            return Response({"message": "Added to wishlist", "is_favorite": True})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def ai_recommend_machinery_view(request):
    data = request.data
    crop_type = data.get("crop_type", "general")
    field_size_acres = data.get("field_size_acres", 5)
    soil_type = data.get("soil_type", "medium")
    task_purpose = data.get("task_purpose", "plowing")
    district = data.get("district", None)

    result = calculate_ai_machinery_recommendation(
        crop_type=crop_type,
        field_size_acres=field_size_acres,
        soil_type=soil_type,
        task_purpose=task_purpose,
        district=district
    )
    return Response(result, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticatedOrReadOnly])
def ai_price_advisor_view(request):
    data = request.data
    horsepower = data.get("horsepower", 45)
    manufacturing_year = data.get("manufacturing_year", 2022)
    brand = data.get("brand", "Mahindra")
    district = data.get("district", None)

    result = calculate_ai_price_advisor(
        horsepower=horsepower,
        manufacturing_year=manufacturing_year,
        brand=brand,
        district=district
    )
    return Response(result, status=status.HTTP_200_OK)
