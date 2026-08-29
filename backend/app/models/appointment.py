from app.extensions import db
from app.models.base import BaseModel


class Appointment(BaseModel):
    __tablename__ = "appointments"

    patient_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    doctor_id = db.Column(db.String(36), db.ForeignKey("doctors.id"), nullable=False)

    date = db.Column(db.String(20), nullable=False)
    time_slot = db.Column(db.String(20), nullable=False)
    consultation_type = db.Column(db.String(20), nullable=False)  # video | audio | chat | clinic
    status = db.Column(db.String(20), default="upcoming")  # upcoming | completed | cancelled

    patient_name = db.Column(db.String(120))
    patient_age = db.Column(db.Integer)
    patient_gender = db.Column(db.String(20))
    symptoms = db.Column(db.Text)

    consultation_fee = db.Column(db.Numeric(10, 2))
    service_fee = db.Column(db.Numeric(10, 2))
    total_fee = db.Column(db.Numeric(10, 2))

    prescription_id = db.Column(db.String(36), db.ForeignKey("medical_records.id"), nullable=True)
    notes = db.Column(db.Text)
    meeting_link = db.Column(db.String(255))

    def to_dict(self, currency_fmt="{} SDG", currency_fmt_ar="{} جنيه"):
        return {
            "id": self.id,
            "doctorId": self.doctor_id,
            "doctor": self.doctor.to_dict() if self.doctor else None,
            "date": self.date,
            "timeSlot": self.time_slot,
            "consultationType": self.consultation_type,
            "status": self.status,
            "patientName": self.patient_name,
            "patientAge": self.patient_age,
            "patientGender": self.patient_gender,
            "symptoms": self.symptoms,
            "consultationFee": float(self.consultation_fee or 0),
            "serviceFee": float(self.service_fee or 0),
            "totalFee": float(self.total_fee or 0),
            "formattedFee": currency_fmt.format(self.total_fee or 0),
            "formattedFeeAr": currency_fmt_ar.format(self.total_fee or 0),
            "bookedAt": self.created_at.isoformat() if self.created_at else None,
            "prescriptionId": self.prescription_id,
            "notes": self.notes,
            "meetingLink": self.meeting_link,
        }
