"""
Error handling middleware for Sahatak backend with n8n integration.
"""
import logging
from flask import jsonify, current_app
from app.utils.webhook import send_webhook, create_error_payload

logger = logging.getLogger(__name__)


def register_error_handlers(app):
    """
    Register error handlers for the Flask app.
    Fires webhook to n8n Error Handling workflow on errors.
    """

    def send_error_webhook(error_type, error_message, node_name="backend", original_payload=None):
        """Helper function to send error to n8n Error Handling workflow."""
        if not current_app.config.get("N8N_WEBHOOK_ENABLED"):
            logger.debug("n8n webhooks are disabled")
            return

        webhook_url = current_app.config.get("N8N_WEBHOOK_URLS", {}).get("error_handler")
        webhook_secret = current_app.config.get("N8N_WEBHOOK_SECRET")

        if not webhook_url:
            logger.warning("N8N error handler webhook URL not configured")
            return

        payload = create_error_payload(
            workflow_name="backend_error_handler",
            node_name=node_name,
            error_message=error_message,
            error_type=error_type,
            original_payload=original_payload
        )

        # Send webhook asynchronously (non-blocking)
        try:
            send_webhook(webhook_url, payload, webhook_secret)
        except Exception as e:
            logger.error(f"Failed to send error webhook: {str(e)}")

    @app.errorhandler(400)
    def handle_bad_request(error):
        """Handle 400 Bad Request errors."""
        logger.error(f"Bad Request: {str(error)}")
        send_error_webhook(
            error_type="bad_request",
            error_message=str(error),
            node_name="bad_request_handler"
        )
        return jsonify({"error": "Bad Request", "message": str(error)}), 400

    @app.errorhandler(401)
    def handle_unauthorized(error):
        """Handle 401 Unauthorized errors."""
        logger.error(f"Unauthorized: {str(error)}")
        send_error_webhook(
            error_type="unauthorized",
            error_message=str(error),
            node_name="unauthorized_handler"
        )
        return jsonify({"error": "Unauthorized", "message": "Authentication required"}), 401

    @app.errorhandler(403)
    def handle_forbidden(error):
        """Handle 403 Forbidden errors."""
        logger.error(f"Forbidden: {str(error)}")
        send_error_webhook(
            error_type="forbidden",
            error_message=str(error),
            node_name="forbidden_handler"
        )
        return jsonify({"error": "Forbidden", "message": "Access denied"}), 403

    @app.errorhandler(404)
    def handle_not_found(error):
        """Handle 404 Not Found errors."""
        logger.debug(f"Not Found: {str(error)}")
        # Don't send webhook for 404s - too noisy
        return jsonify({"error": "Not Found", "message": str(error)}), 404

    @app.errorhandler(500)
    def handle_internal_error(error):
        """Handle 500 Internal Server errors."""
        logger.error(f"Internal Server Error: {str(error)}")
        send_error_webhook(
            error_type="internal_server_error",
            error_message=str(error),
            node_name="internal_error_handler"
        )
        return jsonify({"error": "Internal Server Error", "message": "An error occurred"}), 500

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        """Handle unexpected errors."""
        logger.error(f"Unexpected error: {str(error)}", exc_info=True)
        send_error_webhook(
            error_type="unexpected_error",
            error_message=str(error),
            node_name="exception_handler"
        )
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred"}), 500
