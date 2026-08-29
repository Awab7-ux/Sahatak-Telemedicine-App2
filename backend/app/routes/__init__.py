from app.routes.auth import auth_bp
from app.routes.doctors import doctors_bp
from app.routes.appointments import appointments_bp
from app.routes.medical_records import records_bp
from app.routes.pharmacy import pharmacy_bp
from app.routes.clinics import clinics_bp
from app.routes.notifications import notifications_bp
from app.routes.chat import chat_bp
from app.routes.profile import profile_bp


def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(doctors_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(records_bp)
    app.register_blueprint(pharmacy_bp)
    app.register_blueprint(clinics_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(profile_bp)
