from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Appointment, Doctor

appointments_bp = Blueprint("appointments", __name__, url_prefix="/api/appointments")


@appointments_bp.get("/test-error")
def test_error():
    """Test endpoint to trigger a 500 error for webhook testing."""
    raise Exception("Test error from appointments route - webhook should fire!")


@appointments_bp.get("")
@jwt_required()
def list_appointments():
    user_id = get_jwt_identity()
    status = request.args.get("status")
    query = Appointment.query.filter_by(patient_id=user_id)
    if status:
        query = query.filter_by(status=status)
    appointments = query.order_by(Appointment.created_at.desc()).all()
    return jsonify([a.to_dict() for a in appointments])


@appointments_bp.post("")
@jwt_required()
def create_appointment():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    doctor = Doctor.query.get_or_404(data.get("doctorId"))
    service_fee = data.get("serviceFee", 0)
    total_fee = float(doctor.fee) + float(service_fee)

    appointment = Appointment(
        patient_id=user_id,
        doctor_id=doctor.id,
        date=data.get("date"),
        time_slot=data.get("timeSlot"),
        consultation_type=data.get("consultationType", "video"),
        patient_name=data.get("patientName"),
        patient_age=data.get("patientAge"),
        patient_gender=data.get("patientGender"),
        symptoms=data.get("symptoms"),
        consultation_fee=doctor.fee,
        service_fee=service_fee,
        total_fee=total_fee,
    )
    db.session.add(appointment)
    db.session.commit()
    return jsonify(appointment.to_dict()), 201


@appointments_bp.patch("/<appointment_id>")
@jwt_required()
def update_appointment(appointment_id):
    user_id = get_jwt_identity()
    appointment = Appointment.query.filter_by(id=appointment_id, patient_id=user_id).first_or_404()
    data = request.get_json() or {}

    if "status" in data:
        appointment.status = data["status"]
    if "notes" in data:
        appointment.notes = data["notes"]
    if "meetingLink" in data:
        appointment.meeting_link = data["meetingLink"]

    db.session.commit()
    return jsonify(appointment.to_dict())
