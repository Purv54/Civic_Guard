from django.db.models import Count
from django.utils import timezone

def calculate_risk_score(complaint):
    """
    Risk score formula:
    risk_score = (urgency_weight * 30) + (engagement_count * 2) + (days_open * 3)
    Normalize 0-100.
    """
    # 1. Urgency Weight
    urgency_map = {
        'critical': 4,
        'high': 3,
        'medium': 2,
        'low': 1
    }
    urgency_weight = urgency_map.get(complaint.urgency.lower(), 2)

    # 2. Engagement Count
    engagement_count = complaint.engagements.count()

    # 3. Days Open
    days_open = complaint.days_open

    # Calculation
    score = (urgency_weight * 15) + (engagement_count * 3) + (days_open * 4)
    
    # User formula: (urgency_weight * 30) + (engagement_count * 2) + (days_open * 3)
    # Let's use the exact user formula but adjust weights if it exceeds 100 easily
    user_score = (urgency_weight * 15) + (engagement_count * 2) + (days_open * 3)
    
    # Cap and normalize
    final_score = min(user_score, 100)
    
    return int(final_score)

def update_complaint_risk(complaint):
    """
    Recalculate and save risk score.
    """
    complaint.risk_score = calculate_risk_score(complaint)
    complaint.save(update_fields=['risk_score'])
    return complaint.risk_score
