from app.extensions import db
from app.models.base import BaseModel


class ChatMessage(BaseModel):
    __tablename__ = "chat_messages"

    patient_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    doctor_id = db.Column(db.String(36), db.ForeignKey("doctors.id"), nullable=False)

    sender = db.Column(db.String(10), nullable=False)  # patient | doctor
    text = db.Column(db.Text)
    type = db.Column(db.String(20), default="text")  # text | image | prescription | report | voice
    media_url = db.Column(db.String(255))
    prescription_data = db.Column(db.JSON)
    report_title = db.Column(db.String(150))

    def to_dict(self):
        return {
            "id": self.id,
            "sender": self.sender,
            "text": self.text,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
            "type": self.type,
            "mediaUrl": self.media_url,
            "prescriptionData": self.prescription_data,
            "reportTitle": self.report_title,
        }
