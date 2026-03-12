from rest_framework import serializers
from django.contrib.auth.models import User
from complaints.models import (
    Complaint, Department, ComplaintUpdate, 
    ComplaintEngagement, UserProfile
)
from django.db.models import Count, Avg

class AdminUserMiniSerializer(serializers.ModelSerializer):
    """Minimal user info for admin panel."""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

class AdminDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'code']

class AdminComplaintUpdateSerializer(serializers.ModelSerializer):
    updated_by = AdminUserMiniSerializer(read_only=True)

    class Meta:
        model = ComplaintUpdate
        fields = ['id', 'old_status', 'new_status', 'note', 'updated_by', 'created_at']

class AdminComplaintEngagementSummarySerializer(serializers.Serializer):
    risk_confirmed = serializers.IntegerField(default=0)
    still_active = serializers.IntegerField(default=0)
    resolved_locally = serializers.IntegerField(default=0)
    observed = serializers.IntegerField(default=0)
    total_engagements = serializers.IntegerField(default=0)

class AdminComplaintListSerializer(serializers.ModelSerializer):
    """Detailed listing for admin view."""
    citizen = AdminUserMiniSerializer(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True, default=None)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    engagement_count = serializers.IntegerField(read_only=True)
    risk_confirmations = serializers.IntegerField(read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'tracking_id', 'title', 'citizen', 'department_name',
            'category', 'category_display', 'urgency', 'urgency_display',
            'status', 'status_display', 'location', 'city', 'state',
            'is_public', 'is_verified', 'engagement_count', 'risk_confirmations',
            'created_at', 'updated_at'
        ]

class AdminComplaintDetailSerializer(serializers.ModelSerializer):
    """Full complaint detail for admin view."""
    citizen = AdminUserMiniSerializer(read_only=True)
    department = AdminDepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source='department',
        write_only=True, required=False, allow_null=True
    )
    updates = AdminComplaintUpdateSerializer(many=True, read_only=True)
    engagement_summary = serializers.SerializerMethodField()
    reviewed_by = AdminUserMiniSerializer(read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'tracking_id', 'title', 'description', 'location', 
            'city', 'state', 'pincode', 'citizen', 'department', 
            'department_id', 'category', 'urgency', 'status', 
            'is_public', 'is_verified', 'reviewed_by', 'reviewed_at',
            'attachment', 'admin_notes', 'resolution_notes',
            'created_at', 'updated_at', 'resolved_at', 'updates',
            'engagement_summary'
        ]
        read_only_fields = ['tracking_id', 'citizen', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at']

    def get_engagement_summary(self, obj):
        counts = obj.engagements.values('engagement_type').annotate(count=Count('id'))
        summary = {item['engagement_type']: item['count'] for item in counts}
        # Ensure all types are present
        results = {}
        for t, _ in ComplaintEngagement.ENGAGEMENT_TYPES:
            results[t] = summary.get(t, 0)
        results['total'] = obj.engagements.count()
        return results

class AdminComplaintUpdateStatusSerializer(serializers.ModelSerializer):
    """Serializer for updating status and moderation flags."""
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source='department',
        required=False, allow_null=True
    )
    note = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Complaint
        fields = [
            'status', 'urgency', 'category', 'department_id', 
            'is_public', 'is_verified', 'admin_notes', 'resolution_notes', 'note'
        ]

    def update(self, instance, validated_data):
        from django.utils import timezone
        request = self.context.get('request')
        note = validated_data.pop('note', '')
        old_status = instance.status
        
        # If toggling is_verified, track who and when
        if 'is_verified' in validated_data and validated_data['is_verified'] != instance.is_verified:
            if validated_data['is_verified']:
                instance.reviewed_by = request.user
                instance.reviewed_at = timezone.now()
            else:
                instance.reviewed_by = None
                instance.reviewed_at = None

        instance = super().update(instance, validated_data)

        # Create a timeline entry if status changed or note provided
        if old_status != instance.status or note:
            ComplaintUpdate.objects.create(
                complaint=instance,
                updated_by=request.user if request else None,
                old_status=old_status,
                new_status=instance.status,
                note=note,
            )
        return instance

class AdminDashboardSerializer(serializers.Serializer):
    total_complaints = serializers.IntegerField()
    high_urgency_count = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    resolved_count = serializers.IntegerField()
    total_public_count = serializers.IntegerField()
    top_high_risk_complaints = AdminComplaintListSerializer(many=True)
    status_distribution = serializers.DictField()
    category_distribution = serializers.DictField()
