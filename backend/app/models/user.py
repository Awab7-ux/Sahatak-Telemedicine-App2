from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from app.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    name = db.Column(db.String(120), nullable=False)
    name_ar = db.Column(db.String(120))
    phone = db.Column(db.String(30), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    avatar = db.Column(db.String(255))

    blood_type = db.Column(db.String(10))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    gender_ar = db.Column(db.String(20))
    height = db.Column(db.String(20))
    weight = db.Column(db.String(20))
    emergency_contact = db.Column(db.String(30))
    insurance_provider = db.Column(db.String(120))
    insurance_provider_ar = db.Column(db.String(120))
    policy_number = db.Column(db.String(80))
    location = db.Column(db.String(120))
    location_ar = db.Column(db.String(120))

    appointments = db.relationship("Appointment", backref="patient", lazy=True)
    medical_records = db.relationship("MedicalRecord", backref="patient", lazy=True)
    notifications = db.relationship("NotificationItem", backref="patient", lazy=True)
    cart_items = db.relationship("CartItem", backref="patient", lazy=True)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "nameAr": self.name_ar,
            "phone": self.phone,
            "email": self.email,
            "avatar": self.avatar,
            "bloodType": self.blood_type,
            "age": self.age,
            "gender": self.gender,
            "genderAr": self.gender_ar,
            "height": self.height,
            "weight": self.weight,
            "emergencyContact": self.emergency_contact,
            "insuranceProvider": self.insurance_provider,
            "insuranceProviderAr": self.insurance_provider_ar,
            "policyNumber": self.policy_number,
            "location": self.location,
            "locationAr": self.location_ar,
        }
