from app.extensions import db
from app.models.base import BaseModel


class MedicalRecord(BaseModel):
    __tablename__ = "medical_records"

    patient_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)

    title = db.Column(db.String(150))
    title_ar = db.Column(db.String(150))
    doctor_name = db.Column(db.String(120))
    doctor_name_ar = db.Column(db.String(120))
    doctor_specialty = db.Column(db.String(120))
    doctor_specialty_ar = db.Column(db.String(120))
    doctor_avatar = db.Column(db.String(255))

    date = db.Column(db.String(20))
    date_ar = db.Column(db.String(20))
    type = db.Column(db.String(30))  # prescription | lab | report | diagnosis | lab_report | consultation_summary
    status = db.Column(db.String(20))  # Active | Completed | Signed
    status_ar = db.Column(db.String(20))

    diagnosis_summary = db.Column(db.Text)
    diagnosis_summary_ar = db.Column(db.Text)
    diagnosis = db.Column(db.Text)
    diagnosis_ar = db.Column(db.Text)
    clinic_name = db.Column(db.String(150))
    clinic_name_ar = db.Column(db.String(150))

    # Nested arrays stored as JSONB (list of PrescriptionMedicine / lab result dicts)
    medicines = db.Column(db.JSON, default=list)
    lab_results = db.Column(db.JSON, default=list)

    file_size = db.Column(db.String(20))
    facility = db.Column(db.String(150))
    facility_ar = db.Column(db.String(150))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "titleAr": self.title_ar,
            "doctorName": self.doctor_name,
            "doctorNameAr": self.doctor_name_ar,
            "doctorSpecialty": self.doctor_specialty,
            "doctorSpecialtyAr": self.doctor_specialty_ar,
            "doctorAvatar": self.doctor_avatar,
            "date": self.date,
            "dateAr": self.date_ar,
            "type": self.type,
            "status": self.status,
            "statusAr": self.status_ar,
            "diagnosisSummary": self.diagnosis_summary,
            "diagnosisSummaryAr": self.diagnosis_summary_ar,
            "diagnosis": self.diagnosis,
            "diagnosisAr": self.diagnosis_ar,
            "clinicName": self.clinic_name,
            "clinicNameAr": self.clinic_name_ar,
            "medicines": self.medicines or [],
            "labResults": self.lab_results or [],
            "fileSize": self.file_size,
            "facility": self.facility,
            "facilityAr": self.facility_ar,
        }
