"""
Django Signals for Civic Guard – complaints app
================================================
All side-effects triggered by model save events are centralised here.

Signal handlers follow strict rules:
  - Never break the main request flow (all email calls are wrapped in try/except
    already inside email_service).
  - Email is sent only on meaningful events:
      • Complaint CREATED → send confirmation email
      • Complaint status changed TO "resolved" → send resolution email
  - The "resolved" email fires via ComplaintUpdate, NOT via Complaint.post_save,
    to guarantee it only fires when the status genuinely transitions to resolved
    (not on every model save).
"""

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Complaint, ComplaintEngagement, ComplaintUpdate
from .services.risk_service import update_complaint_risk
from .services.escalation_service import check_and_escalate
from .services.notification_service import create_notification

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Engagement handler
# ──────────────────────────────────────────────

@receiver(post_save, sender=ComplaintEngagement)
def handle_engagement(sender, instance, created, **kwargs):
    """Re-calculate risk and check escalation whenever a citizen engages."""
    if created:
        complaint = instance.complaint
        update_complaint_risk(complaint)
        check_and_escalate(complaint)


# ──────────────────────────────────────────────
# Status-update handler  (admin changes status)
# ──────────────────────────────────────────────

@receiver(post_save, sender=ComplaintUpdate)
def handle_status_change(sender, instance, created, **kwargs):
    """
    Fired when an admin creates a ComplaintUpdate record.
    Handles:
      1. Risk score + escalation recalculation
      2. In-app notification to the citizen
      3. Email notification to the citizen IF status changed to "resolved"
    """
    if not created:
        return

    complaint = instance.complaint
    new_status = instance.new_status
    old_status = instance.old_status

    # 1. Risk + escalation
    update_complaint_risk(complaint)
    check_and_escalate(complaint)

    # 2. In-app notification
    create_notification(
        user=complaint.citizen,
        title=f"Complaint Status Updated: {complaint.get_status_display()} 📌",
        message=(
            f"Your complaint '{complaint.title}' has been updated "
            f"from {old_status} to {complaint.get_status_display()}."
        ),
        notification_type='status_update',
        complaint=complaint,
    )

    # 3. Resolution email — only when status transitions TO "resolved"
    if new_status == 'resolved' and old_status != 'resolved':
        try:
            from .services.email_service import send_complaint_resolved_email
            send_complaint_resolved_email(user=complaint.citizen, complaint=complaint)
        except Exception as exc:
            # Email failure must NEVER affect the main flow
            logger.error(
                "[Signal] Unexpected error sending resolution email for %s: %s",
                complaint.tracking_id,
                exc,
            )


# ──────────────────────────────────────────────
# Complaint creation handler
# ──────────────────────────────────────────────

@receiver(post_save, sender=Complaint)
def handle_complaint_creation(sender, instance, created, **kwargs):
    """
    Fired when a brand-new complaint is saved for the first time.
    Handles:
      1. Initial risk calculation
      2. Early escalation for critical-urgency complaints
      3. Confirmation email to the citizen
    """
    if not created:
        return

    # 1. Risk score
    update_complaint_risk(instance)

    # 2. Auto-escalate critical urgency
    if instance.urgency == 'critical':
        check_and_escalate(instance)

    # 3. Confirmation email — sent after DB commit, so tracking_id is guaranteed
    try:
        from .services.email_service import send_complaint_created_email
        send_complaint_created_email(user=instance.citizen, complaint=instance)
    except Exception as exc:
        logger.error(
            "[Signal] Unexpected error sending creation email for %s: %s",
            instance.tracking_id,
            exc,
        )
