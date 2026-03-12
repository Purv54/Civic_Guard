import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from complaints.models import Complaint, Department, ComplaintEngagement
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seeds realistic heatmap data for Ahmedabad'

    def handle(self, *args, **kwargs):
        self.stdout.write('Cleaning up existing Ahmedabad demo data...')
        Complaint.objects.filter(city="Ahmedabad").delete()

        self.stdout.write('Starting data seeding...')

        # Ensure we have users for engagements
        users = list(User.objects.all())
        if len(users) < 5:
            self.stdout.write('Creating extra demo users for engagements...')
            for i in range(5):
                User.objects.create_user(username=f'citizen_{i}', email=f'c{i}@example.com', password='password123')
            users = list(User.objects.all())

        admin_user = User.objects.filter(is_superuser=True).first() or users[0]
        dept, _ = Department.objects.get_or_create(name='Public Works', code='PWD', defaults={'description': 'Handles infrastructure and roads.'})
        
        locations = [
            {"name": "SG Highway", "lat": 23.0588, "lng": 72.5081, "type": "high"},
            {"name": "Navrangpura", "lat": 23.0330, "lng": 72.5610, "type": "medium"},
            {"name": "Satellite", "lat": 23.0260, "lng": 72.5230, "type": "medium"},
            {"name": "Paldi", "lat": 23.0125, "lng": 72.5590, "type": "low"},
            {"name": "Law Garden", "lat": 23.0225, "lng": 72.5540, "type": "high"},
            {"name": "Bopal", "lat": 23.0300, "lng": 72.4700, "type": "low"},
            {"name": "Vastrapur", "lat": 23.0375, "lng": 72.5265, "type": "medium"},
            {"name": "Maninagar", "lat": 22.9970, "lng": 72.6000, "type": "high"},
        ]

        complaint_samples = {
            "high": [
                {"title": "Deep Pothole near SG Highway", "desc": "Large sinkhole opening up near the main junction. Extremely dangerous for two-wheelers at night."},
                {"title": "Water Logging near Law Garden", "desc": "Pipeline burst causing significant flooding and road erosion. Traffic completely stalled after rain."},
                {"title": "Exposed High-Voltage Wires", "desc": "Live wires hanging from a damaged pole near the park entrance. High risk of electrocution."},
                {"title": "Bridge Structural Crack", "desc": "Visible cracks on the support pillars of the flyover. Urgent inspection required."},
                {"title": "Hazardous Chemical Spill", "desc": "Industrial waste dumped illegally, emitting toxic fumes and polluting local drainage."}
            ],
            "medium": [
                {"title": "Traffic Signal Malfunction", "desc": "The main signal at the intersection is stuck on red, causing massive gridlock."},
                {"title": "Illegal Parking Blockage", "desc": "Multiple commercial vehicles parked haphazardly, obstructing fire brigade access."},
                {"title": "Streetlight Outage near Maninagar", "desc": "Entire stretch of the road is in pitch darkness for 3 days. Safety concern for residents."},
                {"title": "Blocked Drainage System", "desc": "Sewage overflowing onto the sidewalk after light rain. Health hazard."},
                {"title": "Uncollected Garbage Pile", "desc": "Large dump of domestic waste attracting strays and pests for over a week."}
            ],
            "low": [
                {"title": "Broken Park Bench", "desc": "The seating in the local garden is broken and needs replacement."},
                {"title": "Graffiti on Public Wall", "desc": "Unauthorized painting on the heritage site boundary wall."},
                {"title": "Tree Branch Pruning", "desc": "Overhanging branches touching power lines in the residential lane."},
                {"title": "Minor Sidewalk Cracks", "desc": "The pavement has developed small cracks that could worsen over time."},
                {"title": "Faded Road Markings", "desc": "Zebra crossing lines are barely visible near the school zone."}
            ]
        }

        counts = {"high": 15, "medium": 20, "low": 15}
        created_count = 0

        for risk_type, count in counts.items():
            for _ in range(count):
                weighted_locations = [l for l in locations if l["type"] == risk_type]
                if not weighted_locations: weighted_locations = locations
                base_loc = random.choice(weighted_locations)
                
                lat = base_loc["lat"] + random.uniform(-0.002, 0.002)
                lng = base_loc["lng"] + random.uniform(-0.002, 0.002)
                
                sample = random.choice(complaint_samples[risk_type])
                
                if risk_type == "high":
                    risk_score = random.randint(75, 95)
                    urgency = "critical" if risk_score > 85 else "high"
                elif risk_type == "medium":
                    risk_score = random.randint(40, 70)
                    urgency = "medium"
                else:
                    risk_score = random.randint(10, 30)
                    urgency = "low"

                comp = Complaint.objects.create(
                    citizen=random.choice(users),
                    department=dept,
                    title=sample["title"],
                    description=sample["desc"],
                    location=base_loc["name"],
                    city="Ahmedabad",
                    state="Gujarat",
                    category=random.choice(['roads', 'infrastructure', 'sanitation', 'public_safety', 'water_supply']),
                    urgency=urgency,
                    status='critical' if (risk_score > 80) else random.choice(['pending', 'in_progress']),
                    risk_score=risk_score,
                    latitude=lat,
                    longitude=lng,
                    is_public=True,
                    is_escalated=(risk_score > 80),
                    escalated_at=timezone.now() if risk_score > 80 else None
                )

                # Add engagements
                eng_users = random.sample(users, min(len(users), random.randint(5, 15) if risk_type == "high" else random.randint(1, 5)))
                for u in eng_users:
                    try:
                        ComplaintEngagement.objects.create(
                            complaint=comp,
                            user=u,
                            engagement_type=random.choice(['risk', 'active', 'observed'])
                        )
                    except:
                        pass # Ignore duplicates

                created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {created_count} complaints with engagements for Ahmedabad.'))
