from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Q
from .models import Complaint, Notification, SystemSettings
from .serializers import (
    NotificationSerializer, SystemSettingsSerializer, HeatmapSerializer
)
from .services.trend_service import get_category_trends

class HeatmapView(generics.ListAPIView):
    """
    GET /api/public/heatmap/
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = HeatmapSerializer
    
    def get_queryset(self):
        return Complaint.objects.filter(
            is_public=True,
            latitude__isnull=False,
            longitude__isnull=False
        ).exclude(status__in=['resolved', 'closed', 'rejected'])

class TrendsView(APIView):
    """
    GET /api/admin/trends/
    """
    permission_classes = [permissions.IsAuthenticated] # Or IsAdminOrStaff if imported
    
    def get(self, request):
        trends = get_category_trends()
        return Response(trends)

class NotificationListView(generics.ListAPIView):
    """
    GET /api/notifications/
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class NotificationReadView(APIView):
    """
    PATCH /api/notifications/:id/read/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'status': 'read'})
        except Notification.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

class RouteRiskView(APIView):
    """
    GET /api/public/route-risk/
    Input: start_lat, start_lng, end_lat, end_lng
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        try:
            s_lat = float(request.query_params.get('start_lat'))
            s_lng = float(request.query_params.get('start_lng'))
            e_lat = float(request.query_params.get('end_lat'))
            e_lng = float(request.query_params.get('end_lng'))
        except (TypeError, ValueError):
            return Response({'error': 'Invalid coordinates'}, status=400)
            
        # Bounding box
        min_lat, max_lat = min(s_lat, e_lat), max(s_lat, e_lat)
        min_lng, max_lng = min(s_lng, e_lng), max(s_lng, e_lng)
        
        # Add a small buffer (e.g. 0.01 degrees ~1km)
        buffer = 0.01
        
        complaints = Complaint.objects.filter(
            latitude__range=(min_lat - buffer, max_lat + buffer),
            longitude__range=(min_lng - buffer, max_lng + buffer),
            is_public=True
        ).exclude(status__in=['resolved', 'closed'])
        
        count = complaints.count()
        avg_risk = complaints.aggregate(Avg('risk_score'))['risk_score__avg'] or 0
        
        risk_level = "Low"
        if avg_risk > 70 or count > 10:
            risk_level = "High"
        elif avg_risk > 40 or count > 5:
            risk_level = "Medium"
            
        return Response({
            'risk_level': risk_level,
            'avg_risk_score': int(avg_risk),
            'active_complaints': count
        })

class EmergencyModeView(APIView):
    """
    PATCH /api/admin/emergency/
    """
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        settings, _ = SystemSettings.objects.get_or_create(id=1)
        return Response(SystemSettingsSerializer(settings).data)

    def patch(self, request):
        settings, _ = SystemSettings.objects.get_or_create(id=1)
        serializer = SystemSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # If enabled, notify everyone? (Optional based on performance)
            if settings.emergency_mode:
                # We could trigger a signals broadcast here
                pass
                
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
