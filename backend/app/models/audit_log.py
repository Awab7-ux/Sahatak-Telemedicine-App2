from app.extensions import db
from app.models.base import BaseModel


class AuditLog(BaseModel):
    """
    Audit log for sensitive actions - used by n8n Audit Logging workflow.
    Records: doctor verification decisions, admin actions, medical record access.
    """
    __tablename__ = "audit_logs"

    action = db.Column(db.String(100), nullable=False)  # e.g., 'doctor_verified', 'record_accessed'
    action_type = db.Column(db.String(50), nullable=False)  # 'admin_action', 'doctor_action', 'system_action'
    actor_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)  # Who performed the action
    actor_type = db.Column(db.String(20), nullable=False)  # 'admin', 'doctor', 'system'
    target_id = db.Column(db.String(36), nullable=True)  # e.g., doctor ID or record ID being acted upon
    target_type = db.Column(db.String(20), nullable=True)  # 'doctor', 'medical_record', 'user'
    details = db.Column(db.JSON, nullable=True)  # Additional details about the action
    result = db.Column(db.String(20), nullable=True)  # 'success', 'failure'
    description = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "action": self.action,
            "actionType": self.action_type,
            "actorId": self.actor_id,
            "actorType": self.actor_type,
            "targetId": self.target_id,
            "targetType": self.target_type,
            "details": self.details,
            "result": self.result,
            "description": self.description,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
        }
