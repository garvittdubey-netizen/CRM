# Real Estate CRM — PRD (Living Doc)

## Original Problem
Build an enterprise Real Estate CRM (multi-phase). Latest phase: **Reports module (ADMIN-only) + lightweight Notifications**.

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
- 10.0 Verification (iteration_15, 2026-05-20) — 100% pass
- 10.1 Deals Phase-2 — Kanban board + Detail page + Activity timeline (2026-05-20). iteration_16.json — 37/37 backend + 100% frontend
- **11.0 Reports (ADMIN) + lightweight Notifications (2026-05-20).** iteration_17.json — 36/36 backend + 100% frontend
  - 5 report sections: Leads / Properties / Clients / Deals / Agents
  - Charts (recharts) + tables, per-section CSV, window.print() for PDF
  - Notifications: aggregated feed of follow-ups + deal activities + lead assignments, localStorage-based mark-as-read, polling every 60s, no new tables, no WebSocket
  - Endpoints: `/api/reports/{leads,properties,clients,deals,agents}` + `/export`, `/api/notifications`

## Backlog
- P1: Settings page
- P2: Replace `window.alert` rollback notification with sonner/toast on Pipeline + Deal Board
- P2: Wire stale Analytics 6-option dropdown (currently a single Export button) — or remove the dead route refs in dashboard
- P3: Recharts width(-1) warning polish
- P3: parseRange() return 400 on malformed dates instead of silent default
- P3: Virtualize >500 leads/deals when scale grows
- P3: ReportsPage uses Promise.all — switch to allSettled so a single endpoint failure doesn't nuke the page

## Key Credentials
See `/app/memory/test_credentials.md`.

## Notes
- DATABASE_URL points to managed Neon — DO NOT switch to local Postgres.
- Backend supervisor program lives at `/etc/supervisor/conf.d/supervisord_node_backend.conf`.
- Hot reload enabled for both backend (tsx watch) and frontend (Vite).
- Mark-as-read for notifications is FRONTEND-ONLY via localStorage key `notif:lastRead:{userId}`.
