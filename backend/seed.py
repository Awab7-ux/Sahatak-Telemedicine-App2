"""
Seeds the database with a small set of sample records so the frontend
has real data to render against. Run with: python seed.py
"""
from app import create_app
from app.extensions import db
from app.models import Doctor, DoctorCategory, DoctorAvailableDay, DoctorTimeSlot, Product, ClinicLocation

app = create_app()

with app.app_context():
    db.create_all()

    if not DoctorCategory.query.first():
        db.session.add_all([
            DoctorCategory(name="General", name_ar="عام", icon_name="stethoscope", color="#2563eb", bg_color="#dbeafe"),
            DoctorCategory(name="Cardiology", name_ar="قلب", icon_name="heart", color="#dc2626", bg_color="#fee2e2"),
            DoctorCategory(name="Pediatrics", name_ar="أطفال", icon_name="baby", color="#16a34a", bg_color="#dcfce7"),
        ])

    if not Doctor.query.first():
        doctor = Doctor(
            name="Dr. Ahmed Hassan",
            name_ar="د. أحمد حسن",
            specialty="Cardiologist",
            specialty_ar="استشاري قلب",
            category="Cardiology",
            avatar="https://i.pravatar.cc/150?img=12",
            rating=4.8,
            reviews_count=124,
            experience_years=12,
            patients_count=980,
            fee=250,
            clinic_name="Sahatak Cardiac Clinic",
            clinic_name_ar="عيادة صحتك للقلب",
            location="Khartoum",
            location_ar="الخرطوم",
            about="Specialist in cardiovascular diseases with 12 years of experience.",
            about_ar="استشاري أمراض القلب والأوعية الدموية بخبرة 12 عامًا.",
            is_verified=True,
        )
        db.session.add(doctor)
        db.session.flush()
        db.session.add_all([
            DoctorAvailableDay(doctor_id=doctor.id, day="Sun", day_ar="الأحد", date="1", full_date="2026-09-01", available=True),
            DoctorAvailableDay(doctor_id=doctor.id, day="Mon", day_ar="الاثنين", date="2", full_date="2026-09-02", available=True),
        ])
        db.session.add_all([
            DoctorTimeSlot(doctor_id=doctor.id, time="09:00", available=True),
            DoctorTimeSlot(doctor_id=doctor.id, time="10:00", available=True),
            DoctorTimeSlot(doctor_id=doctor.id, time="11:00", available=False),
        ])

    if not Product.query.first():
        db.session.add(Product(
            name="Paracetamol 500mg",
            name_ar="باراسيتامول 500 مجم",
            brand="Panadol",
            type="Tablets",
            type_ar="أقراص",
            category="Pain Relief",
            category_ar="مسكنات",
            image="https://placehold.co/300x300?text=Panadol",
            price=15,
            packaging="20 tablets",
            rating=4.5,
            reviews_count=56,
            short_desc="Fast relief from pain and fever.",
            short_desc_ar="تسكين سريع للألم والحمى.",
            in_stock=True,
        ))

    if not ClinicLocation.query.first():
        db.session.add(ClinicLocation(
            name="Sahatak Central Clinic",
            name_ar="عيادة صحتك المركزية",
            type="clinic",
            address="Al Amarat St, Khartoum",
            address_ar="شارع العمارات، الخرطوم",
            distance_km=2.4,
            rating=4.6,
            reviews_count=89,
            open_status="Open now",
            open_status_ar="مفتوح الآن",
            is_open=True,
            phone="+249900000000",
            emergency_available=True,
            coordinates={"x": 45, "y": 60},
            image="https://placehold.co/400x250?text=Sahatak+Clinic",
        ))

    db.session.commit()
    print("Seed data inserted successfully.")
