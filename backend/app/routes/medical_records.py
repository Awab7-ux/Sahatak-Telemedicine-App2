from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import MedicalRecord

records_bp = Blueprint("medical_records", __name__, url_prefix="/api/medical-records")


@records_bp.get("")
@jwt_required()
def list_records():
    user_id = get_jwt_identity()
    records = MedicalRecord.query.filter_by(patient_id=user_id).order_by(MedicalRecord.created_at.desc()).all()
    return jsonify([r.to_dict() for r in records])


@records_bp.get("/<record_id>")
@jwt_required()
def get_record(record_id):
    user_id = get_jwt_identity()
    record = MedicalRecord.query.filter_by(id=record_id, patient_id=user_id).first_or_404()
    return jsonify(record.to_dict())
