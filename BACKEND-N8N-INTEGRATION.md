# Sahatak n8n Implementation - Phase 1: Backend Infrastructure Complete ✅

## Summary of Backend Changes

The backend infrastructure for n8n webhook integration has been successfully created. Here's what was added:

### 1. New Files Created

**`backend/app/utils/webhook.py`** - Webhook utilities with HMAC-SHA256 authentication
- `generate_hmac_signature()` - Create HMAC signatures for payloads
- `verify_hmac_signature()` - Verify incoming webhook signatures
- `send_webhook()` - Send authenticated webhooks to n8n
- `create_error_payload()` - Standardized error payload format
- `create_event_payload()` - Standardized event payload format

**`backend/app/utils/error_handler.py`** - Error handling middleware
- Registers Flask error handlers for 400, 401, 403, 404, 500 errors
- Automatically fires webhook to n8n Error Handling workflow on errors
- Includes error logging with timestamps and details

**`backend/app/models/audit_log.py`** - New AuditLog model
- Tracks sensitive actions: doctor verification, admin actions, medical record access
- Fields: action, action_type, actor_id, target_id, details, result

### 2. Files Modified

**`backend/app/config.py`**
- Added `N8N_WEBHOOK_ENABLED` - Toggle webhook firing on/off
- Added `N8N_WEBHOOK_SECRET` - Shared secret for HMAC signing
- Added `N8N_WEBHOOK_URLS` - Dictionary of all webhook endpoints

**`backend/app/models/__init__.py`**
- Registered new `AuditLog` model for imports

**`backend/app/__init__.py`**
- Imported `AuditLog` model in `create_app()`
- Registered error handlers middleware

### 3. Environment Variables Required

Add these to your `.env` file in the backend directory:

```bash
# n8n Webhook Configuration
N8N_WEBHOOK_ENABLED=false              # Set to 'true' after n8n workflows are created
N8N_WEBHOOK_SECRET=your-webhook-secret-change-this

# These will be populated after creating workflows in n8n.cloud
N8N_WEBHOOK_ERROR_HANDLER=             # Webhook URL for error handling
N8N_WEBHOOK_APPOINTMENT_CREATED=       # Webhook URL for appointment creation
N8N_WEBHOOK_APPOINTMENT_STATUS_CHANGED= # Webhook URL for appointment status changes
N8N_WEBHOOK_DOCTOR_VERIFIED=           # Webhook URL for doctor verification
N8N_WEBHOOK_AUDIT_LOG=                 # Webhook URL for audit logging
N8N_WEBHOOK_NOTIFICATION=              # Webhook URL for notifications
```

---

## Next Steps: n8n.cloud Setup

**See the detailed guide: `n8n-setup-guide-ARABIC.md`** (in the root directory)

Follow the Arabic guide to:
1. Create a free n8n.cloud account (5 minutes)
2. Create a workspace named "Sahatak-Automation"
3. Verify your email
4. Then come back and tell me: "My n8n.cloud account is ready"

---

## Error Handling Workflow Specification

When you're ready in n8n.cloud, the **Error Handling workflow** will:

### Trigger
- Receives webhook POST requests from the backend when errors occur
- Path: `/webhook/error-handler` (customizable in n8n)
- Payload example:
```json
{
  "event_type": "error",
  "workflow_name": "backend_error_handler",
  "node_name": "internal_error_handler",
  "error_message": "Database connection failed",
  "error_type": "internal_server_error",
  "timestamp": "2026-09-01T10:30:45.123456",
  "user_id": null,
  "original_payload": {}
}
```

### Actions
1. **Verify HMAC signature** - Check that `X-Webhook-Signature` header matches payload
2. **Format error details** - Extract error message, type, node, timestamp
3. **Send email alert** - To awabpasta@gmail.com with:
   - Subject: `[Sahatak Error Alert] {error_type}`
   - Body: error message, timestamp, workflow name, node name
4. **Log to database** - Optional: create AuditLog entry for error tracking

### Security
- HMAC-SHA256 signature verification on every request
- Shared secret: stored in backend `config.N8N_WEBHOOK_SECRET`
- Header: `X-Webhook-Signature` contains the signature

---

## Testing Strategy

When the Error Handling workflow is created:

1. **Manual test with Postman/curl**
   ```bash
   curl -X POST https://n8n.cloud/webhook/... \
     -H "Content-Type: application/json" \
     -H "X-Webhook-Signature: <GENERATED_SIGNATURE>" \
     -d '{"event_type":"error","error_message":"Test error",...}'
   ```

2. **Trigger a real backend error** (create malformed request) and verify:
   - Email is received at awabpasta@gmail.com
   - Error details are logged correctly

3. **Check backend logs** for webhook firing success/failure

---

## Important Notes

⚠️ **Do NOT modify these files** without consulting me:
- `backend/run.py` - Server startup
- `backend/app/routes/*.py` - Routes (we'll add webhook calls here later)
- Existing models - only extension is allowed

✅ **Safe to modify**:
- `.env` - environment variables
- `backend/app/config.py` - already prepared for n8n
- Appointment/Doctor/User routes - we'll add webhook firing with minimal changes

---

## Troubleshooting Checklist

If webhooks aren't firing:
1. Check `N8N_WEBHOOK_ENABLED=true` in `.env`
2. Verify webhook URLs are correct format
3. Check backend logs for webhook send errors
4. Confirm n8n.cloud is accessible from your network
5. Verify HMAC secret matches on both sides

---

## Ready to Proceed?

Follow the Arabic setup guide first, then message me when:
- ✅ n8n.cloud account created
- ✅ Workspace "Sahatak-Automation" set up
- ✅ Email verified

Then we'll create the Error Handling workflow together!
