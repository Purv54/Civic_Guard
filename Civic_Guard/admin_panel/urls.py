from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminComplaintViewSet, AdminDashboardAPIView

router = DefaultRouter()
router.register(r'complaints', AdminComplaintViewSet, basename='admin-complaints')

urlpatterns = [
    path('dashboard/', AdminDashboardAPIView.as_view(), name='admin-dashboard'),
    path('engagement-summary/', AdminComplaintViewSet.as_view({'get': 'engagement_summary'}), name='admin-engagement-summary'),
    path('', include(router.urls)),
]
