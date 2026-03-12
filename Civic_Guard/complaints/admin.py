from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.utils import timezone
from django.db.models import Count
from django.conf import settings

from .models import Department, UserProfile, Complaint, ComplaintUpdate, AIAnalysisLog, ComplaintEngagement

@admin.register(ComplaintEngagement)
class ComplaintEngagementAdmin(admin.ModelAdmin):
    list_display = ['complaint', 'user', 'engagement_type', 'created_at']
    list_filter = ['engagement_type', 'created_at']
    search_fields = ['complaint__tracking_id', 'user__username']
    readonly_fields = ['created_at']

# ── Apply Admin Site Branding ──────────────────
admin.site.site_header = getattr(settings, 'ADMIN_SITE_HEADER', '🛡️ CivicGuard Administration')
admin.site.site_title  = getattr(settings, 'ADMIN_SITE_TITLE',  'CivicGuard Admin')
admin.site.index_title = getattr(settings, 'ADMIN_INDEX_TITLE', 'Government Grievance Management System')


# ──────────────────────────────────────────────
# Inline Admin Classes
# ──────────────────────────────────────────────

class ComplaintUpdateInline(admin.TabularInline):
    model = ComplaintUpdate
    extra = 0
    readonly_fields = ['old_status', 'new_status', 'updated_by', 'note', 'created_at']
    fields = ['old_status', 'new_status', 'note', 'updated_by', 'created_at']
    can_delete = False
    ordering = ['-created_at']

    def has_add_permission(self, request, obj=None):
        return False


class AIAnalysisLogInline(admin.TabularInline):
    model = AIAnalysisLog
    extra = 0
    readonly_fields = ['status', 'processing_time_ms', 'error_message', 'created_at']
    fields = ['status', 'processing_time_ms', 'error_message', 'created_at']
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


# ──────────────────────────────────────────────
# Department Admin
# ──────────────────────────────────────────────

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display  = ['name', 'code', 'complaint_count_badge', 'is_active', 'created_at']
    list_filter   = ['is_active']
    search_fields = ['name', 'code']
    ordering      = ['name']
    list_editable = ['is_active']

    fieldsets = [
        (None, {
            'fields': ('name', 'code', 'description', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    ]
    readonly_fields = ['created_at']

    def complaint_count_badge(self, obj):
        count = obj.complaints.count()
        color = '#28a745' if count < 10 else ('#ffc107' if count < 30 else '#dc3545')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:12px;">{}</span>',
            color, count,
        )
    complaint_count_badge.short_description = 'Complaints'


# ──────────────────────────────────────────────
# UserProfile Admin
# ──────────────────────────────────────────────

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display  = ['user', 'role_badge', 'phone', 'city', 'state', 'created_at']
    list_filter   = ['role', 'state']
    search_fields = ['user__username', 'user__email', 'phone', 'city']
    ordering      = ['-created_at']
    raw_id_fields = ['user']

    readonly_fields = ['created_at', 'updated_at']

    def role_badge(self, obj):
        colors = {'citizen': '#007bff', 'admin': '#6f42c1', 'staff': '#17a2b8'}
        color = colors.get(obj.role, '#6c757d')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:12px;">{}</span>',
            color, obj.get_role_display(),
        )
    role_badge.short_description = 'Role'


# ──────────────────────────────────────────────
# Complaint Admin
# ──────────────────────────────────────────────

class UrgencyListFilter(admin.SimpleListFilter):
    title = 'Urgency'
    parameter_name = 'urgency'

    def lookups(self, request, model_admin):
        return Complaint.URGENCY_CHOICES

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(urgency=self.value())
        return queryset


class AIAnalyzedFilter(admin.SimpleListFilter):
    title = 'AI Analysis'
    parameter_name = 'ai_analyzed'

    def lookups(self, request, model_admin):
        return [('yes', 'AI Analyzed'), ('no', 'Not Analyzed')]

    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.filter(ai_analyzed_at__isnull=False)
        if self.value() == 'no':
            return queryset.filter(ai_analyzed_at__isnull=True)
        return queryset


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = [
        'tracking_id_link', 'title_short', 'citizen_link',
        'status_badge', 'urgency_badge', 'category_display',
        'department_name', 'ai_status_icon',
        'days_open_display', 'created_at',
    ]
    list_filter   = ['status', UrgencyListFilter, 'category', 'department', AIAnalyzedFilter, 'ai_duplicate_flag', 'is_anonymous']
    search_fields = ['tracking_id', 'title', 'description', 'citizen__username', 'citizen__email', 'location', 'city']
    ordering      = ['-created_at']
    date_hierarchy = 'created_at'
    raw_id_fields = ['citizen', 'department', 'ai_duplicate_of']
    readonly_fields = [
        'tracking_id', 'citizen', 'created_at', 'updated_at', 'resolved_at',
        'ai_predicted_category', 'ai_predicted_urgency', 'ai_confidence_score',
        'ai_summary', 'ai_duplicate_flag', 'ai_analyzed_at', 'ai_duplicate_of',
        'days_open',
    ]

    inlines = [ComplaintUpdateInline, AIAnalysisLogInline]

    fieldsets = [
        ('📋 Complaint Details', {
            'fields': (
                'tracking_id', 'title', 'description',
                'citizen', 'is_anonymous', 'attachment',
            )
        }),
        ('📍 Location', {
            'fields': ('location', 'city', 'state', 'pincode'),
        }),
        ('🏷️ Classification', {
            'fields': ('category', 'urgency', 'status', 'department'),
        }),
        ('🤖 AI Analysis Results', {
            'fields': (
                'ai_predicted_category', 'ai_predicted_urgency', 'ai_confidence_score',
                'ai_summary', 'ai_duplicate_flag', 'ai_duplicate_of', 'ai_analyzed_at',
            ),
            'classes': ('collapse',),
        }),
        ('📝 Admin Notes', {
            'fields': ('admin_notes', 'resolution_notes'),
        }),
        ('🕒 Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at', 'days_open'),
            'classes': ('collapse',),
        }),
    ]

    actions = ['mark_in_review', 'mark_in_progress', 'mark_resolved', 'mark_rejected']

    # ── Custom Display Methods ──────────────────

    def tracking_id_link(self, obj):
        return format_html(
            '<a href="{}" style="font-family:monospace;font-weight:bold;">{}</a>',
            f'/admin/complaints/complaint/{obj.pk}/change/',
            obj.tracking_id,
        )
    tracking_id_link.short_description = 'Tracking ID'

    def title_short(self, obj):
        return obj.title[:45] + '…' if len(obj.title) > 45 else obj.title
    title_short.short_description = 'Title'

    def citizen_link(self, obj):
        return format_html(
            '<a href="/admin/auth/user/{}/change/">{}</a>',
            obj.citizen.pk,
            obj.citizen.get_full_name() or obj.citizen.username,
        )
    citizen_link.short_description = 'Citizen'

    def status_badge(self, obj):
        colors = {
            'pending':     '#6c757d',
            'in_review':   '#17a2b8',
            'in_progress': '#007bff',
            'resolved':    '#28a745',
            'rejected':    '#dc3545',
            'closed':      '#343a40',
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;">{}</span>',
            color, obj.get_status_display(),
        )
    status_badge.short_description = 'Status'

    def urgency_badge(self, obj):
        colors = {
            'low':      '#28a745',
            'medium':   '#ffc107',
            'high':     '#fd7e14',
            'critical': '#dc3545',
        }
        color = colors.get(obj.urgency, '#6c757d')
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;border-radius:12px;font-size:11px;">⚡ {}</span>',
            color, obj.get_urgency_display(),
        )
    urgency_badge.short_description = 'Urgency'

    def category_display(self, obj):
        return obj.get_category_display()
    category_display.short_description = 'Category'

    def department_name(self, obj):
        if obj.department:
            return obj.department.name
        return mark_safe('<span style="color:#dc3545;">Unassigned</span>')
    department_name.short_description = 'Department'

    def ai_status_icon(self, obj):
        if obj.ai_analyzed_at:
            confidence = obj.ai_confidence_score
            conf_str = f' ({int(confidence * 100)}%)' if confidence else ''
            if obj.ai_duplicate_flag:
                return format_html('<span title="Analyzed — Duplicate Detected">🤖🔁{}</span>', conf_str)
            return format_html('<span title="AI Analyzed{}">🤖✅{}</span>', conf_str, conf_str)
        return mark_safe('<span title="Not yet analyzed" style="color:#aaa;">⏳</span>')
    ai_status_icon.short_description = 'AI'

    def days_open_display(self, obj):
        days = obj.days_open
        if days == 0:
            return mark_safe('<span style="color:#28a745;">Today</span>')
        elif days <= 3:
            return format_html('<span style="color:#28a745;">{}d</span>', days)
        elif days <= 7:
            return format_html('<span style="color:#ffc107;">{}d</span>', days)
        else:
            return format_html('<span style="color:#dc3545;font-weight:bold;">{}d</span>', days)
    days_open_display.short_description = 'Days Open'

    # ── Bulk Actions ───────────────────────────

    def _bulk_status_change(self, request, queryset, new_status, label):
        updated = 0
        for complaint in queryset:
            old = complaint.status
            complaint.status = new_status
            complaint.save()
            ComplaintUpdate.objects.create(
                complaint=complaint,
                updated_by=request.user,
                old_status=old,
                new_status=new_status,
                note=f'Bulk action by {request.user.username} via admin panel.',
            )
            updated += 1
        self.message_user(request, f'{updated} complaint(s) marked as "{label}".')

    def mark_in_review(self, request, queryset):
        self._bulk_status_change(request, queryset, 'in_review', 'In Review')
    mark_in_review.short_description = '📋 Mark selected as In Review'

    def mark_in_progress(self, request, queryset):
        self._bulk_status_change(request, queryset, 'in_progress', 'In Progress')
    mark_in_progress.short_description = '🔧 Mark selected as In Progress'

    def mark_resolved(self, request, queryset):
        self._bulk_status_change(request, queryset, 'resolved', 'Resolved')
    mark_resolved.short_description = '✅ Mark selected as Resolved'

    def mark_rejected(self, request, queryset):
        self._bulk_status_change(request, queryset, 'rejected', 'Rejected')
    mark_rejected.short_description = '❌ Mark selected as Rejected'


# ──────────────────────────────────────────────
# ComplaintUpdate Admin
# ──────────────────────────────────────────────

@admin.register(ComplaintUpdate)
class ComplaintUpdateAdmin(admin.ModelAdmin):
    list_display  = ['complaint', 'old_status', 'arrow', 'new_status', 'updated_by', 'created_at']
    list_filter   = ['new_status', 'old_status']
    search_fields = ['complaint__tracking_id', 'updated_by__username', 'note']
    ordering      = ['-created_at']
    readonly_fields = ['created_at']

    def arrow(self, obj):
        return mark_safe('<span style="color:#007bff;font-size:16px;">→</span>')
    arrow.short_description = ''


# ──────────────────────────────────────────────
# AIAnalysisLog Admin
# ──────────────────────────────────────────────

@admin.register(AIAnalysisLog)
class AIAnalysisLogAdmin(admin.ModelAdmin):
    list_display  = ['complaint', 'status_badge', 'processing_time_ms', 'created_at']
    list_filter   = ['status']
    search_fields = ['complaint__tracking_id', 'error_message']
    ordering      = ['-created_at']
    readonly_fields = ['complaint', 'request_payload', 'response_payload',
                       'status', 'error_message', 'processing_time_ms', 'created_at']

    def status_badge(self, obj):
        colors = {'success': '#28a745', 'error': '#dc3545', 'pending': '#ffc107'}
        icon   = {'success': '✅', 'error': '❌', 'pending': '⏳'}
        color  = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:12px;">{} {}</span>',
            color, icon.get(obj.status, ''), obj.get_status_display(),
        )
    status_badge.short_description = 'Status'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
