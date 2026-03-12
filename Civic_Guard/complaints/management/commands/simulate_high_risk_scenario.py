import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from complaints.models import Complaint, Department, ComplaintEngagement, SystemSettings
from datetime import timedelta

class Command(BaseCommand):
    help = 'Simulates a high-risk crisis scenario by updating existing complaints and engagement'

    def handle(self, *args, **kwargs):
        self.stdout.write('Simulating high-risk crisis scenario...')
        
        # 1. Ensure we have enough users for high engagement (panic simulation)
        # We need distinct users for each engagement type per complaint to satisfy unique_together
        existing_users_count = User.objects.count()
        if existing_users_count < 100:
            self.stdout.write(f'Creating {100 - existing_users_count} simulation users for engagement spike...')
            for i in range(existing_users_count, 100):
                User.objects.create_user(
                    username=f'citizen_alert_{i}', 
                    email=f'alert_{i}@civic.gov', 
                    password='password123'
                )
        
        simulation_users = list(User.objects.all())
        
        # 2. Identify Ahmedabad Complaints
        complaints = Complaint.objects.filter(city="Ahmedabad")
        complaint_list = list(complaints)
        total_count = len(complaint_list)
        
        if total_count == 0:
            self.stdout.write(self.style.ERROR('No complaints found in Ahmedabad. Use seed_heatmap_data first.'))
            return

        # 3. Targeted Crisis Scenarios
        clusters = {
            "SG Highway": {"lat": 23.0588, "lng": 72.5081},
            "Maninagar": {"lat": 22.9970, "lng": 72.6000},
            "Law Garden": {"lat": 23.0225, "lng": 72.5540},
        }

        crisis_templates = [
            {"title": "Major Road Collapse - Critical Zone", "desc": "A significant section of the main road has subsided following heavy rains. Foundation erosion is visible. Extremely hazardous for all vehicles. Public safety alert active."},
            {"title": "Uncontrolled Flash Flooding", "desc": "Water levels have risen rapidly near the signal. Drainage system has completely failed, current is strong enough to move cars. Evacuation advised."},
            {"title": "High-Voltage Grid Fault", "desc": "Transformer explosion and live high-voltage wires on the ground. Multiple signal towers are dark, sparking panic among commuters. Avoid the area."},
            {"title": "Structural Bridge Failure Hazard", "desc": "Main flyover support shows critical cracks. Debris falling onto the highway below. Total closure urged to prevent disaster."}
        ]

        now = timezone.now()
        
        # 4. Update 60% of complaints to High Risk
        high_risk_count = int(total_count * 0.6)
        high_risk_subset = random.sample(complaint_list, high_risk_count)
        
        escalated_tally = 0
        
        self.stdout.write(f'Injecting crisis into {high_risk_count} complaints...')
        
        for comp in high_risk_subset:
            # Geographic focus to create heatmap clusters
            cluster_name = random.choice(list(clusters.keys()))
            center = clusters[cluster_name]
            comp.latitude = center["lat"] + random.uniform(-0.0015, 0.0015)
            comp.longitude = center["lng"] + random.uniform(-0.0015, 0.0015)
            comp.location = f"{cluster_name} Emergency Zone"
            
            # Risk & Urgency
            comp.risk_score = random.randint(78, 97)
            comp.urgency = 'critical' if comp.risk_score > 85 else 'high'
            
            # Crisis Text
            crisis = random.choice(crisis_templates)
            comp.title = crisis["title"]
            comp.description = crisis["desc"]
            
            # Status & Auto-Escalation Simulation
            if comp.risk_score > 85 and escalated_tally < 15:
                comp.is_escalated = True
                comp.status = 'critical'
                comp.escalated_at = now - timedelta(hours=random.randint(1, 4))
                escalated_tally += 1
            else:
                comp.status = random.choice(['pending', 'in_progress'])
            
            comp.save()

            # Engagement Spike (Simulate panic)
            # Target: risk_confirmed > 25, still_active > 15, observed > 40
            types = {
                'risk': random.randint(26, 40),
                'active': random.randint(16, 30),
                'observed': random.randint(41, 70)
            }
            
            for eng_type, count in types.items():
                engaged_users = random.sample(simulation_users, min(len(simulation_users), count))
                for u in engaged_users:
                    try:
                        ComplaintEngagement.objects.get_or_create(
                            complaint=comp,
                            user=u,
                            engagement_type=eng_type
                        )
                    except:
                        pass

        # 5. Simulate Time Spike (Trends)
        self.stdout.write('Adjusting timestamps to create trend spike...')
        
        # 15 complaints in last 24h for sharp spike
        spike_24h = random.sample(complaint_list, min(15, total_count))
        for comp in spike_24h:
            spike_time = now - timedelta(hours=random.randint(1, 23))
            Complaint.objects.filter(id=comp.id).update(created_at=spike_time)
            
        # Another 20 in last 3 days
        remaining = [c for c in complaint_list if c not in spike_24h]
        spike_3d = random.sample(remaining, min(20, len(remaining)))
        for comp in spike_3d:
            spike_time = now - timedelta(days=random.randint(1, 3), hours=random.randint(0, 23))
            Complaint.objects.filter(id=comp.id).update(created_at=spike_time)

        # 6. Enable Emergency Mode
        settings, _ = SystemSettings.objects.get_or_create(id=1)
        settings.emergency_mode = True
        settings.emergency_message = "CRITICAL ADVISORY: Multiple high-risk hazards detected in Ahmedabad. Emergency services deployed to SG Highway and Maninagar. Stay clear of flooded zones."
        settings.save()

        self.stdout.write(self.style.SUCCESS(f'Successfully simulated crisis scenario.'))
        self.stdout.write(self.style.SUCCESS(f' - {high_risk_count} complaints updated to Critical/High risk'))
        self.stdout.write(self.style.SUCCESS(f' - {escalated_tally} auto-escalations triggered'))
        self.stdout.write(self.style.SUCCESS(f' - Emergency mode ENABLED'))
        self.stdout.write(self.style.SUCCESS(' - Sharp trend spike created for last 72 hours'))
