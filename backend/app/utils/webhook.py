"""
Webhook utilities for n8n integration with HMAC-SHA256 authentication.
"""
import hmac
import hashlib
import json
import requests
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


def canonicalize_payload(payload: Dict[str, Any]) -> str:
    """Return the exact JSON string used for signature generation."""
    return json.dumps(payload, sort_keys=True, default=str)


def add_signed_payload_field(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Return a copy of payload that includes the exact canonical JSON string used for signing."""
    payload_with_signature = dict(payload)
    payload_with_signature["_signed_payload"] = canonicalize_payload(payload)
    return payload_with_signature


def generate_hmac_signature(payload: Dict[str, Any], secret: str) -> str:
    """
    Generate HMAC-SHA256 signature for webhook payload.
    
    Args:
        payload: Dictionary to sign
        secret: Shared secret for HMAC
        
    Returns:
        Hexadecimal HMAC signature
    """
    payload_json = canonicalize_payload(payload)
    signature = hmac.new(
        secret.encode(),
        payload_json.encode(),
        hashlib.sha256
    ).hexdigest()
    return signature


def verify_hmac_signature(payload: Dict[str, Any], signature: str, secret: str) -> bool:
    """
    Verify HMAC-SHA256 signature of webhook payload.
    
    Args:
        payload: Dictionary that was signed
        signature: Received signature to verify
        secret: Shared secret for HMAC
        
    Returns:
        True if signature is valid, False otherwise
    """
    expected_signature = generate_hmac_signature(payload, secret)
    return hmac.compare_digest(signature, expected_signature)


def send_webhook(
    webhook_url: str,
    payload: Dict[str, Any],
    secret: str,
    timeout: int = 10
) -> Optional[bool]:
    """
    Send webhook to n8n with HMAC authentication.
    
    Args:
        webhook_url: Target n8n webhook URL
        payload: Data to send
        secret: Shared secret for HMAC signature
        timeout: Request timeout in seconds
        
    Returns:
        True if successful, False on error
    """
    try:
        signed_payload = add_signed_payload_field(payload)
        signature = generate_hmac_signature(payload, secret)
        print("DEBUG_WEBHOOK_PAYLOAD", signed_payload)
        print("DEBUG_WEBHOOK_HAS_SIGNED_PAYLOAD", "_signed_payload" in signed_payload)
        print("DEBUG_WEBHOOK_SIGNATURE", signature)
        headers = {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
            "X-Webhook-Timestamp": str(__import__('time').time())
        }
        
        response = requests.post(
            webhook_url,
            json=signed_payload,
            headers=headers,
            timeout=timeout
        )
        
        if response.status_code in [200, 201, 204]:
            logger.info(f"Webhook sent successfully to {webhook_url}")
            return True
        else:
            logger.error(
                f"Webhook failed with status {response.status_code}: {response.text}"
            )
            return False
            
    except requests.exceptions.Timeout:
        logger.error(f"Webhook request timed out: {webhook_url}")
        return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Webhook request failed: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending webhook: {str(e)}")
        return False


def create_error_payload(
    workflow_name: str,
    node_name: str,
    error_message: str,
    error_type: str,
    original_payload: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create standardized error payload for Error Handling workflow.
    
    Args:
        workflow_name: Name of the workflow that failed
        node_name: Name of the node where error occurred
        error_message: Error message
        error_type: Type of error (e.g., 'database_error', 'validation_error')
        original_payload: Original trigger payload (optional)
        user_id: ID of user associated with the error (optional)
        
    Returns:
        Formatted error payload
    """
    from datetime import datetime
    
    return {
        "event_type": "error",
        "workflow_name": workflow_name,
        "node_name": node_name,
        "error_message": error_message,
        "error_type": error_type,
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "original_payload": original_payload or {}
    }


def create_event_payload(
    event_type: str,
    data: Dict[str, Any],
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create standardized event payload for n8n workflows.
    
    Args:
        event_type: Type of event (e.g., 'appointment.created', 'doctor.verified')
        data: Event-specific data
        user_id: ID of user associated with the event (optional)
        
    Returns:
        Formatted event payload
    """
    from datetime import datetime
    
    return {
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "data": data,
        "user_id": user_id
    }
