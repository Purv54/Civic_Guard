from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from ..models import Complaint

def get_category_trends():
    """
    Compare last 7 days vs previous 7 days.
    """
    now = timezone.now()
    last_week_start = now - timedelta(days=7)
    prev_week_start = now - timedelta(days=14)
    
    # Last 7 days
    last_week_counts = Complaint.objects.filter(
        created_at__gte=last_week_start
    ).values('category').annotate(count=Count('id'))
    
    # Prev 7 days
    prev_week_counts = Complaint.objects.filter(
        created_at__range=(prev_week_start, last_week_start)
    ).values('category').annotate(count=Count('id'))
    
    last_week_dict = {item['category']: item['count'] for item in last_week_counts}
    prev_week_dict = {item['category']: item['count'] for item in prev_week_counts}
    
    trends = []
    # Combine categories from both weeks
    all_categories = set(last_week_dict.keys()) | set(prev_week_dict.keys())
    
    for cat in all_categories:
        curr = last_week_dict.get(cat, 0)
        prev = prev_week_dict.get(cat, 0)
        
        if prev == 0:
            increase = 100 if curr > 0 else 0
        else:
            increase = int(((curr - prev) / prev) * 100)
            
        trends.append({
            'category': cat,
            'category_display': cat.replace('_', ' ').capitalize(),
            'current_count': curr,
            'previous_count': prev,
            'increase_percent': increase
        })
        
    # Sort by highest increase
    return sorted(trends, key=lambda x: x['increase_percent'], reverse=True)
