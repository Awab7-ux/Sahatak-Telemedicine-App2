import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me-in-production")

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "sqlite:///sahatak.db",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "change-me-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=6)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")

    # n8n Webhook Configuration
    N8N_WEBHOOK_ENABLED = os.environ.get("N8N_WEBHOOK_ENABLED", "false").lower() == "true"
    N8N_WEBHOOK_SECRET = os.environ.get("N8N_WEBHOOK_SECRET", "your-webhook-secret-change-in-production")
    
    # n8n Webhook URLs (set these after creating workflows in n8n.cloud)
    N8N_WEBHOOK_URLS = {
        "error_handler": os.environ.get("N8N_WEBHOOK_ERROR_HANDLER", ""),
        "appointment_created": os.environ.get("N8N_WEBHOOK_APPOINTMENT_CREATED", ""),
        "appointment_status_changed": os.environ.get("N8N_WEBHOOK_APPOINTMENT_STATUS_CHANGED", ""),
        "doctor_verified": os.environ.get("N8N_WEBHOOK_DOCTOR_VERIFIED", ""),
        "audit_log": os.environ.get("N8N_WEBHOOK_AUDIT_LOG", ""),
        "notification": os.environ.get("N8N_WEBHOOK_NOTIFICATION", ""),
    }

