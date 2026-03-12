from django.utils import timezone
from ..models import Notification

def create_notification(user, title, message, notification_type, complaint=None):
    """
    Centralized utility to create notifications.
    """
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        type=notification_type,
        related_complaint=complaint
    )

def notify_admin_escalation(complaint):
    """
    Notify all admins about an escalation.
    """
    from django.contrib.auth.models import User
    admins = User.objects.filter(is_staff=True)
    for admin in admins:
        create_notification(
            user=admin,
            title="Complaint Escalated! 🚨",
            message=f"Complaint #{complaint.tracking_id} has been automatically escalated due to high risk.",
            notification_type='escalation',
            complaint=complaint
        )
