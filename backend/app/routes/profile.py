import os
import uuid
from flask import Blueprint, request, jsonify, current_app
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

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@profile_bp.get("")
@jwt_required()
def get_profile():
    user = User.query.get_or_404(get_jwt_identity())
    return jsonify(user.to_dict())


@profile_bp.route("", methods=["PATCH", "PUT"])
@jwt_required()
def update_profile():
    user = User.query.get_or_404(get_jwt_identity())
    data = request.get_json() or {}

    for key, attr in EDITABLE_FIELDS.items():
        if key in data:
            setattr(user, attr, data[key])

    db.session.commit()
    return jsonify(user.to_dict())


@profile_bp.post("/avatar")
@jwt_required()
def upload_avatar():
    user = User.query.get_or_404(get_jwt_identity())
    file = request.files.get("image") or request.files.get("file") or request.files.get("avatar")

    if not file or file.filename == "":
        return jsonify({"error": "No image file provided"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not supported. Use PNG, JPG, JPEG, or WEBP."}), 400

    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = f"avatar_{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    upload_dir = os.path.join(current_app.root_path, "static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    file.save(file_path)

    avatar_url = f"/static/uploads/{filename}"
    user.avatar = avatar_url
    db.session.commit()

    return jsonify({"avatar": avatar_url, "user": user.to_dict()})

