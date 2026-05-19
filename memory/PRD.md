# PRD — Real Estate CRM

## Latest iteration (Phase 6.0)
> Build Mobile Responsiveness + Final UI Polish only.
> Mobile: Sheet drawer sidebar, responsive tables/cards/charts on every page.
> Desktop sidebar UX: smooth width transition, centered icons, no clipping, no jumping,
> hover tooltips when collapsed, persisted active state, localStorage persistence.
> Requirements: reuse components, modify only required files, real data only.

## Architecture
- Frontend: React 18 + Vite + TS + Tailwind + Shadcn (port 3000), `recharts`, `@radix-ui/react-dialog` powered Sheet.
- Python proxy: FastAPI (port 8001) → Node API.
- Node API: Express + Prisma + Multer (port 8002).
- DB: Neon PostgreSQL.
- Auth: JWT (bcryptjs).

## User personas
- ADMIN: full access — CSV imports, user management, tenant-wide analytics.
- AGENT: scoped to own data. Mobile drawer hides admin-only items.

## Core requirements (static)
- Lead, Follow-up, Communication, Activity, Analytics, CSV, User Management modules.
- Responsive across desktop (≥768px) and mobile (<768px).
- Persistent sidebar state.

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
- [x] **Phase 6.0 Mobile Responsiveness + Sidebar UX Polish (iteration_10, 17/17 + 8/8 regression — 100%)**
  - Shadcn Sheet component, MobileSidebar drawer (<md), Navbar hamburger.
  - Shared `nav-items.ts` source.
  - Sidebar: smooth `transition-[width]`, centered icons when collapsed, tooltips, active-state preserved.
  - MainLayout: localStorage `sidebar:collapsed` persistence via lazy initializer.
  - Mobile body overflow = 0; tables wrapped in `overflow-x-auto`; grids stack 1-col.

## Backlog (prioritized)
- P1: Properties module (CRUD), Clients module, Deals module.
- P2: Time-series trend charts.
- P2: PDF export for analytics.
- P3: Clean up pre-existing TS warnings in `LeadDetailPage.tsx` (missing useState) + `services/api.ts` (Vite ImportMeta typing).
- P3: Add `DialogDescription` to all modals for screen readers.

## Next tasks
1. Properties module (Prisma model + CRUD + UI).
2. Clients & Deals modules.
3. Pre-existing TS cleanup (P3).
