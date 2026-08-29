from flask import Blueprint, request, jsonify
from app.models import Doctor, DoctorCategory

doctors_bp = Blueprint("doctors", __name__, url_prefix="/api/doctors")


@doctors_bp.get("")
def list_doctors():
    query = Doctor.query
    category = request.args.get("category")
    specialty = request.args.get("specialty")
    search = request.args.get("search")

    if category:
        query = query.filter(Doctor.category == category)
    if specialty:
        query = query.filter(Doctor.specialty == specialty)
    if search:
        like = f"%{search}%"
        query = query.filter(Doctor.name.ilike(like) | Doctor.name_ar.ilike(like))

    doctors = query.order_by(Doctor.rating.desc()).all()
    return jsonify([d.to_dict() for d in doctors])


@doctors_bp.get("/categories")
def list_categories():
    return jsonify([c.to_dict() for c in DoctorCategory.query.all()])


@doctors_bp.get("/<doctor_id>")
def get_doctor(doctor_id):
    doctor = Doctor.query.get_or_404(doctor_id)
    return jsonify(doctor.to_dict())
