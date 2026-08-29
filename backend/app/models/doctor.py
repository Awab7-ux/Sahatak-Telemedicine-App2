from app.extensions import db
from app.models.base import BaseModel


class DoctorCategory(BaseModel):
    __tablename__ = "doctor_categories"

    name = db.Column(db.String(80), nullable=False)
    name_ar = db.Column(db.String(80))
    icon_name = db.Column(db.String(80))
    color = db.Column(db.String(20))
    bg_color = db.Column(db.String(20))

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "nameAr": self.name_ar,
            "iconName": self.icon_name, "color": self.color, "bgColor": self.bg_color,
        }


class Doctor(BaseModel):
    __tablename__ = "doctors"

    name = db.Column(db.String(120), nullable=False)
    name_ar = db.Column(db.String(120))
    specialty = db.Column(db.String(120), nullable=False)
    specialty_ar = db.Column(db.String(120))
    category = db.Column(db.String(80))
    avatar = db.Column(db.String(255))
    rating = db.Column(db.Numeric(2, 1), default=0)
    reviews_count = db.Column(db.Integer, default=0)
    experience_years = db.Column(db.Integer, default=0)
    patients_count = db.Column(db.Integer, default=0)
    fee = db.Column(db.Numeric(10, 2), nullable=False)
    clinic_name = db.Column(db.String(150))
    clinic_name_ar = db.Column(db.String(150))
    location = db.Column(db.String(150))
    location_ar = db.Column(db.String(150))
    about = db.Column(db.Text)
    about_ar = db.Column(db.Text)
    is_verified = db.Column(db.Boolean, default=False)

    available_days = db.relationship("DoctorAvailableDay", backref="doctor", lazy=True, cascade="all, delete-orphan")
    time_slots = db.relationship("DoctorTimeSlot", backref="doctor", lazy=True, cascade="all, delete-orphan")
    appointments = db.relationship("Appointment", backref="doctor", lazy=True)

    def to_dict(self, currency_fmt="{} SDG", currency_fmt_ar="{} جنيه"):
        return {
            "id": self.id,
            "name": self.name,
            "nameAr": self.name_ar,
            "specialty": self.specialty,
            "specialtyAr": self.specialty_ar,
            "category": self.category,
            "avatar": self.avatar,
            "rating": float(self.rating or 0),
            "reviewsCount": self.reviews_count,
            "experienceYears": self.experience_years,
            "patientsCount": self.patients_count,
            "fee": float(self.fee),
            "feeFormatted": currency_fmt.format(self.fee),
            "feeFormattedAr": currency_fmt_ar.format(self.fee),
            "clinicName": self.clinic_name,
            "clinicNameAr": self.clinic_name_ar,
            "location": self.location,
            "locationAr": self.location_ar,
            "about": self.about,
            "aboutAr": self.about_ar,
            "isVerified": self.is_verified,
            "availableDays": [d.to_dict() for d in self.available_days],
            "timeSlots": [s.to_dict() for s in self.time_slots],
        }


class DoctorAvailableDay(BaseModel):
    __tablename__ = "doctor_available_days"

    doctor_id = db.Column(db.String(36), db.ForeignKey("doctors.id"), nullable=False)
    day = db.Column(db.String(20))
    day_ar = db.Column(db.String(20))
    date = db.Column(db.String(20))
    full_date = db.Column(db.String(40))
    available = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "day": self.day, "dayAr": self.day_ar, "date": self.date,
            "fullDate": self.full_date, "available": self.available,
        }


class DoctorTimeSlot(BaseModel):
    __tablename__ = "doctor_time_slots"

    doctor_id = db.Column(db.String(36), db.ForeignKey("doctors.id"), nullable=False)
    time = db.Column(db.String(20))
    available = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {"time": self.time, "available": self.available}
