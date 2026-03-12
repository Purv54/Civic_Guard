from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """CivicGuard API root — lists available endpoint groups."""
    return Response({
        'name': 'CivicGuard API',
        'version': '1.0',
        'description': 'AI-Powered Smart Government Grievance System',
        'endpoints': {
            'auth': {
                'register':        request.build_absolute_uri('/api/auth/register/'),
                'login':           request.build_absolute_uri('/api/auth/login/'),
                'logout':          request.build_absolute_uri('/api/auth/logout/'),
                'me':              request.build_absolute_uri('/api/auth/me/'),
                'change_password': request.build_absolute_uri('/api/auth/change-password/'),
            },
            'citizen': {
                'dashboard':   request.build_absolute_uri('/api/dashboard/'),
                'complaints':  request.build_absolute_uri('/api/complaints/'),
                'track':       request.build_absolute_uri('/api/complaints/track/?id=<tracking_id>'),
                'departments': request.build_absolute_uri('/api/departments/'),
            },
            'admin': {
                'dashboard':    request.build_absolute_uri('/api/admin/dashboard/'),
                'complaints':   request.build_absolute_uri('/api/admin/complaints/'),
                'engagement':   request.build_absolute_uri('/api/admin/engagement-summary/'),
            },
            'django_admin': request.build_absolute_uri('/admin/'),
        },
    })


urlpatterns = [
    path('admin/',      admin.site.urls),
    path('api/admin/',  include('admin_panel.urls')),
    path('api/',        include('complaints.urls')),
    path('',            api_root, name='api-root'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
