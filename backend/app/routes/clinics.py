from flask import Blueprint, request, jsonify
from app.models import ClinicLocation

clinics_bp = Blueprint("clinics", __name__, url_prefix="/api/clinics")


@clinics_bp.get("")
def list_clinics():
    query = ClinicLocation.query
    type_ = request.args.get("type")
    if type_:
        query = query.filter(ClinicLocation.type == type_)
    return jsonify([c.to_dict() for c in query.all()])


@clinics_bp.get("/<clinic_id>")
def get_clinic(clinic_id):
    return jsonify(ClinicLocation.query.get_or_404(clinic_id).to_dict())
