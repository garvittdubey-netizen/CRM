# Test Credentials

## Admin
- Email: `admin@realestate.com`
- Password: `Admin@2036`
- Role: ADMIN

## Agent
- Email: `agent@realestate.com`
- Password: `Agent@2036`
- Role: AGENT

## Seeded Test Data (Neon DB)
- One lead "Demo Lead" (phone +919999999999) assigned to Test Agent
- One CALL communication (INTERESTED, 5m, sample note)
- Activity log entry for the CALL_LOGGED action

## WhatsApp Cloud API (Meta)
- Phone Number ID: `1089815154218642`
- Business Account ID: `1391674653005257`
- Verify Token: `4a2b9f83c1e57d6a8b9c0e1f2a3b4c5d`
- App Secret: configured server-side in `WHATSAPP_APP_SECRET`
- ⚠️ Access token currently provided by user is EXPIRED (Meta error code 190, expired 2026-05-18). Real Meta API integration is in place — once a fresh token is provided the send/templates endpoints will work. Webhook GET verification and HMAC POST verification are independent of the access token and verified working.

## URLs
- Frontend: https://test-report-final.preview.emergentagent.com
- API base: same origin, all routes prefixed with `/api`
- Webhook URL for Meta: `<base>/api/webhooks/whatsapp`
