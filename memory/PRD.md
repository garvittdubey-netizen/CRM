# PRD — Real Estate CRM

## Latest iteration (Phase 7.0)
> Build Lead Pipeline (Kanban Board) only.
> Backend: reuse existing lead status data. No new models.
> Frontend: Kanban with 6 columns (NEW/CONTACTED/QUALIFIED/NEGOTIATING/WON/LOST),
> drag-and-drop status updates, lead cards (name/phone/source/agent/follow-up badge),
> search & filters with URL persistence, responsive, reuse existing components.

## Architecture
- Frontend: React 18 + Vite + TS + Tailwind + Shadcn (port 3000), `recharts`, `@dnd-kit/core` + `@dnd-kit/sortable` for Kanban.
- Python proxy: FastAPI (port 8001) → Node API.
- Node API: Express + Prisma + Multer (port 8002).
- DB: Neon PostgreSQL.
- Auth: JWT (bcryptjs).

## User personas
- ADMIN: full access — sees all leads on Pipeline.
- AGENT: scoped to own assigned leads on Pipeline (RBAC inherited from /api/leads).

## Core requirements (static)
- Lead, Follow-up, Communication, Activity, Analytics, CSV, User Management, Pipeline modules.
- Responsive across desktop and mobile.
- Persistent UI state (sidebar collapse, filters).

## What's implemented
- [x] Phase 1 Auth + admin seed
- [x] Phase 2 Lead module
- [x] Phase 2.5 Follow-up module
- [x] Phase 2.6 Neon DB migration
- [x] Phase 3.0 Communication module + Activity feed
- [x] Phase 3.1 Communication UX corrections
- [x] Phase 3.2 Quick replies in chat composer
- [x] Phase 4.0 Dashboard Analytics & Reporting (iteration_8)
- [x] Phase 5.0 CSV Import/Export + User Management (iteration_9)
- [x] Phase 6.0 Mobile Responsiveness + Sidebar UX Polish (iteration_10)
- [x] **Phase 7.0 Lead Pipeline (Kanban Board) (iteration_11, 100%)**
  - @dnd-kit drag-and-drop with optimistic updates + rollback
  - 6 status columns with live counts
  - Lead cards: name + source badge + phone + agent avatar + follow-up reminder badge
  - URL-backed filters (?search=&agent=&source=)
  - Card click → /leads/:id; drag handle is grip icon only
  - Responsive horizontal scroll on mobile (280px columns)
  - Sidebar nav "Pipeline" between Leads and Follow-ups

## Backlog (prioritized)
- P1: Properties / Clients / Deals modules.
- P2: Time-series trend charts; PDF export for analytics.
- P2: Replace window.alert with sonner/toast (especially for Pipeline rollback notifications).
- P3: Virtualize Pipeline board if a tenant exceeds ~500 leads.
- P3: Clean up pre-existing TS warnings in `LeadDetailPage.tsx` + `services/api.ts`.
- P3: Add `DialogDescription` to all modals.

## Next tasks
1. Properties module (Prisma model + CRUD + UI).
2. Clients & Deals modules.
3. Toast notification system (sonner) to replace window.alert site-wide.
