from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Review.objects.all()
        tractor_id = self.request.query_params.get("tractor_id")
        if tractor_id:
            queryset = queryset.filter(tractor_id=tractor_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
