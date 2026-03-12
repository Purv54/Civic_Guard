from django.utils import timezone
from .notification_service import notify_admin_escalation

def check_and_escalate(complaint):
    """
    Escalation rules:
    - risk_score > 80
    - risk_confirmed_count > 20
    - older than 7 days AND status != Resolved
    """
    if complaint.is_escalated:
        return False

    risk_confirmed_count = complaint.engagements.filter(engagement_type='risk').count()
    
    should_escalate = False
    
    if complaint.risk_score > 80:
        should_escalate = True
    elif risk_confirmed_count > 20:
        should_escalate = True
    elif complaint.days_open > 7 and complaint.status != 'resolved':
        should_escalate = True
        
    if should_escalate:
        complaint.is_escalated = True
        complaint.escalated_at = timezone.now()
        complaint.status = 'critical' if 'critical' in dict(complaint.STATUS_CHOICES) else 'in_progress'
        # Check if 'critical' is in STATUS_CHOICES. 
        # Current choices: pending, in_review, in_progress, resolved, rejected, closed.
        # Let's use 'in_progress' or add 'critical' to choices.
        # User said: Set status = "Critical". I should add 'critical' to status choices.
        complaint.save()
        
        # Notify
        notify_admin_escalation(complaint)
        return True
        
    return False
