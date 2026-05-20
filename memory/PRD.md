# Real Estate CRM — PRD (Living Doc)

## Original Problem
Build an enterprise Real Estate CRM (multi-phase). Latest phase: **Deals Phase-2** — Kanban board, drag-and-drop, deal detail page, lifecycle activity timeline.

## Architecture
- Frontend: React 18 + Vite + TS + TailwindCSS + Shadcn UI (port 3000)
- Backend: Node.js + Express + TS (port 8002) + Python FastAPI reverse proxy on 8001
- ORM: Prisma v5
- DB: Neon Postgres (ap-southeast-1) — single source of truth, persistent across sessions
- Auth: JWT + bcryptjs
- DnD: @dnd-kit
- Image hosting: Cloudinary (cloud `dd61mc8me`)

## User Personas
- ADMIN — full CRUD, user management, reports, can reassign deals/leads/clients
- AGENT — scoped to own assigned leads/clients/deals; cannot reassign

## Implemented Phases
- 1.0–9.0 (Auth, Leads, Follow-ups, Communications + Meta WhatsApp, Analytics, CSV import/export, User mgmt, Pipeline, Mobile UX, Properties + Cloudinary, Clients)
- 10.0 Deals Phase-1 — list, filters, CRUD (2026-05-20)
- 10.0 Verification (iteration_15, 2026-05-20) — 100% pass on Deals admin/agent + regression
- **10.1 Deals Phase-2 — Kanban board + Detail page + Activity timeline (2026-05-20)**
  - Backend: `DealActivity` model + migration `20260520080309_add_deal_activity_model`
  - Auto-log eventTypes: `CREATED | STATUS_CHANGED | AMOUNT_UPDATED | AGENT_REASSIGNED | NOTES_UPDATED`
  - Endpoints: `GET /api/deals/:id/timeline`, `GET /api/deals/:id/activities`
  - Frontend routes: `/deals/board`, `/deals/:id`
  - Components: DealBoardPage, DealDetailPage, DealBoardCard, DealBoardColumn, DealTimeline
  - Testing: iteration_16.json — 37/37 backend, 100% frontend PASS

## Backlog
- P1: Reports page (admin-only)
- P1: Settings page
- P2: Export Analytics 6-option dropdown wiring (today a single button)
- P2: Clean up stale `/api/analytics/*` 404s in dashboard
- P3: Replace `window.alert` rollback notification with sonner/toast on Pipeline + Deal Board
- P3: Virtualize >500 leads/deals when scale grows

## Key Credentials
See `/app/memory/test_credentials.md`.

## Notes
- DATABASE_URL points to managed Neon — DO NOT switch to local Postgres.
- Backend supervisor program lives at `/etc/supervisor/conf.d/supervisord_node_backend.conf`.
- Hot reload enabled for both backend (tsx watch) and frontend (Vite).
