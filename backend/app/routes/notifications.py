from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import NotificationItem

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


@notifications_bp.get("")
@jwt_required()
def list_notifications():
    user_id = get_jwt_identity()
    items = NotificationItem.query.filter_by(patient_id=user_id).order_by(NotificationItem.created_at.desc()).all()
    return jsonify([i.to_dict() for i in items])


@notifications_bp.patch("/<notification_id>/read")
@jwt_required()
def mark_read(notification_id):
    user_id = get_jwt_identity()
    item = NotificationItem.query.filter_by(id=notification_id, patient_id=user_id).first_or_404()
    item.read = True
    db.session.commit()
    return jsonify(item.to_dict())
