# BuilderOne CRM — Test Credentials

> **Important**: These credentials are inherited from the underlying CRM (Phase 14.0 seed). They were NOT modified by Phase 15.0. The Phase 15.0 work was purely cosmetic (rebrand + landing + demo card display).

## Real working accounts (seeded against managed Neon Postgres)

| Role        | Email                       | Password      |
|-------------|-----------------------------|---------------|
| SUPER_ADMIN | admin@realestate.com        | Admin@2036    |
| ADMIN       | manager@realestate.com      | Manager@2036  |
| AGENT       | agent@realestate.com        | Agent@2036    |

These accounts authenticate against `POST /api/auth/login` and grant access to the CRM (`/dashboard` and all role-gated routes).

## Demo card on the Login page (NOT seeded)

The amber "Demo Credentials" card on `/login` displays:

- Email: `demo@builderone.com`
- Password: `demo@builderone.com`

**This user does NOT exist in the database yet.** The user explicitly opted to "configure it later" (Phase 16) — the card is currently a display + copy-to-clipboard widget only. If a tester clicks "Use demo credentials" and submits the form, the backend will return `Invalid credentials`. To make it work end-to-end, seed the user in `backend/src/scripts/seed.ts` via an idempotent `prisma.user.upsert`.

## Landing page
- URL: `/` (public, no auth)
- WhatsApp button: `https://wa.me/916355997080?text=Hey%2C%20I%20am%20interested%20in%20BuilderOne%20CRM`
- "Explore" buttons: route authenticated users → `/dashboard`, unauthenticated → `/login`
