---
title: "Sahatak n8n Automation - Phase 1 Complete: Backend Infrastructure Ready ✅"
date: 2026-09-01
status: "Ready for n8n.cloud Setup"
---

# Sahatak n8n Automation — Phase 1 Kickoff Complete ✅

## Executive Summary

**Phase 1 (Backend Infrastructure) is now complete.** All backend code necessary for n8n webhook integration has been created and tested for syntax errors. The system is ready to receive webhook calls from n8n.cloud as soon as you set up your account.

---

## What Was Implemented

### ✅ Webhook Authentication (HMAC-SHA256)
- Secure signature generation and verification
- Header-based authentication: `X-Webhook-Signature`
- Timestamp validation ready for future enhancement
- Prevents unauthorized webhook calls

### ✅ Error Handling Middleware
- Automatic error detection on Flask routes
- Sends error details to n8n Error Handling workflow
- Includes: error type, message, node name, timestamp, original payload
- Non-blocking: errors are logged locally even if webhook fails

### ✅ New Data Model
- **AuditLog** table for tracking sensitive actions:
  - Doctor verification decisions
  - Admin actions
  - Medical record access
  - Full audit trail with actor, target, action, result, details

### ✅ Environment Configuration
- Clean separation of secrets from code
- All webhook URLs configurable via `.env`
- Easy enable/disable toggle: `N8N_WEBHOOK_ENABLED`
- Ready for production use

---

## Files Created (New)

| File | Purpose |
|------|---------|
| `backend/app/utils/webhook.py` | HMAC signing, webhook sending, payload helpers |
| `backend/app/utils/error_handler.py` | Error middleware, automatic webhook firing |
| `backend/app/models/audit_log.py` | AuditLog database model |
| `n8n-setup-guide-ARABIC.md` | Step-by-step Arabic guide for n8n.cloud setup |
| `BACKEND-N8N-INTEGRATION.md` | Technical documentation |
| `N8N-IMPLEMENTATION-KICKOFF.md` | This file |

## Files Modified (Existing)

| File | Changes |
|------|---------|
| `backend/app/config.py` | Added n8n webhook configuration variables |
| `backend/app/models/__init__.py` | Imported new AuditLog model |
| `backend/app/__init__.py` | Registered error handlers on app startup |
| `backend/.env.example` | Added n8n configuration template |

---

## Environment Variables Required

### Copy these to your `.env` file in the `backend/` directory:

```bash
# CRITICAL: Generate a strong random secret
# Python command: python -c "import secrets; print(secrets.token_hex(32))"
N8N_WEBHOOK_SECRET=<STRONG_RANDOM_STRING_HERE>

# Initially disabled - enable after n8n workflows are created
N8N_WEBHOOK_ENABLED=false

# Webhook URLs - will be populated after creating workflows in n8n.cloud
N8N_WEBHOOK_ERROR_HANDLER=
N8N_WEBHOOK_APPOINTMENT_CREATED=
N8N_WEBHOOK_APPOINTMENT_STATUS_CHANGED=
N8N_WEBHOOK_DOCTOR_VERIFIED=
N8N_WEBHOOK_AUDIT_LOG=
N8N_WEBHOOK_NOTIFICATION=
```

---

## Next Immediate Action: n8n.cloud Account Setup

### For the User (Arabic Instructions Available)
Read: **`n8n-setup-guide-ARABIC.md`** in the project root

The guide walks through:
1. ✅ Creating free n8n.cloud account
2. ✅ Creating workspace "Sahatak-Automation"
3. ✅ Email verification
4. ✅ First login to n8n dashboard

**Estimated time: 5-10 minutes**

---

## Technical Architecture

### Webhook Flow Diagram
```
┌─────────────────────┐
│  Backend (Flask)    │
│  Routes/Errors      │
└──────────┬──────────┘
           │ Error occurs or event triggers
           │
           ▼
┌─────────────────────────────────────┐
│  Webhook Utilities (webhook.py)     │
│  ├─ Generate HMAC Signature         │
│  ├─ Create Event Payload            │
│  └─ Send to n8n via HTTP POST       │
└──────────┬──────────────────────────┘
           │
           │ POST with signature header
           │
           ▼
┌──────────────────────────────────────┐
│  n8n.cloud (Your Workflow)           │
│  ├─ Verify HMAC Signature            │
│  ├─ Process Event                    │
│  ├─ Send Email/Notification/Log      │
│  └─ Return HTTP 200 OK               │
└──────────────────────────────────────┘
```

---

## Security Implementation

### HMAC-SHA256 Signature Verification
Every webhook request includes:
- `X-Webhook-Signature` header: HMAC-SHA256(payload, secret)
- `X-Webhook-Timestamp` header: Current Unix timestamp

n8n must verify:
```python
# On n8n side (in the workflow)
expected_sig = HMAC-SHA256(received_payload, shared_secret)
if received_sig != expected_sig:
    reject_webhook()
```

### Secret Management
- **Never** commit secrets to git
- Use `.env` file (in `.gitignore`)
- Generate strong random string: `python -c "import secrets; print(secrets.token_hex(32))"`
- Length: minimum 32 characters recommended
- Store same secret on both backend AND n8n webhook configuration

---

## Error Handling Workflow Specification

### Trigger
- Webhook POST from backend error handler
- All errors (400, 401, 403, 500, Exceptions) automatically send webhook

### Payload Example
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

### Expected Actions (in n8n)
1. **Verify HMAC** - Check X-Webhook-Signature header
2. **Parse Error** - Extract error details
3. **Send Email** - To awabpasta@gmail.com with:
   - Subject: `[Sahatak Error Alert] {error_type}`
   - Body: error message, timestamp, workflow name, node name
4. **Optional**: Log to database via AuditLog model

---

## Testing Checklist (Before Production)

- [ ] n8n.cloud account created and email verified
- [ ] Error Handling workflow created and deployed
- [ ] Webhook URL received from n8n
- [ ] Webhook URL configured in backend `.env`
- [ ] `N8N_WEBHOOK_SECRET` set to strong random string
- [ ] Manual test: Send sample error webhook with correct signature
- [ ] Manual test: Trigger backend error, verify email received
- [ ] Check backend logs for webhook send success
- [ ] Verify HMAC signature verification is working

---

## Build Order (Per Approved Plan)

| # | Workflow | Status | Notes |
|---|----------|--------|-------|
| 1 | Error Handling | ⏳ n8n setup pending | Reusable by all other workflows |
| 2 | Audit Logging | ⏹️ Not started | Writes to AuditLog model |
| 3 | Email | ⏹️ Not started | Verification, confirmations, decisions |
| 4 | Notifications (in-app) | ⏹️ Not started | Writes to NotificationItem model |
| 5 | Appointment Automation | ⏹️ Not started | Booking confirmations, status routing |
| 6 | Doctor / Admin Automation | ⏹️ Not started | Verification queue alerts |
| 7 | Scheduled Jobs | ⏹️ Not started | Appointment reminders, expiry sweep |
| 8 | Video, Medical Records, Pharmacy | ⏹️ Not started | Lower priority |

---

## Confirmed Decisions (From Original Briefing)

✅ **SMS/WhatsApp:** SKIPPED - only Email and in-app Notifications  
✅ **n8n hosting:** n8n.cloud (free tier, managed)  
✅ **Error alerts:** Email (awabpasta@gmail.com) via existing Gmail SMTP  
✅ **Pharmacy automation:** NOT APPLICABLE - no e-commerce in backend  
✅ **Webhook authentication:** HMAC-SHA256 (required before any workflow is production-ready)  

---

## FAQ

**Q: Why is the webhook not firing?**
A: Check:
1. `N8N_WEBHOOK_ENABLED=true` in `.env`
2. Webhook URL is correct format
3. Backend logs show webhook send attempt
4. n8n.cloud is accessible from your network
5. HMAC secret matches on both sides

**Q: How do I generate a strong webhook secret?**
A:
```bash
# Option 1: Python
python -c "import secrets; print(secrets.token_hex(32))"

# Option 2: OpenSSL
openssl rand -hex 32

# Option 3: Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Q: What if n8n webhook is unreachable?**
A: Backend will log the error but continue normal operation. Webhook firing is non-blocking - backend errors are handled locally regardless.

**Q: Can I use n8n self-hosted instead?**
A: Yes, but setup is more complex. For this project, n8n.cloud free tier is recommended.

---

## Support & Documentation Links

- **n8n Documentation:** https://docs.n8n.io
- **n8n Webhooks Guide:** https://docs.n8n.io/integrations/trigger-nodes/webhook/
- **HMAC-SHA256:** https://en.wikipedia.org/wiki/HMAC

---

## Summary of Next Steps

### For User (After reading this document):

1. **Read Arabic setup guide** (5 min)
   - File: `n8n-setup-guide-ARABIC.md`
   - Create n8n.cloud account
   - Create workspace

2. **Send message** (30 sec)
   - Say: "My n8n.cloud account is ready"

3. **Receive Error Handling workflow design** (we'll provide it)
   - Implement the workflow in n8n
   - Add email configuration (Gmail SMTP)
   - Get webhook URL from n8n

4. **Configure backend** (5 min)
   - Add webhook URL to `.env`
   - Set `N8N_WEBHOOK_ENABLED=true`
   - Restart backend

5. **Test workflow** (10 min)
   - Manually send test webhook
   - Trigger a real error
   - Verify email received

### For Backend Developer (After Phase 1):

- Backend is ready to receive webhooks ✅
- Error handling infrastructure in place ✅
- No changes needed until Phase 2
- Phase 2: Add webhook firing to appointments route

---

**Phase 1 Status: ✅ COMPLETE**

Ready to proceed? Start with the Arabic setup guide, then come back when your n8n account is ready!

---

*Document created: 2026-09-01*  
*Implementation by: GitHub Copilot*  
*Alert email: awabpasta@gmail.com*
