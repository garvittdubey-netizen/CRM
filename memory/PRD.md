# PRD — Real Estate CRM

## Latest iteration (Phase 5.0)
> Build CSV Import/Export + User Management module only.
> Backend: import leads from CSV, export leads CSV, export 6 separate analytics CSVs.
> User management (ADMIN only): create/edit/disable/change-role/list users.
> Frontend: drag-drop import modal, sample template, export buttons, /users page.
> Requirements: use only Neon DB, real data only, reuse components, modular code.

## Architecture
- Frontend: React 18 + Vite + TS + Tailwind + Shadcn (port 3000), `recharts` for charts.
- Python proxy: FastAPI (port 8001) → Node API.
- Node API: Express + Prisma + Multer (port 8002).
- DB: Neon PostgreSQL (ap-southeast-1).
- Auth: JWT (bcryptjs), token in localStorage `auth_token`.

## User personas
- ADMIN: full CRUD across all modules; only role with access to `/users`, lead CSV import, and user management.
- AGENT: scoped to own leads/follow-ups/comms; can export own leads CSV.

## Core requirements (static)
- Lead module: CRUD + search + filters + role rules + agent assignment + source classification + CSV import/export.
- Follow-up module: CRUD, stats, complete, calendar/list views, reminder classification.
- Communication module: WhatsApp send/receive (Meta Cloud API), call log, conversations inbox.
- Activity module: append-only audit feed.
- Dashboard Analytics: KPIs + charts + filters + per-section CSV exports.
- User Management (ADMIN): create/edit/disable/change-role with last-admin + self-disable safety.

## What's implemented
- [x] Auth + admin seed (Phase 1)
- [x] Lead module (Phase 2)
- [x] Follow-up backend + frontend (Phase 2.5)
- [x] Neon DB migration (Phase 2.6)
- [x] Communication module + Activity feed (Phase 3.0)
- [x] Communication UX corrections (Phase 3.1)
- [x] Quick replies in chat composer (Phase 3.2)
- [x] Dashboard Analytics & Reporting (Phase 4.0, iteration_8 — 28/28 + 100%)
- [x] **CSV Import/Export + User Management (Phase 5.0, iteration_9 — 34/34 + 100%)**
  - `User.isActive` migration; disabled login → 403.
  - Users CRUD with last-admin + self-disable guards; immutable email.
  - Lead CSV import (multipart, dup phone/email detection, row-level summary), Lead CSV export, sample template.
  - 6 analytics CSV exports (one per section) — same range/RBAC as JSON.
  - /users admin page with search/role/status filters + UserFormModal + enable/disable toggle.
  - LeadsPage Import/Export buttons + ImportLeadsModal with drag-drop.
  - DashboardPage analytics export dropdown.

## Backlog (prioritized)
- P1: Properties module (CRUD), Clients module, Deals module.
- P2: Time-series trend charts on dashboard.
- P2: PDF export option for analytics.
- P2: Mobile sidebar drawer (Sheet).
- P3: Add DialogDescription to UserFormModal + ImportLeadsModal for screen readers.
- P3: Return HTTP 413 specifically on multer LIMIT_FILE_SIZE (currently bubbles up generic).

## Next tasks
1. Properties module (Prisma model + CRUD + UI) — feeds Phase 6 revenue analytics.
2. Clients & Deals modules.
3. PDF export option for analytics.
