# EMERGENT_STATE.md
# Real Estate CRM — Project State File

> **IMPORTANT:** Read this file before making any modifications to the project.
> This file is the source of truth for project state, architecture, and next steps.

---

## Project Overview

**Purpose:** Real Estate CRM Foundation — A production-ready enterprise CRM platform for real estate agents and administrators to manage properties, clients, and deals.

**Tech Stack:**
- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS + Shadcn UI
- **Backend:** Node.js + Express + TypeScript (port 8002)
- **Proxy:** Python FastAPI reverse proxy (port 8001 → 8002, supervisor-managed)
- **ORM:** Prisma v5
- **Database:** PostgreSQL 15
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Theme:** next-themes (auto light/dark mode)

---

## Current Status

### Completed Features
- [x] Project structure (backend + frontend)
- [x] PostgreSQL database setup (localhost:5432/real_estate_crm) — **local DB, no Emergent-managed deps**
- [x] Prisma schema + migrations (`20260519110814_init`, `20260519113134_add_lead_model`)
- [x] Admin user auto-seeded on startup
- [x] JWT authentication (login, register, logout, /me)
- [x] Login page (split-screen, professional design)
- [x] Protected routes (role-based: ADMIN / AGENT)
- [x] Responsive sidebar (collapsible, role-aware nav)
- [x] Top navbar (user menu, theme toggle, notifications)
- [x] Dashboard page structure (stats cards, placeholders)
- [x] Dark/Light mode auto-toggle (next-themes)
- [x] Shadcn UI components (Button, Card, Input, Label, Badge, etc.)
- [x] **Lead Management module (CRUD + search + filters + pagination + agent assignment + tags + notes + source)**
  - Backend: `/api/leads` (GET/POST), `/api/leads/:id` (GET/PUT/DELETE), `/api/leads/:id/assign` (PATCH)
  - Frontend: `LeadsPage`, `LeadDetailPage`, `LeadFormModal`, `StatusBadge`, `TagInput`
  - Role rules: ADMIN sees all; AGENT sees only own assigned leads; DELETE + ASSIGN restricted to ADMIN
  - `LeadSource` enum added Phase 4.0 (default `MANUAL`); existing leads migrated to MANUAL.
  - Tested: 17/17 backend + 13/13 frontend E2E (iteration_2.json)
- [x] **Dashboard Analytics & Reporting module (Phase 4.0)** — see Phase 4.0 below

### Pending Features
- [ ] Properties module (listing, CRUD)
- [ ] Clients module
- [ ] Deals module
- [ ] Reports (Admin only)
- [ ] User management page (Admin only)
- [ ] Settings page
- [ ] Mobile sidebar (Sheet/Drawer)

### Current Phase
**Phase 2: Lead Management** — COMPLETE
**Phase 2.5: Follow-up Module (Backend + Frontend)** — COMPLETE & VERIFIED (2026-05-19)
  - Backend: `/api/followups` (CRUD), `/api/followups/stats`, `/api/followups/:id/complete` — already tested.
  - Frontend: `FollowUpsPage`, `FollowUpFormModal`, `UpcomingFollowUpsWidget`, `ReminderBadge`, `LeadTimeline`, dashboard stat cards.
  - Verified end-to-end via testing agent (iteration_4.json): 11/11 spec items pass for both ADMIN and AGENT.
  - Role-based visibility confirmed: `followup-agent-select` and `delete-followup-{id}` are ADMIN-only.
  - Calendar/List view toggle, mark-complete, classifyFollowUp (OVERDUE/TODAY buckets) all working.
  - **Environment note**: container was restored this session (Postgres 15 installed, migrations re-deployed, supervisor program `node_backend` added at `/etc/supervisor/conf.d/supervisord_node_backend.conf`).

**Phase 2.6: Persistent shared database migration** — COMPLETE (2026-05-19)
  - Switched `DATABASE_URL` to managed Neon PostgreSQL (ap-southeast-1) — see [Database Connection](#database-connection).
  - Applied all 3 Prisma migrations (`20260519110814_init`, `20260519113134_add_lead_model`, `20260519130935_add_followup_model`) via `npx prisma migrate deploy`.
  - Verified tables present: `users`, `leads`, `follow_ups`, `_prisma_migrations`.
  - Seeded only required users (admin auto-seeded at startup; agent seeded idempotently). No fake lead/follow-up data.
  - Verified end-to-end: admin + agent login, `/api/followups/stats`, `/api/leads`, `/api/agents` all return 200 against Neon.
  - Local Postgres 15 is no longer used; do not switch back.

**Phase 3.0: Communication & Team Activity module** — COMPLETE & VERIFIED (2026-05-19, iteration_6.json)
  - **Real Meta WhatsApp Cloud API integration** (Graph API v22.0). No `wa.me` links, no mocks.
    - Backend service `services/whatsapp.service.ts` — `sendText`, `sendTemplate`, `listTemplates`. Uses `fetch` + Bearer token. Upstream 401 is remapped to HTTP 502 (so an expired Meta token does not get confused with our JWT auth on the frontend).
    - Public webhook `POST /api/webhooks/whatsapp` — HMAC‑SHA256 signature verified against `WHATSAPP_APP_SECRET` using `crypto.timingSafeEqual` over the raw body buffer (`express.json({ verify })` captures `req.rawBody` before parsing).
    - Webhook GET handshake echoes `hub.challenge` iff `hub.verify_token` matches `WHATSAPP_VERIFY_TOKEN`.
    - Inbound messages auto-match a lead by phone-digits (best-effort) and create `direction=INBOUND` rows + `WHATSAPP_RECEIVED` activity. Status callbacks (sent/delivered/read/failed) update the matching outbound row via `whatsappMessageId`.
  - **Prisma additions** (migration `20260519142922_add_communication_activity`):
    - `Communication` (id, leadId, type, direction, message, templateName/Lang/Params, callDuration, callOutcome, status, whatsappMessageId UNIQUE, errorCode, errorDetail, createdById, timestamps)
    - `Activity` (id, userId, leadId?, action, description, metadata, createdAt) — indexed by `(createdAt)`, `(userId,createdAt)`, `(leadId,createdAt)`.
    - Enums `CommunicationType (WHATSAPP|CALL)`, `CommunicationDirection (INBOUND|OUTBOUND)`.
  - **API surface** (all JWT-protected unless noted):
    - `GET    /api/communications`                   list (RBAC: admin sees all, agent sees only assigned-lead rows)
    - `GET    /api/communications/conversations`     inbox sidebar (one row per lead w/ last message)
    - `GET    /api/communications/templates`         pass-through of APPROVED Meta templates
    - `POST   /api/communications/whatsapp/send`     {leadId, message?|templateName+templateLang+templateParams}
    - `POST   /api/communications/calls`             {leadId, callOutcome, callDuration?, notes?}
    - `GET    /api/activities`                       paginated feed (RBAC scoped)
    - `GET    /api/webhooks/whatsapp`                Meta verification handshake (public)
    - `POST   /api/webhooks/whatsapp`                Meta callback (signature-verified, public)
  - **Frontend pages / components**:
    - `/communications` — full chat UX (inbox sidebar + ChatPanel + composer + template picker + call-log modal). Poll 10s.
    - `/activity` — team activity feed with action filter and refresh, polls 10s.
    - Dashboard `ActivityWidget` and per-lead `CommunicationTimeline` integrated into existing pages.
    - Sidebar: Communications (`nav-communications`) and Activity (`nav-activity`) entries.
  - **RBAC enforced server-side**: ADMIN sees everything; AGENT scoped to `lead.assignedAgentId === userId` for both communications and activities; cross-agent call/WhatsApp attempts return 403.
  - **Activity logging** runs on every server-side write (WhatsApp send, call log, inbound receipt). Failures are caught and never roll back the parent action.
  - **Tested**: 15/15 backend pytest assertions, 16/16 frontend specs (iteration_6.json). Webhook GET verification, HMAC signature verification (valid + invalid + missing), inbound message persistence + auto-activity, RBAC scoping, and the expired-token graceful error path all green.
  - **Note on the provided Meta access token**: it is EXPIRED (Meta error code 190, expired 2026-05-18). The integration is fully real — once the user supplies a fresh access token (or a permanent System User token), send + templates will work without code changes.

**Phase 3.1: Communication UX workflow corrections** — COMPLETE & VERIFIED (2026-05-19, iteration_7.json)
  - **Leads page** — added per-row WhatsApp icon (`message-lead-{id}`) that navigates straight to `/communications?leadId={id}`. Disabled with helpful tooltip when the lead has no phone.
  - **Lead Profile** — `lead-message-button` (always available when phone exists) and `lead-call-button` (canManage only) added beside Edit/Delete. The Call button opens the existing `CallLogModal`; the Message button deep-links into the chat.
  - **Communications page**:
    - `new-conversation-button` opens a 2-mode `NewConversationModal`:
      - **Existing lead** — debounced search via `/api/leads?search=` → click result → `/communications?leadId={id}`.
      - **New phone number** — creates a new lead via `POST /api/leads` (so the chat has a CRM home), then opens its conversation. Optional contact name (defaults to `Unknown (<phone>)`).
    - Synthetic stub conversations are created client-side for leads opened via `?leadId=` that have no prior communications (cleared once the first message persists server-side).
    - **Unread badge** + last-message preview: per-user, per-lead `comm:lastRead:{userId}:{leadId}` localStorage marker. INBOUND messages newer than the marker show a green dot on the inbox row and a `total-unread-badge` "N new" in the page header; clicking the conversation marks read.
    - Search by name AND phone in the inbox filter (already present, retained).
  - **No backend changes** in this iteration — confirmed end-to-end (iteration_6 pytest still 15/15 green).
  - Verified by testing agent: 8/8 UX specs PASS, including unread-badge verified by injecting an INBOUND WhatsApp webhook with a valid HMAC-SHA256 signature.

**Phase 3.2: Quick Replies in chat composer** — COMPLETE (2026-05-19)
  - 5 predefined chips above the message input in `ChatPanel.tsx` (`quick-replies` + `quick-reply-{0..4}` test IDs):
    1. "Hello, thanks for contacting us."
    2. "Sending property details shortly."
    3. "Are you available for a site visit?"
    4. "Can we schedule a call?"
    5. "Please share your requirements."
  - Click behaviour: appends to current draft with a space when the textarea is non-empty, otherwise replaces. Agents can edit before sending — the textarea is the source of truth.
  - Chips are disabled when the lead has no phone or a send is in flight (matches the rest of the composer's enabled-state logic).
  - **Frontend-only change** — backend, Prisma, auth, and architecture untouched.
  - Verified live: first chip click → "Hello, thanks for contacting us."; second chip click → "Hello, thanks for contacting us. Sending property details shortly." (append behaviour).

**Phase 4.0: Dashboard Analytics & Reporting** — COMPLETE & VERIFIED (2026-05-19, iteration_8.json)
  - **Lead.source field added** via Prisma migration `20260519173925_add_lead_source`:
    - New enum `LeadSource`: `FACEBOOK | WHATSAPP | WEBSITE | REFERRAL | MANUAL | PROPERTY_PORTAL | OTHER`.
    - `Lead.source` defaults to `MANUAL`; all pre-existing leads were safely back-filled to `MANUAL` by the migration default.
    - `LeadFormModal` exposes the `lead-source-select` dropdown (all 7 options) on create/edit.
  - **Backend API surface** (all JWT-protected, RBAC scoped via `buildLeadScope` / `buildFollowUpScope` / `buildCommScope`):
    - `GET /api/analytics/overview`           → `{totalLeads, wonLeads, lostLeads, conversionRate, range:{from,to,label}}`
    - `GET /api/analytics/leads-by-status`    → `{data:[{status, count}]}` (6 LeadStatus buckets, fixed order)
    - `GET /api/analytics/leads-by-source`    → `{data:[{source, count}]}` (7 LeadSource buckets, fixed order)
    - `GET /api/analytics/followups`          → `{byStatus, total, completed, completionRate}`
    - `GET /api/analytics/agents`             → `{data:[{agentId, agentName, agentEmail, assignedLeads, contactedLeads, wonLeads, lostLeads, conversionRate}]}`
    - `GET /api/analytics/communications`     → `{messagesSent, messagesReceived, callsLogged, total}`
    - Shared query params: `range = today | 7d | 30d | custom` + `from` / `to` (ISO YYYY-MM-DD) for custom. `resolveRange` falls back to 30d on missing/invalid inputs.
  - **RBAC posture**: ADMIN sees tenant-wide aggregates and every AGENT row. AGENT sees only rows tied to leads/follow-ups/communications they own; `/api/analytics/agents` returns exactly one self-card for AGENT callers.
  - **Frontend additions** (no redesign of existing widgets):
    - `DashboardPage` extended with: `DateRangeFilter` (`range-today | range-7d | range-30d | range-custom` + `range-from-input` / `range-to-input` / `range-apply-button`).
    - Charts: `LeadFunnelChart` (horizontal bar), `LeadsBreakdownChart` reused for `leads-by-status-card` and `leads-by-source-card`, `FollowUpCompletionChart` (donut with center % label).
    - Cards: `CommunicationStatsCards` (messages sent / received / calls / total), `AgentPerformanceCards` (grid for admin, single self-card for agent).
    - Existing `UpcomingFollowUpsWidget` and `ActivityWidget` preserved at the bottom — no layout regression.
  - **Charts library**: `recharts` 3.8.1 + `react-is` 19.2.6 (recharts peer dep) + a thin Shadcn-style `ChartContainer` wrapper at `/app/frontend/src/components/ui/chart.tsx`.
  - **Tested**: 28/28 backend pytest assertions + 100% frontend Playwright UX. See `/app/test_reports/iteration_8.json`.
  - **Environment**: backend supervisor program `node_backend` recreated at `/etc/supervisor/conf.d/supervisord_node_backend.conf` (port 8002) during this session.

**Phase 5.0: CSV Import/Export + User Management** — COMPLETE & VERIFIED (2026-05-19, iteration_9.json)
  - **User.isActive field added** via Prisma migration `20260519181x_add_user_active` (default `true`). Disabled users blocked at login with HTTP 403 (`code=ACCOUNT_DISABLED` in `auth.service.ts`). Pre-existing users migrate safely to `isActive=true`.
  - **User management endpoints** (ADMIN only — `requireRole('ADMIN')`):
    - `GET    /api/users`          list with `?search=&role=ADMIN|AGENT|ALL&isActive=true|false|ALL`
    - `POST   /api/users`          create `{name, email, password (≥8), role, isActive?}` → 201 (no password hash returned). 409 on duplicate email, 400 on weak password.
    - `PUT    /api/users/:id`      edit `{name?, role?, isActive?, password?}`. Email is intentionally immutable. Empty password is ignored; non-empty must be ≥8.
    - Email is **never mutated** to preserve audit-history FK integrity. Use disable + create-new for swaps.
  - **Safety guards** (enforced in `user.service.ts`, never bypassable by callers):
    - `CANNOT_DISABLE_SELF` (400) — admins cannot disable their own account.
    - `LAST_ADMIN` (400) — cannot demote OR disable the last active ADMIN. Verified by counting `{role:'ADMIN', isActive:true}` before the write.
  - **CSV — Lead import/export**:
    - `GET  /api/leads/sample-template`  (ADMIN) → CSV w/ all 11 columns + 2 example rows.
    - `POST /api/leads/import`            (ADMIN, multipart `file`) → row-wise summary `{total, imported, skipped, failed, rows:[{row,status,reason?,leadId?}]}`. fullName required. Duplicates by phone OR case-insensitive email (preloaded into a `Set` for O(1) detection — also tracks rows seen WITHIN the same file). `status`/`source` validated against enums. Row-level failures never abort the file.
    - `GET  /api/leads/export`            (any authenticated user; AGENT scoped to own assigned) → CSV w/ id + 15 columns including `assignedAgent`, `assignedAgentEmail`, `createdAt`, `updatedAt`.
    - Mounted BEFORE `/:id` in `lead.routes.ts` so path segments don't get captured as IDs.
    - Multer: memoryStorage, 5 MB cap.
  - **CSV — Analytics exports** (separate file per section, RBAC + range filter identical to JSON endpoints):
    - `GET /api/analytics/export/overview`
    - `GET /api/analytics/export/leads-by-status`
    - `GET /api/analytics/export/leads-by-source`
    - `GET /api/analytics/export/followups`
    - `GET /api/analytics/export/agents`
    - `GET /api/analytics/export/communications`
    - All emit `Content-Type: text/csv; charset=utf-8`, a UTF-8 BOM (`\uFEFF`) for Excel friendliness, and a filename suffix `<from>_to_<to>.csv` derived from the resolved range.
  - **Frontend additions**:
    - New page `/users` (ADMIN-only via `<ProtectedRoute roles={['ADMIN']}>`): `users-page`, `users-search-input`, `users-role-filter`, `users-status-filter`, `add-user-button`, `users-table`, `user-row-{id}`, `user-status-{id}` badge, `edit-user-{id}` + `toggle-user-{id}` icon actions (disabled on self-rows).
    - `UserFormModal` (`user-form-modal`): create/edit; email immutable on edit; role+status disabled on self.
    - `LeadsPage` toolbar gained `export-leads-button` (all users) + `import-leads-button` (admin-only).
    - `ImportLeadsModal` (`import-leads-modal`): drag-drop zone (`import-dropzone`), file picker (`import-file-input`), sample-template download (`download-sample-button`), summary view (`import-summary` + `summary-{total,imported,skipped,failed}` cards + `summary-rows-table`).
    - `DashboardPage` toolbar gained `export-analytics-button` dropdown with 6 items (`export-{overview,leads-by-status,leads-by-source,followups,agents,communications}-csv`); each downloads the current-range CSV via `responseType: 'blob'`.
  - **Tested**: 34/34 backend pytest + 100% frontend Playwright UX (`/app/test_reports/iteration_9.json`). Verified: auth regression, disabled-login 403, RBAC on every users/import endpoint, last-admin guards, self-disable guard, sample-template content, import summary shape, mixed-validity CSV (1 imported / 1 skipped / 1 failed), all 6 analytics CSV exports w/ range params, frontend route guards, modal flows.

**Phase 6.0: Mobile Responsiveness + Sidebar UX Polish** — COMPLETE & VERIFIED (2026-05-19, iteration_10.json)
  - **Pure frontend iteration** — zero backend changes, zero changes to auth / leads / follow-ups / communication / WhatsApp / analytics / CSV / users / DB / architecture.
  - **New Shadcn `Sheet` component** at `/app/frontend/src/components/ui/sheet.tsx` (built on already-installed `@radix-ui/react-dialog`). Side variants (`left|right|top|bottom`), animated entry via `animate-slide-in-left` keyframe added to `tailwind.config.ts`.
  - **New shared nav source** at `/app/frontend/src/components/layout/nav-items.ts` (NAV_ITEMS + BOTTOM_NAV + `filterNavForRole`). Both desktop and mobile sidebars import from here — DRY guaranteed.
  - **New `MobileSidebar.tsx`**: full-height left drawer (`data-testid=mobile-sidebar`), reuses nav items, auto-dismisses on nav click + Escape + overlay click. Mobile nav items expose `data-testid=mobile-nav-{label-lowercased}`. RBAC respected via `filterNavForRole` (AGENT can't see `mobile-nav-users`).
  - **`Sidebar.tsx` refactored** for buttery-smooth collapse:
    - Width transitions on a **single property** (`transition-[width] duration-300 ease-in-out`) — never `transition-all`, which would also animate children.
    - Two width tokens only: `w-[260px]` ↔ `w-[68px]`. No intermediate states.
    - Every nav row carries `whitespace-nowrap` + `overflow-hidden` so labels can't wrap during the animation.
    - Icon container has fixed 18px box and uses `justify-center` when collapsed → icons stay pixel-perfectly centered.
    - Tooltips (Radix) are conditionally mounted **only when collapsed**, so expanded mode has zero tooltip overhead.
    - `NavLink` keeps the active-state `bg-primary` class regardless of collapse state.
    - The aside exposes `data-collapsed="true|false"` for tests to assert against.
  - **`MainLayout.tsx` rebuilt**:
    - localStorage key `sidebar:collapsed` (`'1'` = collapsed, `'0'` = expanded). Read via a lazy `useState` initializer so there's no hydration flash. Written in a `useEffect` whenever the flag flips.
    - Separates **persistent** `collapsed` (desktop) from **ephemeral** `mobileOpen` (drawer).
    - Adds `min-w-0` on the main column so children with `overflow-x-auto` (e.g. leads table) actually clip instead of pushing layout.
  - **`Navbar.tsx`**: prop renamed `onMobileSidebarToggle → onMobileMenuOpen` (semantics: it OPENS the drawer, doesn't toggle the desktop sidebar). `mobile-menu-button` already had `md:hidden` so behaviour at `<768px` is now correct.
  - **Responsive behaviour confirmed** (verified at 390×844 mobile + 1440×900 desktop):
    - Mobile: desktop sidebar `display:none`, hamburger visible, drawer mounts on tap, every nav item closes drawer on click, body has **0px** horizontal overflow on `/dashboard` and `/leads`, grids collapse to 1-col (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`), leads table scrolls horizontally inside its `overflow-x-auto` wrapper.
    - Desktop: toggle flips `data-collapsed` and width 260↔68 within 300ms; `<main>` widens by 192px to match the delta; tooltips appear when hovering collapsed nav items; active route highlight persists in collapsed mode; reload preserves the chosen state (localStorage round-trip verified).
  - **Tested**: 17/17 Phase 6 scenarios + 8/8 regression scenarios → 100% pass (`/app/test_reports/iteration_10.json`). Zero blocking issues; pre-existing TS warnings in `LeadDetailPage.tsx` + `services/api.ts` flagged for a future cleanup (not introduced this iteration).

---

## Database

### Prisma Schema Summary

**Model: User**
| Field     | Type     | Notes              |
|-----------|----------|--------------------|
| id        | String   | cuid(), PK         |
| name      | String   |                    |
| email     | String   | unique             |
| password  | String   | bcrypt hashed      |
| role      | Role     | ADMIN \| AGENT     |
| isActive  | Boolean  | default: true (Phase 5.0) — disabled users blocked at login w/ HTTP 403 |
| createdAt | DateTime | default: now()     |
| updatedAt | DateTime | auto-updated       |
| leads     | Lead[]   | relation: AssignedAgent |

**Model: Lead**
| Field             | Type       | Notes                                       |
|-------------------|------------|---------------------------------------------|
| id                | String     | cuid(), PK                                  |
| fullName          | String     | required                                    |
| phone             | String?    | optional                                    |
| email             | String?    | optional                                    |
| budget            | Decimal?   | @db.Decimal(15, 2), serialized as number    |
| preferredLocation | String?    | optional                                    |
| bhk               | String?    | e.g. "2BHK", "3BHK"                         |
| propertyType      | String?    | Apartment / Villa / Plot / Commercial       |
| status            | LeadStatus | default: NEW                                |
| source            | LeadSource | default: MANUAL (Phase 4.0)                 |
| tags              | String[]   | Postgres text[]                             |
| notes             | String?    | @db.Text                                    |
| assignedAgentId   | String?    | FK → users.id                               |
| assignedAgent     | User?      | relation: AssignedAgent                     |
| createdAt         | DateTime   | default: now()                              |
| updatedAt         | DateTime   | auto-updated                                |

**Enum: Role**
- `ADMIN` — Full access, user management, reports
- `AGENT` — Standard CRM access

**Enum: LeadStatus**
- `NEW` (default) → `CONTACTED` → `QUALIFIED` → `NEGOTIATING` → `WON` / `LOST`

**Enum: LeadSource** (added Phase 4.0)
- `FACEBOOK | WHATSAPP | WEBSITE | REFERRAL | MANUAL | PROPERTY_PORTAL | OTHER` (default: `MANUAL`)

### Database Connection

**Persistent shared database (Neon PostgreSQL, ap-southeast-1).**
Configured via `DATABASE_URL` in `/app/backend/.env`. Do NOT switch to a local/workspace database — this Neon instance is the single source of truth across sessions.

```bash
# DATABASE_URL (set in /app/backend/.env)
postgresql://neondb_owner:npg_xhY6CcBzH8ek@ep-long-hill-aoerz0f8.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

Verified tables (2026-05-19): `users`, `leads`, `follow_ups` (Prisma `FollowUp` model is `@@map("follow_ups")`), `_prisma_migrations`.
Seeded users (idempotent): `admin@realestate.com / Admin@2036` (ADMIN), `agent@realestate.com / Agent@2036` (AGENT). No fake lead/follow-up data is seeded — create on demand via the UI or API.

### Migration Commands

```bash
cd /app/backend

# Generate Prisma client after schema changes
npx prisma generate

# Create and apply migration (development)
npx prisma migrate dev --name <migration_name>

# Apply migrations (production/CI)
npx prisma migrate deploy

# Open Prisma Studio (GUI)
npx prisma studio

# Seed admin user manually
npx tsx src/scripts/seed.ts
```

---

## Authentication

### Auth Endpoints

| Method | Path             | Auth Required | Description          |
|--------|------------------|---------------|----------------------|
| POST   | /api/auth/login  | No            | Login with email/pw  |
| POST   | /api/auth/register | No          | Register new user    |
| GET    | /api/auth/me     | Yes (JWT)     | Get current user     |
| POST   | /api/auth/logout | Yes (JWT)     | Logout               |

### Roles

| Role  | Permissions                                      |
|-------|--------------------------------------------------|
| ADMIN | All routes + User management, Reports            |
| AGENT | Dashboard, Properties, Clients, Deals, Settings  |

### JWT Flow

1. User POSTs to `/api/auth/login` with `{ email, password }`
2. Server returns `{ user, token }` (token = JWT, expires in 7 days)
3. Frontend stores token in `localStorage` as `auth_token`
4. All subsequent requests include `Authorization: Bearer <token>` header
5. Backend middleware verifies token and attaches `req.user`

### Default Admin Credentials

```
Email:    admin@realestate.com
Password: Admin@2036
Role:     ADMIN
```

---

## Environment Variables

### Backend (`/app/backend/.env`)

```env
DATABASE_URL=postgresql://neondb_owner:npg_xhY6CcBzH8ek@ep-long-hill-aoerz0f8.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=de45b3e0ad171b94d92263e40f26801ea167ef8e4154fbb31f3f0170056ed9bb
JWT_EXPIRES_IN=7d
PORT=8002
NODE_ENV=development
FRONTEND_URL=https://analytics-dash-127.preview.emergentagent.com
ADMIN_EMAIL=admin@realestate.com
ADMIN_PASSWORD=Admin@2036
```

### Frontend (`/app/frontend/.env`)

```env
REACT_APP_BACKEND_URL=https://analytics-dash-127.preview.emergentagent.com
VITE_BACKEND_URL=https://analytics-dash-127.preview.emergentagent.com
```

---

## API Routes

### Auth

```
POST /api/auth/login     — { email, password } → { user, token }
POST /api/auth/register  — { name, email, password } → { user, token }
GET  /api/auth/me        — Authorization: Bearer <token> → User
POST /api/auth/logout    — Authorization: Bearer <token> → { message }
GET  /api/health         — { status, service, timestamp }
```

### Leads (all require JWT)

```
GET    /api/leads                  — list leads (paginated, filterable)
       Query params: page, limit (max 100), search, status, propertyType,
                     bhk, assignedAgentId, sortBy, sortOrder
       Response: { leads: Lead[], total, page, limit, pages }
       Role rule: AGENT sees only own assigned leads; ADMIN sees all.

POST   /api/leads                  — create lead (fullName required)
GET    /api/leads/:id              — get one lead (includes assignedAgent)
PUT    /api/leads/:id              — partial update
                                     • ADMIN can edit any lead
                                     • AGENT can edit only leads assigned to themselves
                                       (403 on unassigned or another agent's lead)
                                     • AGENT cannot change assignedAgentId via PUT
DELETE /api/leads/:id              — ADMIN only
PATCH  /api/leads/:id/assign       — ADMIN only, body: { agentId: string | null }
```

### Users / Agents

```
GET    /api/users    — ADMIN only. Full user listing { id, name, email, role }.
                       Restricted so agent accounts cannot harvest admin emails.

GET    /api/agents   — Authenticated. Minimal agent directory used by the
                       assignment dropdown. Returns only role=AGENT users with
                       { id, name, role } — emails and admin accounts are never
                       exposed via this endpoint.
```

---

## Architecture Notes

### Service Ports

| Service          | Port | Notes                              |
|------------------|------|------------------------------------|
| Python Proxy     | 8001 | Supervisor-managed, uvicorn        |
| Node.js Backend  | 8002 | Supervisor-managed, tsx watch      |
| React Frontend   | 3000 | Supervisor-managed, Vite dev server|

### Request Flow

```
Browser → Kubernetes Ingress
  /api/* → port 8001 (Python FastAPI Proxy) → port 8002 (Node.js Express)
  /*     → port 3000 (React Vite Frontend)
```

### Supervisor Programs

- `backend` — Python FastAPI proxy (uvicorn, port 8001)
- `node_backend` — Node.js Express API (tsx watch, port 8002)
- `frontend` — React Vite dev server (yarn start, port 3000)

### Key File Locations

```
/app/
├── backend/
│   ├── server.py              # Python reverse proxy
│   ├── prisma/schema.prisma   # Database schema
│   ├── src/
│   │   ├── index.ts           # Express app entry
│   │   ├── routes/auth.routes.ts
│   │   ├── controllers/auth.controller.ts
│   │   ├── services/auth.service.ts
│   │   ├── middleware/auth.ts
│   │   ├── lib/prisma.ts
│   │   └── scripts/seed.ts
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   │   ├── ui/            # Shadcn UI components
│   │   │   ├── layout/        # Sidebar, Navbar, MainLayout
│   │   │   └── auth/          # ProtectedRoute
│   │   ├── contexts/AuthContext.tsx
│   │   ├── hooks/useAuth.ts
│   │   └── services/api.ts
│   └── .env
└── EMERGENT_STATE.md
```

---

## Deployment Notes (Hostinger)

For production deployment:
1. Set `NODE_ENV=production` in backend `.env`
2. Update `DATABASE_URL` to production PostgreSQL
3. Update `FRONTEND_URL` to production domain
4. Update `VITE_BACKEND_URL` to production API URL
5. Build frontend: `cd /app/frontend && yarn build`
6. Build backend: `cd /app/backend && npm run build`
7. Run `npx prisma migrate deploy` to apply migrations
8. Start Node.js directly: `node dist/index.js` (no Python proxy needed in production)

---

## Next Agent Instructions

### Immediate Next Steps (Phase 3)

1. **Properties Module** (`/app/backend/src/routes/properties.routes.ts`)
   - Prisma model: Property (id, title, price, address, type, status, agentId, createdAt)
   - CRUD endpoints: GET /api/properties, POST, PUT, DELETE
   - Frontend: PropertiesPage.tsx, PropertyCard.tsx, PropertyForm.tsx

2. **Clients Module** (`/app/backend/src/routes/clients.routes.ts`)
   - Prisma model: Client (id, name, email, phone, agentId, createdAt)
   - CRUD endpoints
   - Frontend: ClientsPage.tsx

3. **Deals Module**
   - Prisma model: Deal (id, propertyId, clientId, agentId, amount, status, createdAt)

4. **User Management page** (Admin only) — backend GET /api/users already exists
   - POST /api/users — create agent
   - PUT /api/users/:id — update role
   - DELETE /api/users/:id

5. **Connect Dashboard Stats**
   - Update DashboardPage.tsx to fetch real counts (leads/properties/clients/deals)
   - Add API endpoints: GET /api/dashboard/stats

### Open Decisions (from Lead module review)

- ~~AGENT edit scope~~ ✅ **Resolved** (2026-05-19): AGENTs can now only PUT leads assigned to themselves; admin-only via `PATCH /:id/assign` for reassignment.
- ~~`GET /api/users` exposure~~ ✅ **Resolved** (2026-05-19): Restricted to ADMIN. New `GET /api/agents` (id, name, role only) added for the assignment dropdown — admin accounts are never exposed via this endpoint.

### Important Notes for Next Agent

- **DO NOT modify** `/etc/supervisor/conf.d/supervisord.conf` (read-only system file)
- **DO read** this file before every modification session
- The Python `server.py` is intentionally thin — all logic lives in Node.js backend
- Prisma migrations are tracked in `/app/backend/prisma/migrations/`
- Always run `npx prisma generate` after schema changes
- Token stored in `localStorage` as `auth_token`
- Protected route checks role via `user.role` in AuthContext

### Pending Bugs/Issues

- Mobile sidebar (hamburger menu) does not show a drawer yet — needs `Sheet` component
- `/properties`, `/clients`, `/deals`, `/reports`, `/users`, `/settings` routes return 404 (not built yet)

### Fixed Issues

- [x] api.ts 401 interceptor now excludes `/auth/login` and `/auth/register` from redirect — login error messages display correctly
- [x] Lead Management module wired into App router and Sidebar navigation (Phase 2)
- [x] **Lead ownership rules enforced (Phase 2.1, 2026-05-19)**: AGENTs can only edit leads assigned to themselves; cannot edit unassigned or others' leads; cannot reassign via PUT.
- [x] **`GET /api/users` locked down to ADMIN (Phase 2.1)** — added `GET /api/agents` returning minimal `{id, name, role}` for any authenticated user (used by the lead-assignment dropdown). Admin accounts are no longer exposed to agents.
- [x] **Frontend permission handling**: `extractApiError()` helper surfaces server-side 403 messages on the form, notes editor, and delete confirmation. Edit button hidden on `/leads/:id` when the current user cannot edit. The agent-assignment dropdown is admin-only in the form.

---

## Git Workflow

### Recommended Commit Message

```
feat: Real Estate CRM foundation - auth, dashboard, sidebar, navbar

- Setup Node.js/Express/TypeScript/Prisma backend
- JWT authentication (login, register, me, logout)
- Admin/Agent role-based access control
- Responsive sidebar with collapsible support
- Top navbar with dark/light mode toggle
- Dashboard stats placeholder
- Shadcn UI components (Button, Card, Input, etc.)
- PostgreSQL schema with User model
- Auto admin seeding on startup
```
