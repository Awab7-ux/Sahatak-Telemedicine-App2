from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")

EDITABLE_FIELDS = {
    "name": "name", "nameAr": "name_ar", "avatar": "avatar",
    "bloodType": "blood_type", "age": "age", "gender": "gender", "genderAr": "gender_ar",
    "height": "height", "weight": "weight", "emergencyContact": "emergency_contact",
    "insuranceProvider": "insurance_provider", "insuranceProviderAr": "insurance_provider_ar",
    "policyNumber": "policy_number", "location": "location", "locationAr": "location_ar",
}


@profile_bp.get("")
@jwt_required()
def get_profile():
    user = User.query.get_or_404(get_jwt_identity())
    return jsonify(user.to_dict())


@profile_bp.patch("")
@jwt_required()
def update_profile():
    user = User.query.get_or_404(get_jwt_identity())
    data = request.get_json() or {}

    for key, attr in EDITABLE_FIELDS.items():
        if key in data:
            setattr(user, attr, data[key])

    db.session.commit()
    return jsonify(user.to_dict())
