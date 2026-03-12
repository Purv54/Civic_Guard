from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Department(models.Model):
    """Government departments that handle complaints."""
    name = models.CharField(max_length=150, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'

    def __str__(self):
        return f"{self.name} ({self.code})"


class UserProfile(models.Model):
    """Extended profile for each registered user (citizen)."""
    ROLE_CHOICES = [
        ('citizen', 'Citizen'),
        ('admin', 'Administrator'),
        ('staff', 'Staff'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='citizen')
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username} ({self.role})"

    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username


class Complaint(models.Model):
    """Core complaint model submitted by citizens."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_review', 'In Review'),
        ('in_progress', 'In Progress'),
        ('critical', 'Critical'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
        ('closed', 'Closed'),
    ]

    URGENCY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    CATEGORY_CHOICES = [
        ('infrastructure', 'Infrastructure'),
        ('water_supply', 'Water Supply'),
        ('electricity', 'Electricity'),
        ('sanitation', 'Sanitation'),
        ('roads', 'Roads & Transport'),
        ('public_safety', 'Public Safety'),
        ('environment', 'Environment'),
        ('healthcare', 'Healthcare'),
        ('education', 'Education'),
        ('housing', 'Housing'),
        ('corruption', 'Corruption'),
        ('other', 'Other'),
    ]

    # Relationships
    citizen = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')
    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints'
    )

    # Complaint details
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)

    # Classification (can be set manually or via AI)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='other')
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # AI-generated fields (populated by FastAPI microservice)
    ai_predicted_category = models.CharField(max_length=30, blank=True, null=True)
    ai_predicted_urgency = models.CharField(max_length=10, blank=True, null=True)
    ai_confidence_score = models.FloatField(null=True, blank=True)
    ai_summary = models.TextField(blank=True, null=True)
    ai_duplicate_flag = models.BooleanField(default=False)
    ai_duplicate_of = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='duplicates'
    )
    ai_analyzed_at = models.DateTimeField(null=True, blank=True)

    # Risk and Escalation
    risk_score = models.IntegerField(default=0)
    is_escalated = models.BooleanField(default=False)
    escalated_at = models.DateTimeField(null=True, blank=True)

    # Geo Location
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # Attachments
    attachment = models.FileField(upload_to='complaint_attachments/', blank=True, null=True)

    # Tracking
    tracking_id = models.CharField(max_length=20, unique=True, editable=False)
    is_anonymous = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    admin_notes = models.TextField(blank=True)
    resolution_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    # Admin Review Fields
    is_verified = models.BooleanField(default=False)
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_complaints'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Complaint'
        verbose_name_plural = 'Complaints'

    def __str__(self):
        return f"[{self.tracking_id}] {self.title} — {self.get_status_display()}"

    def save(self, *args, **kwargs):
        if not self.tracking_id:
            self.tracking_id = self._generate_tracking_id()
        if self.status == 'resolved' and not self.resolved_at:
            self.resolved_at = timezone.now()
        super().save(*args, **kwargs)

    def _generate_tracking_id(self):
        import random
        import string
        prefix = 'CG'
        year = timezone.now().year
        suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"{prefix}{year}{suffix}"

    @property
    def days_open(self):
        if not self.created_at:
            return 0
        end = self.resolved_at or timezone.now()
        return (end - self.created_at).days

    @property
    def effective_category(self):
        """Return AI category if available, else manual category."""
        return self.ai_predicted_category or self.category

    @property
    def effective_urgency(self):
        """Return AI urgency if available, else manual urgency."""
        return self.ai_predicted_urgency or self.urgency


class ComplaintUpdate(models.Model):
    """Timeline of status updates for a complaint."""
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='updates')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Complaint Update'
        verbose_name_plural = 'Complaint Updates'

    def __str__(self):
        return f"{self.complaint.tracking_id}: {self.old_status} → {self.new_status}"


class AIAnalysisLog(models.Model):
    """Audit log of all AI analysis requests and responses."""
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='ai_logs')
    request_payload = models.JSONField()
    response_payload = models.JSONField(null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=[('success', 'Success'), ('error', 'Error'), ('pending', 'Pending')],
        default='pending'
    )
    error_message = models.TextField(blank=True)
    processing_time_ms = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Analysis Log'
        verbose_name_plural = 'AI Analysis Logs'

    def __str__(self):
        return f"AI Log for {self.complaint.tracking_id} — {self.status}"


class ComplaintEngagement(models.Model):
    """User interactions (reactions) on public complaints."""
    ENGAGEMENT_TYPES = [
        ('risk', 'Risk Confirmed'),
        ('active', 'Still Active'),
        ('resolved_locally', 'Resolved Locally'),
        ('observed', 'Observed This'),
    ]

    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='engagements')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaint_engagements')
    engagement_type = models.CharField(max_length=20, choices=ENGAGEMENT_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # One user can only react once per engagement type per complaint
        unique_together = ('complaint', 'user', 'engagement_type')
        verbose_name = 'Complaint Engagement'
        verbose_name_plural = 'Complaint Engagements'

    def __str__(self):
        return f"{self.user.username} - {self.engagement_type} on {self.complaint.tracking_id}"


class Notification(models.Model):
    """Smart notification engine."""
    TYPE_CHOICES = [
        ('escalation', 'Escalation'),
        ('status_update', 'Status Update'),
        ('trend_alert', 'Trend Alert'),
        ('risk_alert', 'Risk Alert'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    related_complaint = models.ForeignKey(Complaint, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class SystemSettings(models.Model):
    """Global system configuration for crisis and emergency management."""
    emergency_mode = models.BooleanField(default=False)
    emergency_message = models.TextField(blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'System Settings'
        verbose_name_plural = 'System Settings'

    def __str__(self):
        return f"System State: {'EMERGENCY' if self.emergency_mode else 'NORMAL'}"
