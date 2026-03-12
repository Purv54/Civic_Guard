from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from complaints.models import Department, UserProfile, Complaint, ComplaintEngagement
from django.utils import timezone
import random
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seeds realistic data for users, complaints, and engagements.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.MIGRATE_HEADING('\n[CivicGuard] Starting advanced data seeding...\n'))

        # ── 1. Seed Departments (Ensuring they exist) ─────────────────────
        DEPARTMENTS = [
            {'name': 'Infrastructure & Roads', 'code': 'INFRA', 'description': 'Roads, bridges, and public infrastructure.'},
            {'name': 'Water Supply & Sanitation', 'code': 'WATER', 'description': 'Drinking water, drainage, and sewage systems.'},
            {'name': 'Electricity & Power', 'code': 'POWER', 'description': 'Electricity supply, streetlights, and power outages.'},
            {'name': 'Public Health', 'code': 'HEALTH', 'description': 'Hospitals, clinics, and public health services.'},
            {'name': 'Environment & Waste', 'code': 'ENV', 'description': 'Garbage collection, pollution control, and green spaces.'},
            {'name': 'Transport & Traffic', 'code': 'TRANSPORT', 'description': 'Public transport, traffic management, and parking.'},
        ]
        
        dept_objs = []
        for d in DEPARTMENTS:
            dept, _ = Department.objects.get_or_create(code=d['code'], defaults=d)
            dept_objs.append(dept)

        # ── 2. Create Realistic Users ──────────────────────────────────
        USERS_DATA = [
            {'username': 'rahul_mehta', 'first_name': 'Rahul', 'last_name': 'Mehta', 'email': 'rahul.mehta@example.com', 'type': 'Office Worker'},
            {'username': 'priya_shah', 'first_name': 'Priya', 'last_name': 'Shah', 'email': 'priya.shah@example.com', 'type': 'College Student'},
            {'username': 'amit_patel', 'first_name': 'Amit', 'last_name': 'Patel', 'email': 'amit.patel@example.com', 'type': 'Shop Owner'},
            {'username': 'neha_desai', 'first_name': 'Neha', 'last_name': 'Desai', 'email': 'neha.desai@example.com', 'type': 'Daily Commuter'},
            {'username': 'karan_joshi', 'first_name': 'Karan', 'last_name': 'Joshi', 'email': 'karan.joshi@example.com', 'type': 'Senior Citizen'},
            {'username': 'sneha_reddy', 'first_name': 'Sneha', 'last_name': 'Reddy', 'email': 'sneha.reddy@example.com', 'type': 'Software Engineer'},
            {'username': 'vicky_sharma', 'first_name': 'Vikram', 'last_name': 'Sharma', 'email': 'v.sharma@example.com', 'type': 'Taxi Driver'},
            {'username': 'ananya_iyer', 'first_name': 'Ananya', 'last_name': 'Iyer', 'email': 'ananya.i@example.com', 'type': 'Homemaker'},
            {'username': 'raj_malhotra', 'first_name': 'Raj', 'last_name': 'Malhotra', 'email': 'raj.m@example.com', 'type': 'Banker'},
            {'username': 'pooja_verma', 'first_name': 'Pooja', 'last_name': 'Verma', 'email': 'pooja.v@example.com', 'type': 'Architect'},
        ]

        citizens = []
        for u_data in USERS_DATA:
            user, created = User.objects.get_or_create(
                username=u_data['username'],
                defaults={
                    'email': u_data['email'],
                    'first_name': u_data['first_name'],
                    'last_name': u_data['last_name'],
                }
            )
            if created:
                user.set_password('User@1234')
                user.save()
                UserProfile.objects.get_or_create(
                    user=user,
                    defaults={'role': 'citizen', 'city': 'Ahmedabad', 'address': f"{u_data['type']} District"}
                )
                self.stdout.write(f"  [CREATED] User: {user.username}")
            citizens.append(user)

        # ── 3. Create Realistic Complaints ────────────────────────────────
        COMPLAINT_TEMPLATES = [
            {
                'title': "Large Pothole Causing Traffic Delays at SG Highway",
                'description': "There is a deep pothole near the underpass on SG Highway which has already caused two minor accidents this week. Vehicles are swerving suddenly to avoid it, creating a major hazard during peak hours.",
                'category': 'roads',
                'dept_code': 'INFRA'
            },
            {
                'title': "Streetlights not working near Vastrapur Lake",
                'description': "Almost five streetlights on the main road surrounding Vastrapur Lake have been dark for three days. It makes the area quite unsafe for women and children returning home after sunset.",
                'category': 'electricity',
                'dept_code': 'POWER'
            },
            {
                'title': "Garbage Overflowing in Navrangpura",
                'description': "The municipal bin at Navrangpura crossroad is overflowing for 48 hours. Stray animals are spreading the trash onto the road, and the smell is unbearable for nearby residents.",
                'category': 'sanitation',
                'dept_code': 'ENV'
            },
            {
                'title': "Water Pipeline Leakage at Satellite Area",
                'description': "A major underground water pipe has burst near Shivranjani Crossroad. Clean drinking water has been flowing onto the street for hours, causing low pressure in nearby apartments.",
                'category': 'water_supply',
                'dept_code': 'WATER'
            },
            {
                'title': "Malfunctioning Traffic Signal at Law Garden",
                'description': "The traffic signal at Law Garden is stuck on both Red and Green lights at the same time. This is causing extreme confusion and near-misses between high-speed vehicles.",
                'category': 'roads',
                'dept_code': 'TRANSPORT'
            },
            {
                'title': "Illegal Construction Waste Dumping in Bopal",
                'description': "Someone has dumped a massive pile of construction debris on the Bopal-Ambli road during the night. It's blocking half the lane and is very dangerous for night drivers.",
                'category': 'infrastructure',
                'dept_code': 'INFRA'
            },
            {
                'title': "Clogged Storm Drain in Paldi",
                'description': "The drain near the Paldi bus stop is completely blocked with plastic waste. Even a 5-minute rain causes water to accumulate on the road, making it hard to board buses.",
                'category': 'sanitation',
                'dept_code': 'WATER'
            },
            {
                'title': "Unsafe Electric Transformer in Maninagar",
                'description': "The fence around the local transformer in Maninagar is broken, and high-voltage wires are exposed. This is right next to a playground where children play.",
                'category': 'public_safety',
                'dept_code': 'POWER'
            },
            {
                'title': "Broken Pavement near Satellite Medical Store",
                'description': "The footpath tiles are uprooted and broken for about 50 meters. Elderly people are finding it impossible to walk, forcing them to walk on the dangerous main road.",
                'category': 'infrastructure',
                'dept_code': 'INFRA'
            },
            {
                'title': "Daily Sewage Overflow in Gota",
                'description': "Sewage water is overflowing from a manhole continuously in Gota. The entire street is flooded with dirty water, posing a serious health risk and making it impassable.",
                'category': 'sanitation',
                'dept_code': 'WATER'
            }
        ]

        LOCATIONS = ["SG Highway", "Navrangpura", "Paldi", "Satellite", "Law Garden", "Bopal", "Vastrapur", "Maninagar", "Gota", "Ambawadi"]
        URGENCIES = ['low', 'medium', 'high', 'critical']
        STATUSES = ['pending', 'in_review', 'in_progress', 'resolved']

        # Clear existing complaints for a fresh demo if needed
        # Complaint.objects.all().delete() 

        num_complaints = 30
        complaint_objs = []
        
        for i in range(num_complaints):
            template = random.choice(COMPLAINT_TEMPLATES)
            citizen = random.choice(citizens)
            location = random.choice(LOCATIONS)
            
            # Weighted urgency: 30% High/Crit, 40% Med, 30% Low
            u_rand = random.random()
            if u_rand < 0.3:
                urgency = random.choice(['high', 'critical'])
            elif u_rand < 0.7:
                urgency = 'medium'
            else:
                urgency = 'low'
            
            # Status distribution
            s_rand = random.random()
            if s_rand < 0.4:
                status = 'pending'
            elif s_rand < 0.7:
                status = 'in_review'
            elif s_rand < 0.9:
                status = 'in_progress'
            else:
                status = 'resolved'

            dept = Department.objects.filter(code=template['dept_code']).first()
            
            # Random date in last 30 days
            created_date = timezone.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
            
            complaint = Complaint.objects.create(
                citizen=citizen,
                title=f"{template['title']} ({i+1})",
                description=template['description'],
                location=f"{location}, Ahmedabad",
                city="Ahmedabad",
                category=template['category'],
                urgency=urgency,
                status=status,
                department=dept,
                is_public=True
            )
            # Need to manually set created_at because auto_now_add=True prevents it in .create()
            Complaint.objects.filter(id=complaint.id).update(created_at=created_date)
            complaint_objs.append(complaint)

        self.stdout.write(self.style.SUCCESS(f"  [SUCCESS] {num_complaints} realistic complaints created."))

        # ── 4. Create Engagement Data ─────────────────────────────────
        engagement_types = ['risk', 'active', 'resolved_locally', 'observed']
        
        engagement_count = 0
        for complaint in complaint_objs:
            # Each complaint gets 2-8 random engagements
            reacting_users = random.sample(citizens, random.randint(2, 8))
            for user in reacting_users:
                # User might react with 1 or 2 different types
                types_to_add = random.sample(engagement_types, random.randint(1, 2))
                for e_type in types_to_add:
                    _, created = ComplaintEngagement.objects.get_or_create(
                        complaint=complaint,
                        user=user,
                        engagement_type=e_type
                    )
                    if created:
                        engagement_count += 1

        self.stdout.write(self.style.SUCCESS(f"  [SUCCESS] {engagement_count} engagement interactions generated."))
        self.stdout.write(self.style.MIGRATE_HEADING('\n[DONE] Database seeding complete! Demo is ready.\n'))
