from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import ChatMessage

chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")


@chat_bp.get("/<doctor_id>")
@jwt_required()
def get_conversation(doctor_id):
    user_id = get_jwt_identity()
    messages = (
        ChatMessage.query.filter_by(patient_id=user_id, doctor_id=doctor_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return jsonify([m.to_dict() for m in messages])


@chat_bp.post("/<doctor_id>")
@jwt_required()
def send_message(doctor_id):
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    message = ChatMessage(
        patient_id=user_id,
        doctor_id=doctor_id,
        sender=data.get("sender", "patient"),
        text=data.get("text"),
        type=data.get("type", "text"),
        media_url=data.get("mediaUrl"),
        prescription_data=data.get("prescriptionData"),
        report_title=data.get("reportTitle"),
    )
    db.session.add(message)
    db.session.commit()
    return jsonify(message.to_dict()), 201
