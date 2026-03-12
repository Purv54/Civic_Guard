"""
Email Service for Civic Guard
==============================
Centralised email notification logic.
All SMTP credentials are read from environment variables — never hardcoded.

Functions
---------
send_complaint_created_email(user, complaint)
    Sends a confirmation email when a complaint is submitted.

send_complaint_resolved_email(user, complaint)
    Sends a resolution email when a complaint is marked Resolved.
"""

import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Internal helper
# ──────────────────────────────────────────────

def _send_email(subject: str, template_name: str, context: dict, recipient_email: str) -> bool:
    """
    Internal helper that renders an HTML template, builds a multipart email
    (plain-text fallback + HTML), and sends it.

    Returns True on success, False on failure (does NOT raise — callers must
    never break because of a failed email).
    """
    if not recipient_email:
        logger.warning(
            "[EmailService] Skipped sending '%s' — recipient has no email address.",
            subject,
        )
        return False

    try:
        # Render HTML body
        html_body = render_to_string(template_name, context)

        # Plain-text fallback (strips HTML for clients that don't support it)
        complaint = context.get("complaint")
        user = context.get("user")
        user_name = context.get("user_name", "Citizen")

        plain_text = (
            f"Hello {user_name},\n\n"
            f"Complaint ID : {complaint.tracking_id}\n"
            f"Title        : {complaint.title}\n"
            f"Status       : {complaint.get_status_display()}\n\n"
            f"Thank you for using Civic Guard.\n\n"
            f"Regards,\nCivic Guard Support Team"
        )

        from_email = settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_text,
            from_email=from_email,
            to=[recipient_email],
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=False)

        logger.info(
            "[EmailService] Email '%s' sent successfully to %s", subject, recipient_email
        )
        return True

    except Exception as exc:
        logger.error(
            "[EmailService] Failed to send email '%s' to %s — %s: %s",
            subject,
            recipient_email,
            type(exc).__name__,
            exc,
        )
        return False


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

def send_complaint_created_email(user, complaint) -> bool:
    """
    Send a confirmation email to the citizen just after they submit a complaint.

    Parameters
    ----------
    user      : django.contrib.auth.models.User
    complaint : complaints.models.Complaint

    Returns
    -------
    bool — True if the email was dispatched, False otherwise.
    """
    user_name = f"{user.first_name} {user.last_name}".strip() or user.username

    context = {
        "user": user,
        "user_name": user_name,
        "complaint": complaint,
        "platform_name": "Civic Guard",
    }

    return _send_email(
        subject="Civic Guard – Complaint Successfully Registered",
        template_name="emails/complaint_created.html",
        context=context,
        recipient_email=user.email,
    )


def send_complaint_resolved_email(user, complaint) -> bool:
    """
    Send a resolution email to the citizen when their complaint is marked Resolved.

    Parameters
    ----------
    user      : django.contrib.auth.models.User
    complaint : complaints.models.Complaint

    Returns
    -------
    bool — True if the email was dispatched, False otherwise.
    """
    user_name = f"{user.first_name} {user.last_name}".strip() or user.username

    context = {
        "user": user,
        "user_name": user_name,
        "complaint": complaint,
        "platform_name": "Civic Guard",
        "resolution_notes": complaint.resolution_notes or "Your issue has been addressed.",
    }

    return _send_email(
        subject="Civic Guard – Your Complaint Has Been Resolved",
        template_name="emails/complaint_resolved.html",
        context=context,
        recipient_email=user.email,
    )
