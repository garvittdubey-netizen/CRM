# PRD — Real Estate CRM

## Original problem statement (current iteration)
Continue from existing repository state. Verify and repair only the remaining frontend follow-up work:
1) Follow-ups page UI, 2) Create/Edit modal, 3) Dashboard stat cards, 4) UpcomingFollowUpsWidget,
5) ReminderBadge, 6) LeadTimeline integration, 7) Calendar/List toggle, 8) Admin-only visibility for
`followup-agent-select` and `delete-followup` button. Fix any bugs. Update EMERGENT_STATE.md.

## Architecture
- Frontend: React 18 + Vite + TS + Tailwind + Shadcn (port 3000)
- Python proxy: FastAPI (port 8001) → Node API
- Node API: Express + Prisma (port 8002)
- DB: PostgreSQL 15 (localhost)
- Auth: JWT (bcryptjs), token stored in localStorage `auth_token`

## User personas
- ADMIN: full CRUD, reassign leads, delete follow-ups, choose any agent.
- AGENT: sees only own assigned leads/follow-ups, auto-assigned to self when creating.

## Core requirements (static)
- Lead module: CRUD + search + filters + role rules + agent assignment.
- Follow-up module: CRUD, stats, complete, list/calendar views, lead timeline, reminder classification.

## What's implemented
- [x] Auth + admin seed (Phase 1)
- [x] Lead module (Phase 2, 2026-05-19)
- [x] Follow-up backend + frontend (Phase 2.5, verified 2026-05-19)
  - Verified via testing agent iteration_4.json — 11/11 spec items pass.
  - Environment restored this session: Postgres 15 installed, migrations deployed, `node_backend` supervisor program added.

## Backlog (prioritized)
- P1: Properties module (CRUD), Clients module, Deals module
- P1: User management page (ADMIN)
- P2: Wire Dashboard "Leads" stat to a real `/api/dashboard/stats` endpoint
- P2: Mobile sidebar drawer (Sheet)
- P3: Optional a11y polish — add `DialogDescription` to all Radix dialogs (FollowUpFormModal first)
- P3: FollowUpsPage.fetchData error handling — keep last-known items and surface toast instead of clearing list

## Next tasks
1. Properties module (Prisma model + CRUD + UI).
2. Clients & Deals modules.
3. Real dashboard stats endpoint.
