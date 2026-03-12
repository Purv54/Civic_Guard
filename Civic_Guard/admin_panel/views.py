from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q, Avg
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from complaints.models import Complaint, Department, ComplaintEngagement
from .serializers import (
    AdminComplaintListSerializer, AdminComplaintDetailSerializer,
    AdminComplaintUpdateStatusSerializer, AdminDashboardSerializer
)

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users (role='admin' or is_staff).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check standard Django is_staff/is_superuser
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # Check custom profile role if exists
        try:
            return request.user.profile.role == 'admin'
        except AttributeError:
            return False

class ComplaintFilter(django_filters.FilterSet):
    min_date = django_filters.DateTimeFilter(field_name="created_at", lookup_expr='gte')
    max_date = django_filters.DateTimeFilter(field_name="created_at", lookup_expr='lte')
    risk_level = django_filters.NumberFilter(method='filter_risk_level')

    class Meta:
        model = Complaint
        fields = ['status', 'urgency', 'category', 'location', 'city', 'state', 'is_public', 'is_verified']

    def filter_risk_level(self, queryset, name, value):
        # Example logic for filtering by engagement count if needed
        return queryset.annotate(num_engagements=Count('engagements')).filter(num_engagements__gte=value)

class AdminComplaintViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Admin to manage complaints.
    """
    queryset = Complaint.objects.all().annotate(
        engagement_count=Count('engagements')
    ).order_by('-created_at')
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ComplaintFilter
    search_fields = ['title', 'description', 'tracking_id', 'citizen__username', 'citizen__email']
    ordering_fields = ['created_at', 'urgency', 'status', 'engagement_count']

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminComplaintListSerializer
        if self.action in ['retrieve', 'update', 'partial_update']:
            if self.request.method in ['PATCH', 'PUT']:
                return AdminComplaintUpdateStatusSerializer
            return AdminComplaintDetailSerializer
        return AdminComplaintDetailSerializer

    @action(detail=False, methods=['get'])
    def engagement_summary(self, request):
        """
        Identify high-risk complaints based on engagement count.
        """
        high_risk_complaints = Complaint.objects.annotate(
            risk_confirmations=Count('engagements', filter=Q(engagements__engagement_type='risk'))
        ).filter(risk_confirmations__gt=0).order_by('-risk_confirmations')[:20]
        
        serializer = AdminComplaintListSerializer(high_risk_complaints, many=True)
        return Response(serializer.data)

class AdminDashboardAPIView(APIView):
    """
    API for Dashboard Analytics.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_complaints = Complaint.objects.count()
        high_urgency_count = Complaint.objects.filter(urgency__in=['high', 'critical']).count()
        pending_count = Complaint.objects.filter(status='pending').count()
        resolved_count = Complaint.objects.filter(status='resolved').count()
        total_public_count = Complaint.objects.filter(is_public=True).count()

        # Top 5 high-risk complaints based on total engagements
        top_high_risk = Complaint.objects.annotate(
            engagement_count=Count('engagements')
        ).order_by('-engagement_count')[:5]

        # Status distribution
        status_counts = Complaint.objects.values('status').annotate(count=Count('id'))
        status_dist = {item['status']: item['count'] for item in status_counts}

        # Category distribution
        category_counts = Complaint.objects.values('category').annotate(count=Count('id'))
        category_dist = {item['category']: item['count'] for item in category_counts}

        data = {
            'total_complaints': total_complaints,
            'high_urgency_count': high_urgency_count,
            'pending_count': pending_count,
            'resolved_count': resolved_count,
            'total_public_count': total_public_count,
            'top_high_risk_complaints': AdminComplaintListSerializer(top_high_risk, many=True).data,
            'status_distribution': status_dist,
            'category_distribution': category_dist
        }

        return Response(data)
