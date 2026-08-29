from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    required = ["name", "phone", "email", "password"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if User.query.filter((User.email == data["email"]) | (User.phone == data["phone"])).first():
        return jsonify({"error": "User with this email or phone already exists"}), 409

    user = User(
        name=data["name"],
        name_ar=data.get("nameAr"),
        phone=data["phone"],
        email=data["email"],
        gender=data.get("gender"),
        gender_ar=data.get("genderAr"),
        age=data.get("age"),
        location=data.get("location"),
        location_ar=data.get("locationAr"),
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=user.id)
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    identifier = data.get("email") or data.get("phone")
    password = data.get("password")
    if not identifier or not password:
        return jsonify({"error": "email/phone and password are required"}), 400

    user = User.query.filter((User.email == identifier) | (User.phone == identifier)).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=user.id)
    return jsonify({"token": token, "user": user.to_dict()})


@auth_bp.get("/me")
@jwt_required()
def me():
    user = User.query.get_or_404(get_jwt_identity())
    return jsonify(user.to_dict())
