import os
from flask import Flask, jsonify, send_from_directory
from app.config import Config
from app.extensions import db, migrate, jwt, cors


def create_app(config_class=Config):
    app = Flask(__name__, static_folder="static")
    app.config.from_object(config_class)

    # Ensure uploads directory exists
    os.makedirs(os.path.join(app.root_path, "static", "uploads"), exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}, r"/static/*": {"origins": "*"}})

    from app.models import (  # noqa: F401 - ensures models are registered with SQLAlchemy
        User, Doctor, DoctorCategory, DoctorAvailableDay, DoctorTimeSlot,
        Appointment, MedicalRecord, Product, CartItem, ClinicLocation,
        NotificationItem, ChatMessage, MedicalCheckupPackage,
    )

    from app.routes import register_routes
    register_routes(app)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app
