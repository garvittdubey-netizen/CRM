# PRD — Real Estate CRM

## Original problem statement (current iteration, Phase 4.0)
> Continue from the existing repository only. Do not regenerate existing functionality.
> Build the Dashboard Analytics & Reporting module only.
>
> Backend APIs: Total leads, leads by status, leads by source, follow-ups by status,
> follow-up completion rate, agent performance (assigned/contacted/won/lost),
> communication metrics (sent/received), conversion rate.
>
> Frontend: Lead funnel chart, leads-by-status chart, follow-up completion chart,
> agent performance cards, communication stats cards. Filters: Today / 7d / 30d / Custom.
>
> Requirements: Real data only, reuse existing components, modify only required files.

## Architecture
- Frontend: React 18 + Vite + TS + Tailwind + Shadcn (port 3000), `recharts` for charts.
- Python proxy: FastAPI (port 8001) → Node API.
- Node API: Express + Prisma (port 8002).
- DB: Neon PostgreSQL (ap-southeast-1) — persistent shared instance.
- Auth: JWT (bcryptjs), token stored in localStorage `auth_token`.

## User personas
- ADMIN: full CRUD, reassign leads, delete follow-ups, tenant-wide analytics across every agent.
- AGENT: sees only own assigned leads/follow-ups/comms; sees only their own performance card.

## Core requirements (static)
- Lead module: CRUD + search + filters + role rules + agent assignment + source classification.
- Follow-up module: CRUD, stats, complete, list/calendar views, lead timeline, reminder classification.
- Communication module: WhatsApp send/receive (Meta Cloud API), call log, conversations inbox, RBAC.
- Activity module: append-only audit feed, RBAC scoped.
- Dashboard Analytics: tenant-wide (ADMIN) / self (AGENT) KPIs over date ranges with charts.

## What's implemented
- [x] Auth + admin seed (Phase 1)
- [x] Lead module (Phase 2, 2026-05-19)
- [x] Follow-up backend + frontend (Phase 2.5, verified 2026-05-19, iteration_4)
- [x] Neon DB migration (Phase 2.6, 2026-05-19)
- [x] Communication module + Activity feed (Phase 3.0, verified 2026-05-19, iteration_6)
- [x] Communication UX corrections (Phase 3.1, verified 2026-05-19, iteration_7)
- [x] Quick replies in chat composer (Phase 3.2, 2026-05-19)
- [x] **Dashboard Analytics & Reporting (Phase 4.0, verified 2026-05-19, iteration_8 — 28/28 backend, 100% frontend)**
  - `LeadSource` enum + `Lead.source` field (migration `20260519173925_add_lead_source`, default MANUAL)
  - 6 analytics endpoints under `/api/analytics/*` (RBAC scoped)
  - Dashboard charts: funnel, by-status, by-source, follow-up completion donut
  - Cards: communication stats, agent performance (admin grid / agent self-view)
  - Date range filter: Today / 7d / 30d / Custom

## Backlog (prioritized)
- P1: Properties module (CRUD), Clients module, Deals module.
- P1: User management page (ADMIN).
- P2: Time-series trend charts (leads over time, weekly funnel velocity).
- P2: Export analytics to CSV/PDF.
- P2: Mobile sidebar drawer (Sheet).
- P3: Optional a11y polish — add `DialogDescription` to all Radix dialogs.
- P3: FollowUpsPage.fetchData error handling.

## Next tasks
1. Properties module (Prisma model + CRUD + UI).
2. Clients & Deals modules — feeds into Phase 5 revenue analytics.
3. Trend charts (lead intake over time) — extends the analytics module.
