from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import (
    Department, UserProfile, Complaint, ComplaintUpdate, 
    AIAnalysisLog, ComplaintEngagement, Notification, SystemSettings
)


# ──────────────────────────────────────────────
# Auth Serializers
# ──────────────────────────────────────────────

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for citizen registration."""
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, style={'input_type': 'password'}, label='Confirm Password')
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    pincode = serializers.CharField(max_length=10, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'password', 'password2', 'phone', 'address', 'city', 'state', 'pincode']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        if User.objects.filter(email=data.get('email', '')).exists():
            raise serializers.ValidationError({'email': 'This email is already registered.'})
        return data

    def create(self, validated_data):
        profile_data = {
            'phone': validated_data.pop('phone', ''),
            'address': validated_data.pop('address', ''),
            'city': validated_data.pop('city', ''),
            'state': validated_data.pop('state', ''),
            'pincode': validated_data.pop('pincode', ''),
        }
        validated_data.pop('password2')
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        UserProfile.objects.create(user=user, role='citizen', **profile_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid username or password.')
        if not user.is_active:
            raise serializers.ValidationError('This account is inactive.')
        data['user'] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'phone', 'address', 'city', 'state', 'pincode', 'avatar', 'created_at']
        read_only_fields = ['role', 'created_at']


class UserDetailSerializer(serializers.ModelSerializer):
    """Full user detail including profile."""
    profile = UserProfileSerializer(read_only=True)
    complaint_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff',
                  'date_joined', 'profile', 'complaint_count']
        read_only_fields = ['id', 'username', 'is_staff', 'date_joined']

    def get_complaint_count(self, obj):
        return obj.complaints.count()


class UserMiniSerializer(serializers.ModelSerializer):
    """Minimal user info for nesting inside other serializers."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


# ──────────────────────────────────────────────
# Department Serializers
# ──────────────────────────────────────────────

class DepartmentSerializer(serializers.ModelSerializer):
    complaint_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'is_active', 'complaint_count', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_complaint_count(self, obj):
        return obj.complaints.count()


# ──────────────────────────────────────────────
# Complaint Serializers
# ──────────────────────────────────────────────

class ComplaintUpdateSerializer(serializers.ModelSerializer):
    updated_by = UserMiniSerializer(read_only=True)

    class Meta:
        model = ComplaintUpdate
        fields = ['id', 'old_status', 'new_status', 'note', 'updated_by', 'created_at']
        read_only_fields = ['id', 'updated_by', 'created_at']


class ComplaintEngagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintEngagement
        fields = ['engagement_type']

class ComplaintListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing complaints."""
    citizen = UserMiniSerializer(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    effective_category = serializers.ReadOnlyField()
    effective_urgency = serializers.ReadOnlyField()
    days_open = serializers.ReadOnlyField()

    engagement_count = serializers.IntegerField(default=0, read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'tracking_id', 'title', 'citizen', 'department_name',
            'category', 'category_display', 'urgency', 'urgency_display',
            'status', 'status_display', 'location', 'city', 'state',
            'effective_category', 'effective_urgency',
            'ai_predicted_category', 'ai_predicted_urgency', 'ai_confidence_score',
            'ai_duplicate_flag', 'risk_score', 'is_escalated', 'days_open', 
            'latitude', 'longitude', 'created_at', 'updated_at',
            'engagement_count',
        ]


class PublicComplaintSerializer(serializers.ModelSerializer):
    """Serializer for the public complaint feed."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    effective_category = serializers.ReadOnlyField()
    effective_urgency = serializers.ReadOnlyField()

    engagement_summary = serializers.SerializerMethodField()
    user_engagements = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = [
            'id', 'tracking_id', 'title', 'description', 'attachment',
            'category', 'category_display', 'urgency', 'urgency_display',
            'status', 'status_display', 'location', 'city', 'state',
            'effective_category', 'effective_urgency', 'created_at',
            'engagement_summary', 'user_engagements',
        ]

    def get_engagement_summary(self, obj):
        from django.db.models import Count
        counts = obj.engagements.values('engagement_type').annotate(count=Count('id'))
        summary = {item['engagement_type']: item['count'] for item in counts}
        # Ensure all types are present
        for t, _ in ComplaintEngagement.ENGAGEMENT_TYPES:
            if t not in summary:
                summary[t] = 0
        return summary

    def get_user_engagements(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return list(obj.engagements.filter(user=request.user).values_list('engagement_type', flat=True))
        return []


class ComplaintDetailSerializer(serializers.ModelSerializer):
    """Full complaint detail including timeline."""
    citizen = UserMiniSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source='department',
        write_only=True, required=False, allow_null=True
    )
    updates = ComplaintUpdateSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    effective_category = serializers.ReadOnlyField()
    effective_urgency = serializers.ReadOnlyField()
    days_open = serializers.ReadOnlyField()

    class Meta:
        model = Complaint
        fields = [
            'id', 'tracking_id', 'title', 'description',
            'citizen', 'department', 'department_id',
            'category', 'category_display', 'urgency', 'urgency_display',
            'status', 'status_display',
            'location', 'city', 'state', 'pincode',
            'ai_predicted_category', 'ai_predicted_urgency', 'ai_confidence_score',
            'ai_summary', 'ai_duplicate_flag', 'ai_analyzed_at',
            'risk_score', 'is_escalated', 'escalated_at',
            'latitude', 'longitude',
            'effective_category', 'effective_urgency',
            'attachment', 'is_anonymous', 'admin_notes', 'resolution_notes',
            'days_open', 'resolved_at', 'created_at', 'updated_at',
            'updates',
        ]
        read_only_fields = [
            'id', 'tracking_id', 'citizen',
            'ai_predicted_category', 'ai_predicted_urgency', 'ai_confidence_score',
            'ai_summary', 'ai_duplicate_flag', 'ai_analyzed_at',
            'resolved_at', 'created_at', 'updated_at',
        ]


class ComplaintCreateSerializer(serializers.ModelSerializer):
    """Serializer for citizens creating new complaints."""
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.filter(is_active=True),
        source='department', required=False, allow_null=True
    )
    is_anonymous = serializers.BooleanField(required=False, default=False)

    class Meta:
        model = Complaint
        fields = [
            'title', 'description', 'category', 'urgency',
            'location', 'city', 'state', 'pincode',
            'latitude', 'longitude',
            'department_id', 'attachment', 'is_anonymous',
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['citizen'] = request.user
        return super().create(validated_data)


class ComplaintStatusUpdateSerializer(serializers.ModelSerializer):
    """Admin serializer to update complaint status and assign department."""
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source='department',
        required=False, allow_null=True
    )
    note = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Complaint
        fields = [
            'status', 'department_id', 'admin_notes',
            'resolution_notes', 'note',
        ]

    def update(self, instance, validated_data):
        note = validated_data.pop('note', '')
        old_status = instance.status
        instance = super().update(instance, validated_data)

        # Create a timeline entry
        if old_status != instance.status or note:
            request = self.context.get('request')
            ComplaintUpdate.objects.create(
                complaint=instance,
                updated_by=request.user if request else None,
                old_status=old_status,
                new_status=instance.status,
                note=note,
            )
        return instance


# ──────────────────────────────────────────────
# Analytics Serializers
# ──────────────────────────────────────────────

class AnalyticsSummarySerializer(serializers.Serializer):
    """Summary statistics for the admin dashboard."""
    total_complaints = serializers.IntegerField()
    pending = serializers.IntegerField()
    in_review = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    resolved = serializers.IntegerField()
    rejected = serializers.IntegerField()
    closed = serializers.IntegerField()
    critical_urgency = serializers.IntegerField()
    high_urgency = serializers.IntegerField()
    ai_analyzed = serializers.IntegerField()
    duplicate_flags = serializers.IntegerField()
    avg_resolution_days = serializers.FloatField()
    by_category = serializers.DictField()
    by_department = serializers.ListField()
    recent_complaints = ComplaintListSerializer(many=True)
class NotificationSerializer(serializers.ModelSerializer):
    related_complaint_id = serializers.PrimaryKeyRelatedField(
        source='related_complaint', read_only=True
    )
    
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'type', 'related_complaint_id', 'created_at']
        read_only_fields = ['id', 'created_at']


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ['emergency_mode', 'emergency_message', 'last_updated']


class HeatmapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['id', 'latitude', 'longitude', 'risk_score', 'status']
