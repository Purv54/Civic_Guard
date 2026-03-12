from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.db.models import Count, Avg, Q
from django.utils import timezone

from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Department, UserProfile, Complaint, ComplaintUpdate, AIAnalysisLog, ComplaintEngagement
from .serializers import (
    UserRegistrationSerializer,
    LoginSerializer,
    UserDetailSerializer,
    UserProfileSerializer,
    DepartmentSerializer,
    ComplaintListSerializer,
    ComplaintDetailSerializer,
    ComplaintCreateSerializer,
    ComplaintStatusUpdateSerializer,
    ComplaintEngagementSerializer,
    PublicComplaintSerializer,
    AnalyticsSummarySerializer,
)

import requests as http_requests
import logging

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Custom Permissions
# ──────────────────────────────────────────────

class IsAdminOrStaff(permissions.BasePermission):
    """Allow access only to admins or staff members."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True
        try:
            return request.user.profile.role in ('admin', 'staff')
        except UserProfile.DoesNotExist:
            return False


class IsComplaintOwner(permissions.BasePermission):
    """Allows citizen to access their own complaints only."""
    def has_object_permission(self, request, view, obj):
        return obj.citizen == request.user


# ──────────────────────────────────────────────
# Auth Views
# ──────────────────────────────────────────────

class RegisterView(APIView):
    """
    POST /api/auth/register/
    Register a new citizen account.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            user_data = UserDetailSerializer(user).data
            return Response(
                {
                    'message': 'Registration successful. Welcome to CivicGuard!',
                    'user': user_data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Authenticate a user and create a session.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            user_data = UserDetailSerializer(user).data
            return Response(
                {
                    'message': f'Welcome back, {user.first_name or user.username}!',
                    'user': user_data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Destroy the current session.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'You have been logged out.'}, status=status.HTTP_200_OK)


class MeView(APIView):
    """
    GET  /api/auth/me/   — Retrieve current user's profile
    PUT  /api/auth/me/   — Update current user's profile
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        # Update User fields
        user_fields = ['first_name', 'last_name', 'email']
        for field in user_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()

        # Update UserProfile fields
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=user)

        profile_serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if profile_serializer.is_valid():
            profile_serializer.save()

        return Response(UserDetailSerializer(user).data)

    def patch(self, request):
        return self.put(request)


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Allow authenticated user to change their password.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password', '')
        new_password = request.data.get('new_password', '')
        new_password2 = request.data.get('new_password2', '')

        if not user.check_password(old_password):
            return Response({'old_password': 'Incorrect current password.'}, status=400)
        if new_password != new_password2:
            return Response({'new_password2': 'Passwords do not match.'}, status=400)
        if len(new_password) < 8:
            return Response({'new_password': 'Password must be at least 8 characters.'}, status=400)

        user.set_password(new_password)
        user.save()
        login(request, user)  # Keep session alive after password change
        return Response({'message': 'Password changed successfully.'})


# ──────────────────────────────────────────────
# Department Views
# ──────────────────────────────────────────────

class DepartmentListView(generics.ListAPIView):
    """
    GET /api/departments/
    Public list of active departments (for complaint form dropdowns).
    """
    queryset = Department.objects.filter(is_active=True)
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]


class DepartmentAdminViewSet(generics.ListCreateAPIView):
    """
    GET  /api/admin/departments/  — List all departments
    POST /api/admin/departments/  — Create a department
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrStaff]


class DepartmentDetailAdminView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/PATCH/DELETE /api/admin/departments/<pk>/
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrStaff]


# ──────────────────────────────────────────────
# Citizen Complaint Views
# ──────────────────────────────────────────────

class MyComplaintsView(generics.ListCreateAPIView):
    """
    GET  /api/complaints/          — List my complaints
    POST /api/complaints/          — Submit a new complaint
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tracking_id', 'location', 'city']
    ordering_fields = ['created_at', 'status', 'urgency']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ComplaintCreateSerializer
        return ComplaintListSerializer

    def get_queryset(self):
        qs = Complaint.objects.filter(citizen=self.request.user).select_related(
            'citizen', 'department'
        )
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        category_param = self.request.query_params.get('category')
        if category_param:
            qs = qs.filter(category=category_param)
        return qs

    def create(self, request, *args, **kwargs):
        # LOG USER
        import sys
        print(f"\n--- ATTEMPTING SUBMISSION: User: {request.user} ---", file=sys.stderr)
        
        serializer = ComplaintCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            complaint = serializer.save()
            # Trigger async AI analysis
            _trigger_ai_analysis(complaint)
            detail = ComplaintDetailSerializer(complaint).data
            return Response(
                {
                    'message': 'Complaint submitted successfully!',
                    'tracking_id': complaint.tracking_id,
                    'complaint': detail,
                },
                status=status.HTTP_201_CREATED,
            )
        
        # LOG ERRORS TO TERMINAL
        import sys
        print("\n" + "="*40, file=sys.stderr)
        print("COMPLAINT VALIDATION FAILED", file=sys.stderr)
        print(f"Data received: {request.data}", file=sys.stderr)
        print(f"Errors: {serializer.errors}", file=sys.stderr)
        print("="*40 + "\n", file=sys.stderr)
        sys.stderr.flush()
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyComplaintDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/complaints/<pk>/   — View my complaint detail + timeline
    PUT    /api/complaints/<pk>/   — Edit my complaint (if still pending)
    DELETE /api/complaints/<pk>/   — Withdraw my complaint
    """
    permission_classes = [permissions.IsAuthenticated, IsComplaintOwner]
    serializer_class = ComplaintDetailSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Complaint.objects.filter(citizen=self.request.user).select_related(
            'citizen', 'department'
        ).prefetch_related('updates__updated_by')

    def update(self, request, *args, **kwargs):
        complaint = self.get_object()
        if complaint.status not in ('pending',):
            return Response(
                {'error': 'You can only edit complaints that are still in "Pending" status.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().update(request, *args, **kwargs)


class TrackComplaintView(APIView):
    """
    GET /api/complaints/track/?id=<tracking_id>
    Public tracking endpoint — no login required.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        tracking_id = request.query_params.get('id', '').strip().upper()
        if not tracking_id:
            return Response({'error': 'Please provide a tracking ID.'}, status=400)
        try:
            complaint = Complaint.objects.select_related(
                'citizen', 'department'
            ).prefetch_related('updates__updated_by').get(tracking_id=tracking_id)
        except Complaint.DoesNotExist:
            return Response({'error': 'No complaint found with this tracking ID.'}, status=404)

        serializer = ComplaintDetailSerializer(complaint)
        return Response(serializer.data)


# ──────────────────────────────────────────────
# Admin Complaint Views
# ──────────────────────────────────────────────

class AdminComplaintListView(generics.ListAPIView):
    """
    GET /api/admin/complaints/
    Admins can see all complaints with advanced filtering.
    """
    serializer_class = ComplaintListSerializer
    permission_classes = [IsAdminOrStaff]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tracking_id', 'citizen__username',
                     'citizen__email', 'location', 'city']
    ordering_fields = ['created_at', 'status', 'urgency', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Complaint.objects.select_related('citizen', 'department').all()

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        urgency_param = self.request.query_params.get('urgency')
        if urgency_param:
            qs = qs.filter(urgency=urgency_param)

        category_param = self.request.query_params.get('category')
        if category_param:
            qs = qs.filter(category=category_param)

        department_param = self.request.query_params.get('department')
        if department_param:
            qs = qs.filter(department__id=department_param)

        ai_only = self.request.query_params.get('ai_analyzed')
        if ai_only == 'true':
            qs = qs.filter(ai_analyzed_at__isnull=False)

        duplicates = self.request.query_params.get('duplicates')
        if duplicates == 'true':
            qs = qs.filter(ai_duplicate_flag=True)

        # Date range filter
        date_from = self.request.query_params.get('from')
        date_to = self.request.query_params.get('to')
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        return qs


class AdminComplaintDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/admin/complaints/<pk>/   — Full complaint detail
    PATCH /api/admin/complaints/<pk>/   — Update status / assign department
    """
    permission_classes = [IsAdminOrStaff]
    queryset = Complaint.objects.select_related(
        'citizen', 'department'
    ).prefetch_related('updates__updated_by', 'ai_logs')

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ComplaintStatusUpdateSerializer
        return ComplaintDetailSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class AdminBulkActionView(APIView):
    """
    POST /api/admin/complaints/bulk-action/
    Perform bulk status updates on multiple complaints.
    Body: { "ids": [1,2,3], "action": "in_progress", "note": "..." }
    """
    permission_classes = [IsAdminOrStaff]

    def post(self, request):
        ids = request.data.get('ids', [])
        action = request.data.get('action', '')
        note = request.data.get('note', '')

        valid_actions = [c[0] for c in Complaint.STATUS_CHOICES]
        if action not in valid_actions:
            return Response({'error': f'Invalid action. Choose from: {valid_actions}'}, status=400)

        if not ids:
            return Response({'error': 'No complaint IDs provided.'}, status=400)

        complaints = Complaint.objects.filter(id__in=ids)
        updated = 0
        for complaint in complaints:
            old_status = complaint.status
            complaint.status = action
            complaint.save()
            ComplaintUpdate.objects.create(
                complaint=complaint,
                updated_by=request.user,
                old_status=old_status,
                new_status=action,
                note=note,
            )
            updated += 1

        return Response({'message': f'{updated} complaint(s) updated to "{action}".'})


# ──────────────────────────────────────────────
# Public Feed Views
# ──────────────────────────────────────────────

class PublicComplaintListView(generics.ListAPIView):
    """
    GET /api/public-complaints/
    List all complaints marked as public.
    """
    queryset = Complaint.objects.filter(is_public=True).order_by('-created_at')
    serializer_class = PublicComplaintSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'location', 'city']
    ordering_fields = ['created_at', 'urgency', 'status']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
            
        urgency = self.request.query_params.get('urgency')
        if urgency:
            queryset = queryset.filter(urgency=urgency)
            
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset


class PublicComplaintDetailView(generics.RetrieveAPIView):
    """
    GET /api/public-complaints/<pk>/
    Authenticated detail view for any public complaint.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ComplaintDetailSerializer
    queryset = Complaint.objects.filter(is_public=True).select_related(
        'citizen', 'department'
    ).prefetch_related('updates__updated_by')

    def get_object(self):
        try:
            return super().get_object()
        except Exception:
            from rest_framework.exceptions import NotFound
            raise NotFound({"error": "Complaint not found or not public"})


class ComplaintEngageView(APIView):
    """
    POST /api/complaints/{id}/engage/
    Body: { "type": "risk" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found'}, status=404)

        engagement_type = request.data.get('type')
        valid_types = [t[0] for t in ComplaintEngagement.ENGAGEMENT_TYPES]
        
        if engagement_type not in valid_types:
            return Response({'error': f'Invalid type. Choose from: {valid_types}'}, status=400)

        # Check if already engaged
        engagement = ComplaintEngagement.objects.filter(
            complaint=complaint,
            user=request.user,
            engagement_type=engagement_type
        ).first()

        if engagement:
            # Toggle off if same one clicked? prompt doesn't specify but good for UX
            engagement.delete()
            action = 'removed'
        else:
            ComplaintEngagement.objects.create(
                complaint=complaint,
                user=request.user,
                engagement_type=engagement_type
            )
            action = 'added'

        # Return updated counts
        from django.db.models import Count
        counts = complaint.engagements.values('engagement_type').annotate(count=Count('id'))
        summary = {item['engagement_type']: item['count'] for item in counts}
        for t, _ in ComplaintEngagement.ENGAGEMENT_TYPES:
            if t not in summary:
                summary[t] = 0

        return Response({
            'message': f'Engagement {action} successfully',
            'action': action,
            'engagement_summary': summary,
            'user_engagements': list(complaint.engagements.filter(user=request.user).values_list('engagement_type', flat=True))
        })


# ──────────────────────────────────────────────
# Analytics Dashboard View
# ──────────────────────────────────────────────

class AnalyticsDashboardView(APIView):
    """
    GET /api/admin/analytics/
    Returns aggregated stats for the admin dashboard.
    """
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        qs = Complaint.objects.all()

        # Status counts
        status_counts = dict(qs.values_list('status').annotate(count=Count('id')))

        # Category distribution
        by_category = dict(qs.values_list('category').annotate(count=Count('id')))

        # Department distribution
        by_department = list(
            qs.filter(department__isnull=False)
            .values('department__name')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        # Resolution time avg (in days)
        resolved_qs = qs.filter(status='resolved', resolved_at__isnull=False)
        avg_days = None
        if resolved_qs.exists():
            total_days = sum(
                (c.resolved_at - c.created_at).days
                for c in resolved_qs
            )
            avg_days = round(total_days / resolved_qs.count(), 1)

        # Recent 5 complaints
        recent = qs.select_related('citizen', 'department').order_by('-created_at')[:5]

        # Top high risk complaints (engagement driven)
        top_high_risk = qs.annotate(
            engagement_count=Count('engagements')
        ).filter(risk_score__gt=70).order_by('-risk_score', '-engagement_count')[:6]

        data = {
            'total_complaints': qs.count(),
            'total_public_count': qs.filter(is_public=True).count(),
            'pending': status_counts.get('pending', 0),
            'in_review': status_counts.get('in_review', 0),
            'in_progress': status_counts.get('in_progress', 0),
            'resolved': status_counts.get('resolved', 0),
            'rejected': status_counts.get('rejected', 0),
            'closed': status_counts.get('closed', 0),
            'critical_urgency': qs.filter(urgency='critical').count(),
            'high_urgency': qs.filter(urgency='high').count(),
            'ai_analyzed': qs.filter(ai_analyzed_at__isnull=False).count(),
            'duplicate_flags': qs.filter(ai_duplicate_flag=True).count(),
            'avg_resolution_days': avg_days or 0.0,
            'by_category': by_category,
            'by_department': by_department,
            'recent_complaints': ComplaintListSerializer(recent, many=True).data,
            'top_high_risk_complaints': ComplaintListSerializer(top_high_risk, many=True).data,
        }
        return Response(data)


class CitizenDashboardView(APIView):
    """
    GET /api/dashboard/
    Citizen's personal dashboard summary.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Complaint.objects.filter(citizen=request.user)
        status_counts = dict(qs.values_list('status').annotate(count=Count('id')))
        recent = qs.select_related('department').order_by('-created_at')[:5]

        data = {
            'total_complaints': qs.count(),
            'pending': status_counts.get('pending', 0),
            'in_review': status_counts.get('in_review', 0),
            'in_progress': status_counts.get('in_progress', 0),
            'resolved': status_counts.get('resolved', 0),
            'rejected': status_counts.get('rejected', 0),
            'recent_complaints': ComplaintListSerializer(recent, many=True).data,
        }
        return Response(data)


# ──────────────────────────────────────────────
# AI Integration View
# ──────────────────────────────────────────────

class TriggerAIAnalysisView(APIView):
    """
    POST /api/admin/complaints/<pk>/analyze/
    Manually trigger AI analysis for a specific complaint.
    """
    permission_classes = [IsAdminOrStaff]

    def post(self, request, pk):
        try:
            complaint = Complaint.objects.get(pk=pk)
        except Complaint.DoesNotExist:
            return Response({'error': 'Complaint not found.'}, status=404)

        result = _trigger_ai_analysis(complaint)
        if result.get('success'):
            return Response({'message': 'AI analysis triggered.', 'result': result})
        return Response({'message': 'AI microservice unavailable. Will retry later.', 'detail': result}, status=503)


# ──────────────────────────────────────────────
# User Management (Admin)
# ──────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    """
    GET /api/admin/users/
    List all registered users.
    """
    permission_classes = [IsAdminOrStaff]
    serializer_class = UserDetailSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']

    def get_queryset(self):
        return User.objects.select_related('profile').prefetch_related('complaints').all()


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/admin/users/<pk>/  — Retrieve user
    PATCH /api/admin/users/<pk>/  — Update role / activate / deactivate
    """
    permission_classes = [IsAdminOrStaff]
    serializer_class = UserDetailSerializer
    queryset = User.objects.select_related('profile').all()


# ──────────────────────────────────────────────
# Helper: AI Microservice Integration
# ──────────────────────────────────────────────

FASTAPI_BASE_URL = 'http://127.0.0.1:8001'


def _trigger_ai_analysis(complaint: Complaint) -> dict:
    """
    Send complaint text to the FastAPI AI microservice for analysis.
    Saves results back to the Complaint model on success.
    Returns a dict with success/failure info.
    """
    payload = {
        'complaint_id': complaint.id,
        'tracking_id': complaint.tracking_id,
        'title': complaint.title,
        'description': complaint.description,
        'city': complaint.city,
        'state': complaint.state,
    }

    log = AIAnalysisLog.objects.create(
        complaint=complaint,
        request_payload=payload,
        status='pending',
    )

    try:
        import time
        start = time.time()
        response = http_requests.post(
            f'{FASTAPI_BASE_URL}/analyze',
            json=payload,
            timeout=10,
        )
        elapsed = int((time.time() - start) * 1000)

        if response.status_code == 200:
            data = response.json()

            # Persist AI results to the Complaint
            complaint.ai_predicted_category = data.get('predicted_category')
            complaint.ai_predicted_urgency = data.get('predicted_urgency')
            complaint.ai_confidence_score = data.get('confidence_score')
            complaint.ai_summary = data.get('summary')
            complaint.ai_duplicate_flag = data.get('is_duplicate', False)
            complaint.ai_analyzed_at = timezone.now()
            complaint.save(update_fields=[
                'ai_predicted_category', 'ai_predicted_urgency', 'ai_confidence_score',
                'ai_summary', 'ai_duplicate_flag', 'ai_analyzed_at',
            ])

            log.response_payload = data
            log.status = 'success'
            log.processing_time_ms = elapsed
            log.save()

            return {'success': True, 'data': data}

        else:
            log.status = 'error'
            log.error_message = f'HTTP {response.status_code}: {response.text[:500]}'
            log.processing_time_ms = elapsed
            log.save()
            return {'success': False, 'error': log.error_message}

    except http_requests.exceptions.ConnectionError:
        log.status = 'error'
        log.error_message = 'FastAPI microservice is not reachable.'
        log.save()
        logger.warning(f'AI analysis failed for complaint {complaint.tracking_id}: microservice unreachable')
        return {'success': False, 'error': 'Microservice not reachable (will retry later).'}

    except Exception as exc:
        log.status = 'error'
        log.error_message = str(exc)
        log.save()
        logger.exception(f'Unexpected error during AI analysis for {complaint.tracking_id}')
        return {'success': False, 'error': str(exc)}
