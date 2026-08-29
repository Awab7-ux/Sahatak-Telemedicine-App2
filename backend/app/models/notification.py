from app.extensions import db
from app.models.base import BaseModel


class NotificationItem(BaseModel):
    __tablename__ = "notifications"

    patient_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(150))
    title_ar = db.Column(db.String(150))
    message = db.Column(db.Text)
    message_ar = db.Column(db.Text)
    type = db.Column(db.String(20))  # appointment | message | prescription | payment | health | chat | medicine
    read = db.Column(db.Boolean, default=False)
    action_screen = db.Column(db.String(40))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "titleAr": self.title_ar,
            "message": self.message,
            "messageAr": self.message_ar,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
            "type": self.type,
            "read": self.read,
            "actionScreen": self.action_screen,
        }
