from flask import Flask, jsonify
from app.config import Config
from app.extensions import db, migrate, jwt, cors


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

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
