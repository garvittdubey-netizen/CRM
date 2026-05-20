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
- [x] **Properties module (Phase 8.0)** — see Phase 8.0 below
- [x] **Clients module (Phase 9.0)** — see Phase 9.0 below
- [x] **Deals module Phase-1 (Phase 10.0)** — see Phase 10.0 below

### Pending Features
- [ ] Deals Phase-2 (Kanban, timeline)
- [ ] Reports (Admin only)
- [ ] Settings page

**Phase 11.0: Settings page** — COMPLETE (2026-05-20)
  - **Scope**: A new self-contained `/settings` page with four tabbed sections (Profile, Preferences, Team Settings [admin], System Status [admin]). Strictly additive — no existing module (auth, leads, follow-ups, communications, whatsapp, analytics, csv, users, pipeline, properties, clients, deals, reports, notifications) was modified or rewired. The Settings nav entry was already in `nav-items.ts` from Phase 6.0; this phase only added the route + page.
  - **New Prisma migration**: `20260520092937_add_settings_and_profile_image`:
    - Adds `User.profileImage String?` (nullable, additive).
    - Adds new `TenantSettings` model — singleton row at id="default" with `autoAssignLeadsEnabled Boolean @default(false)`, `agentVisibilityMode String @default("OWN_ONLY")`, `updatedById String?`, `updatedAt DateTime @updatedAt`. Includes the back-relation `User.tenantSettingsUpdates` so foreign keys are tracked.
    - Pre-existing users migrate safely (profileImage defaults to NULL).
  - **Backend API surface** (all additive, JWT-protected unless stated):
    - `GET    /api/auth/profile`        self profile (id, name, email, role, profileImage, createdAt).
    - `PUT    /api/auth/profile`        updates `name` and/or `profileImage`. Email is intentionally NOT mutable (matches existing User Management contract). Returns the updated row.
    - `PUT    /api/auth/password`       `{currentPassword, newPassword (≥ 8)}` → verifies current password via bcrypt, then re-hashes the new one. 400 + `Current password is incorrect` if the current pass doesn't match.
    - `GET    /api/settings/tenant`     any authenticated user. Upserts the singleton row on first read so callers never see a 404.
    - `PUT    /api/settings/tenant`     ADMIN only. Stamps `updatedById` from `req.user`.
    - `GET    /api/system/status`       ADMIN only. Returns `{whatsapp, cloudinary, database, backend, checkedAt}` — each probe is `{healthy, latencyMs, message}`. Implemented as four parallel probes via `Promise.all`:
      * WhatsApp  → `listTemplates(1)` via Meta Graph (5 s timeout). Currently reports DOWN because the access token in the env is expired (per Phase 3.0 notes).
      * Cloudinary → `cloudinary.api.ping()` with Basic auth (5 s timeout).
      * Database  → `prisma.$queryRaw'SELECT 1'` (3 s timeout).
      * Backend   → self — always healthy if this handler runs.
  - **Cloudinary folder allow-list extended**: added `avatars` (single-line change to `cloudinary.service.ts`) so the existing `/api/uploads/cloudinary-signature` endpoint can issue signatures for `folder=avatars`. The Property uploader is untouched and still uses `folder=properties`.
  - **Files added (backend)**:
    - `services/profile.service.ts`         self-service profile + password helpers.
    - `services/tenant-settings.service.ts` singleton upsert helpers.
    - `controllers/profile.controller.ts`   getMyProfile / updateMyProfile / changeMyPassword.
    - `controllers/tenant-settings.controller.ts` readTenantSettings / writeTenantSettings.
    - `controllers/system.controller.ts`    getSystemStatus (4 parallel probes w/ timeouts).
    - `routes/settings.routes.ts`           wires /tenant.
    - `routes/system.routes.ts`             wires /status (ADMIN only).
  - **Files modified (backend, minimal additive)**:
    - `prisma/schema.prisma`                 `User.profileImage`, `User.tenantSettingsUpdates`, new `TenantSettings` model.
    - `services/cloudinary.service.ts`       folder allow-list extended to `['properties', 'avatars']`.
    - `services/auth.service.ts`             `UserDto` + `toDto` extended with `profileImage` (so existing `/api/auth/me` also returns it — needed for navbar avatar). All other auth logic untouched.
    - `routes/auth.routes.ts`                appended `GET /profile`, `PUT /profile`, `PUT /password`. Existing `/login`, `/register`, `/me`, `/logout` untouched.
    - `index.ts`                             two `app.use(...)` lines added at the bottom of the router list.
  - **Frontend additions**:
    - `pages/SettingsPage.tsx` (~700 lines, single file with clear internal section components). Tabs: Profile / Preferences / Team Settings / System Status. Test-IDs follow the `settings-tab-{key}`, `settings-{section}`, `profile-*`, `password-*`, `theme-option-{light|dark|system}`, `notif-{key}`, `default-landing-select`, `team-autoassign-toggle`, `team-visibility-select`, `system-row-{service}`, `system-refresh-button` naming convention.
    - `services/settings.ts`         profileApi (get/update/changePassword), tenantSettingsApi (get/update), systemApi (status), and local-only preference helpers (`loadPreferences` / `savePreferences` / `LANDING_PAGE_OPTIONS` / `DEFAULT_PREFERENCES`) + a dedicated `uploadAvatarToCloudinary(file, onProgress)` that targets the `avatars` folder.
    - `App.tsx`                      one route added under `MainLayout`: `<Route path="/settings" element={<SettingsPage />} />`.
    - `types/index.ts`               `User.profileImage?: string | null` (optional so backwards compat is fine).
  - **Preferences storage** is localStorage-only at the key `settings:preferences:v1`:
    - Theme uses next-themes (already wired in `main.tsx` since pre-Phase-1; the picker only calls `setTheme`).
    - Four notification toggles (`emailDigest`, `followUpReminders`, `whatsAppInbound`, `systemUpdates`) — persisted in localStorage; no backend, no behavioural wiring claimed.
    - Default landing page — persisted in localStorage; the spec deliberately does NOT wire it into the post-login redirect to avoid touching auth (constraint).
  - **Team Settings — honest labels**: every flag carries the caption `"Saved — activation in future workflow phase"` in an amber pill, exactly as requested. The Leads workflow is NOT modified and the toggles have no behavioural effect yet — only persistence.
  - **RBAC**: every protected endpoint flows through `authenticate` middleware; `/api/settings/tenant PUT` and `/api/system/status` add `requireRole('ADMIN')`. Frontend mirrors this by filtering the tab list to admin-only entries when `user.role !== 'ADMIN'`.
  - **Verified end-to-end** (no testing subagent — explicit constraint "no full regression suite"; manual + curl + Playwright screenshots only):
    - Backend: 8/8 curl scenarios green — GET/PUT profile (with photo URL persistence + clear), PUT password (wrong current → 400, correct current → 200), old password rejected after change, new password works, reset password round-trip, agent → 403 on `/settings/tenant PUT` and `/system/status`.
    - Frontend (ADMIN, 1440×900): all 4 tabs render real backend data; toggle on Auto-assign persists across refresh; System Status shows WhatsApp DOWN (expired token, expected per Phase 3.0), Cloudinary HEALTHY 216 ms, Database HEALTHY 217 ms, Backend HEALTHY 0 ms.
    - Frontend (AGENT): only `Profile` + `Preferences` tabs visible; `Team Settings` and `System Status` correctly hidden by the role filter.
  - **Files NOT touched**: backend auth/leads/follow-ups/communications/whatsapp/analytics/csv/users/pipeline/properties/clients/deals/reports/notifications services, controllers and routes (any); MainLayout, Navbar, Sidebar, MobileSidebar, ProtectedRoute, LoginPage, AuthContext, useAuth hook, NotificationPanel, any existing service file in `frontend/src/services/*` except adding the new `settings.ts`; `frontend/src/types/index.ts` (only a single optional `profileImage?` field added to `User`). The DB connection config (`DATABASE_URL`) is unchanged — the migration is purely additive (new column + new table).

### Latest Bug Fix (2026-05-20)
**Reports PDF — Charts missing/blank in printed output** — FIXED.
- Root cause: Recharts `ResponsiveContainer` measures parent width asynchronously via `ResizeObserver`. `window.print()` snapshots the page synchronously, so the embedded `<svg>` was captured at its stale on-screen width before the print-media layout shift propagated — producing blank chart areas in the generated PDF.
- Fix scope: frontend-only, 2 files (`/app/frontend/src/components/ui/chart.tsx` + `/app/frontend/src/pages/ReportsPage.tsx`). No backend, no architecture, no other pages touched.
  1. `ChartContainer` now accepts `printMode` + `printWidth` (default 680). When `printMode=true` it bypasses `ResponsiveContainer` and clones the chart child with explicit pixel `width` + `height` — so the SVG is fully laid out in the same tick as the print snapshot.
  2. `ReportsPage` adds a `printing` state, registers `beforeprint`/`afterprint` window listeners (so Ctrl+P / Cmd+P / OS-menu print also reflow correctly), and the print button now follows a 4-step async flow: setPrinting(true) → wait 2× `requestAnimationFrame` → dispatch a `resize` event (belt-and-braces for any other Recharts on the page) → 150 ms timer → `window.print()`. `afterprint` resets `printing` to false.
  3. All 5 chart instances on the Reports page pass `printMode={printing}` (Lead by status, Lead by source, Property pie, Deal revenue trend).
- Preserved: existing page-break CSS, every `print:hidden` rule, CSV export endpoints + buttons, normal on-screen `ResponsiveContainer` rendering (`printMode` defaults to `false`).
- Verified: Playwright print emulation + `page.pdf()` → 4-page A4 PDF with every chart rendering correctly. DOM inspection confirms each `.recharts-surface` SVG has `width=680 height=220` in print mode. Tables (Deals by status, Agents) and metrics cards unchanged. Page-break fixes (Deals + Agents on fresh pages) preserved.

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
  - **Tested**: 17/17 Phase 6 scenarios + 8/8 regression scenarios → 100% pass (`/app/test_reports/iteration_10.json`).

**Phase 6.1: Collapsed Sidebar Icon Contrast Fix** — COMPLETE (2026-05-19)
  - **Tiny CSS-only patch** to `/app/frontend/src/components/layout/Sidebar.tsx`. No structural changes, no logic changes, no other files touched.
  - **Root cause**: in the collapsed (icon-only) state, every inactive nav item inherited `text-muted-foreground` which resolves to `hsl(215 16% 47%)` in light theme — a light grey on the white card background. Without the accompanying label, the icons looked nearly invisible.
  - **Fix**: When collapsed, swap inactive items from `text-muted-foreground` → `text-foreground/75` (~11% lightness × 75% opacity in light theme = a strong, readable near-black; in dark theme it renders as a soft near-white). Three call-sites updated:
    1. `SidebarNavItem.linkClass` — applies only when `collapsed && !isActive`. Expanded mode still uses `text-muted-foreground` because the label itself carries the colour.
    2. Collapsed-state toggle button (`ChevronRight`).
    3. Collapsed-state logout button (`logout-button-collapsed`).
  - **Preserved**:
    - Active-item highlight (`bg-primary text-primary-foreground`) untouched → still the most prominent state.
    - Hover behaviour (`hover:bg-accent hover:text-accent-foreground`) untouched.
    - Width transition, tooltips, persistence, expanded-state styling, mobile drawer — all untouched.
  - **Verified** via screenshots in both light + dark themes with the sidebar collapsed: icons clearly visible in both modes; active route (Leads) keeps its primary-tint pill in collapsed light theme.

**Phase 6.2: Collapsed Sidebar Icon Visibility — REAL Root-Cause Fix** — COMPLETE & VERIFIED (2026-05-19)
  - **Pure CSS/TSX patch** to `/app/frontend/src/components/layout/Sidebar.tsx` only. No backend, no auth, no leads, no follow-ups, no communication, no WhatsApp, no analytics, no CSV, no users, no DB, no architecture changes.
  - **Why Phase 6.1 looked verified but wasn't actually fixing the bug**: Phase 6.1's screenshot verification was eyeballed in a state where the visible icons happened to be the active item's icon (white-on-navy pill) — which always rendered because the active pill is a separate, statically-classed element. The INACTIVE icons looked passable in screenshots taken at low zoom, but in production they were rendering with the inherited default colour (≈ `--primary-foreground` cascading down from the active highlight context, which resolves to near-white in light theme → invisible on the white card).
  - **Actual root cause discovered by DOM inspection** (`getComputedStyle` + reading the raw `class` attribute):
    - `SidebarNavItem` in collapsed mode wraps `<NavLink className={fn}>` inside `<TooltipTrigger asChild>`.
    - Radix's `Slot` (powering `asChild`) merges props from parent → child. For the `className` prop it does a string-concat merge: `[parentClass, childClass].filter(Boolean).join(' ')`.
    - When `childClass` is a FUNCTION (react-router's `NavLink` accepts `className: string | ((args) => string)`), the string-concat call coerces the function to a string via `Function.prototype.toString()`. So the `<a>` element ended up with `class="({ isActive }) => cn(\n    \"group flex items-center ...\")"` — the function's SOURCE CODE as the literal class attribute.
    - NavLink internally then sees `typeof className === 'string'` (since Slot already stringified it before NavLink could call it) and takes the `else` branch — it never invokes the function. Result: **none of the Tailwind classes ever applied** in collapsed mode — neither the active highlight `bg-primary text-primary-foreground`, nor the inactive `text-foreground`, nor the hover state. The icons were styled only by inherited colour from the document tree, which in light theme cascaded to near-white → effectively invisible.
    - Verified by reading `link.getAttribute('class')` on every NavLink in the collapsed sidebar — every one of them had the function source code as its class string.
  - **Fix**:
    - Resolve `isActive` ourselves inside `SidebarNavItem` using react-router's `useResolvedPath(item.href)` + `useMatch({ path, end: false })` hooks.
    - Pass a plain STRING className (computed via `cn(...)`) to `<NavLink>` instead of a function. This sidesteps Slot's stringification entirely — the `class` attribute now contains real Tailwind utilities and the browser applies them as expected.
    - Collapsed inactive icons use the solid `text-foreground` token (`hsl(222 47% 11%)` in light → near-black on white card; `hsl(210 40% 98%)` in dark → near-white on dark card). Expanded mode keeps `text-muted-foreground` because the label itself carries the colour weight.
    - Replaced the leftover `text-foreground/75` on `logout-button-collapsed` with `text-foreground` for the same reason (the Tailwind config defines `foreground: 'hsl(var(--foreground))'` without an `<alpha-value>` placeholder, so the `/75` opacity modifier does not compose correctly anyway).
  - **Preserved**:
    - Active-item highlight (`bg-primary text-primary-foreground`) — verified pill renders with navy `rgb(29, 57, 93)` bg in light, blue `rgb(60, 131, 246)` bg in dark, with light text in both cases.
    - Hover behaviour (`hover:bg-accent hover:text-accent-foreground`) — verified `bg rgb(241, 245, 249)` accent on hover, `text-foreground` colour retained.
    - Width transition, Radix tooltips appearing on hover ("Leads" / "Expand" / "Logout"), localStorage persistence, expanded-state styling, mobile drawer (`MobileSidebar.tsx`), DOM `data-testid`s, `data-collapsed` attribute — all untouched.
    - `useMatch({ end: false })` mirrors react-router's default NavLink matching for the existing routes (`/leads`, `/leads/:id` both highlight Leads; `/communications?leadId=` highlights Communications) — no behavioural change.
  - **Verified** via `getComputedStyle` + screenshots:
    - LIGHT collapsed: Dashboard (active) `color rgb(248,250,252)` on `bg rgb(29,57,93)`; all 10 inactive nav items `color rgb(15,23,41)` on transparent — strong contrast on the white card.
    - DARK collapsed: Dashboard (active) `color rgb(15,23,41)` on `bg rgb(60,131,246)`; all 10 inactive nav items `color rgb(248,250,252)` on transparent — strong contrast on the dark card.
    - Hover on inactive (light): `bg rgb(241,245,249)` accent + `color rgb(15,23,41)` text.
    - Tooltips fire on hover in collapsed mode (verified "Leads" tooltip rendered next to the second icon in screenshot).
    - Expanded sidebar regression check: 1440-wide screenshot shows all 11 nav labels in dark legible text, Dashboard active pill correct.
  - **Files modified (this phase)**: `frontend/src/components/layout/Sidebar.tsx` only.
  - **Files NOT touched**: backend (any), Prisma, auth, leads, follow-ups, communications, WhatsApp, analytics, CSV, users, MainLayout, MobileSidebar, Navbar, nav-items, index.css, tailwind.config.ts.

**Phase 7.0: Lead Pipeline (Kanban Board)** — COMPLETE & VERIFIED (2026-05-19, iteration_11.json)
  - **Pure frontend iteration** — zero backend changes; status updates reuse the existing `PUT /api/leads/:id` endpoint (which already permits an `AGENT` to update leads assigned to them, and an `ADMIN` to update any lead). RBAC is inherited automatically.
  - **New route `/pipeline`** (no role guard — both ADMIN and AGENT see it; AGENT is naturally scoped to own leads because the underlying `/api/leads` is RBAC-scoped). Sidebar nav item **Pipeline** with `Kanban` icon, inserted between **Leads** and **Follow-ups** in the shared `nav-items.ts` (so both desktop Sidebar and MobileSidebar pick it up automatically).
  - **Drag-and-drop library**: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (added via `yarn add`). Works on pointer + keyboard + touch out of the box; ~10KB gz.
  - **Six columns following the existing enum** (column label "Negotiating" for `NEGOTIATING` per spec):
    - `NEW` → "New" (blue accent)
    - `CONTACTED` → "Contacted" (amber)
    - `QUALIFIED` → "Qualified" (violet)
    - `NEGOTIATING` → "Negotiating" (orange)
    - `WON` → "Won" (emerald)
    - `LOST` → "Lost" (slate)
    - Each column shows a count chip (`pipeline-count-{status}`) in the header.
  - **Lead card** (`pipeline-card-{leadId}`) shows:
    - `GripVertical` drag handle (the ONLY drag-initiator; clicking the card body navigates to `/leads/:id`).
    - Full name + truncated `title` for overflow.
    - Source badge with compact labels (Facebook, WhatsApp, Website, Referral, Manual, Portal, Other).
    - Phone with `Phone` icon (skipped if null).
    - Footer: assigned-agent initials avatar + first name (or "Unassigned" italic) + `ReminderBadge` for the soonest PENDING follow-up (Today / Overdue / Pending) — pre-sorted by `followUpDate` ascending so the FIRST entry in a leadId → followUp Map is the soonest.
  - **Drop zone UX**:
    - `useDroppable` per column; while a card is being dragged, the target column gains `ring-2 ring-primary/30` + `bg-primary/5` tint via `isOver`.
    - Inactive columns get a subtle `bg-muted/20` wash to make the target stand out.
    - `DragOverlay` ghost card has `shadow-2xl ring-2 ring-primary/30 rotate-1` for a tactile "lift" feel.
    - Empty columns show "Drop here" while a drag is in progress (otherwise "No leads").
  - **Optimistic update + rollback**:
    - On drop, the card moves locally immediately.
    - `leadsApi.update(id, { status })` fires.
    - On success, the server payload reconciles `assignedAgent` / `updatedAt`.
    - On failure (e.g. AGENT dropping a lead they don't own), the card snaps back to its original column and a `window.alert` surfaces the error.
  - **URL-backed filters** (`?search=&agent=&source=` is the single source of truth — shareable links + browser back/forward work):
    - `pipeline-search-input` — name/phone/email (case-insensitive substring).
    - `pipeline-agent-filter` — populates from `agentsApi.list()`, all agents + "All agents".
    - `pipeline-source-filter` — all 7 `LeadSource` values + "All sources".
    - `pipeline-clear-filters` — single-click reset; only visible when any filter is active.
    - Status is implicit (each column owns its status), so no status filter is exposed here.
  - **Responsive layout**:
    - `pipeline-board` is `flex gap-3 overflow-x-auto` with each column at fixed `w-[280px] sm:w-[300px] shrink-0`. Below `md` the board scrolls horizontally without breaking layout; the filter row uses `flex-wrap`.
    - Card grip icon is touch-friendly (full p-1 hit area).
  - **Mobile drawer + desktop sidebar both expose `nav-pipeline` / `mobile-nav-pipeline` automatically** via the shared nav source.
  - **Tested**: 100% pass on `/app/test_reports/iteration_11.json`. Verified: admin + agent login, both roles access `/pipeline` (AGENT scoped to own leads — 2 cards visible vs 9 for ADMIN), all 6 columns render with counts (NEW:2, CONTACTED:3, QUALIFIED:2, NEGOTIATING:1, WON:1, LOST:0 in fresh fixture), card content (name + source badge + phone + agent avatar + follow-up reminder badge), card-click navigates to `/leads/:id` while grip handle does NOT, drag handle → drop fires PUT 200 with counts updating optimistically (NEW 2→1, CONTACTED 3→4), URL state syncs on filter changes + refresh restores, clear-filters resets, drop-zone highlight wiring, DragOverlay ghost, mobile 390×844 board scroll, sidebar order, mobile drawer order.
  - **Known soft notes** (not blocking, captured for backlog):
    - Source badge says "Portal" while the dropdown shows "Property Portal" — intentional for badge compactness.
    - `window.alert` used for rollback notification; can be upgraded to sonner/toast later.
    - 500-lead fetch is unpaginated — fine for current scale, consider virtualization beyond ~500 leads/tenant.

**Phase 8.0: Properties Module + Cloudinary Image Uploads** — COMPLETE (2026-05-19)
  - **Scope**: Real Property model on Neon Postgres + full CRUD + search/filters + Cloudinary multi-image direct upload + ADMIN/AGENT ownership RBAC + Matching Leads sidebar.
  - **Zero changes** to auth, leads, follow-ups, communication, WhatsApp, analytics, CSV import/export, user management, pipeline, database config or architecture. New module is purely additive.
  - **New Prisma migration**: `20260519200643_add_property_model` adds:
    - Model `Property` (id, title, propertyType, location, city, price `Decimal(15,2)`, area `Float`, areaUnit `AreaUnit`, bedrooms `Int?`, bathrooms `Int?`, status `PropertyStatus`, description `Text?`, images `String[]`, ownerAgentId FK → User, createdAt/updatedAt). Indexes on `(status, createdAt)`, `(city)`, `(propertyType)`, `(ownerAgentId)`.
    - Enum `PropertyStatus`: `AVAILABLE | SOLD | RESERVED` (default `AVAILABLE`).
    - Enum `AreaUnit`: `SQFT | SQM` (default `SQFT`).
    - `User.properties` back-relation `@relation("PropertyOwnerAgent")` so `prisma.user.properties` works for future agent dashboards.
  - **Cloudinary integration** (real, end-to-end, no mocks):
    - `cloudinary@2.10.0` npm package + env vars `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_FOLDER=properties` added to `/app/backend/.env`. `API_SECRET` never leaves the backend.
    - `services/cloudinary.service.ts` — singleton config + `signUpload(folder)` returns `{signature, timestamp, cloudName, apiKey, folder, uploadUrl}`. Folder is validated against an allow-list (`properties/`) so a leaked signature can't upload outside the bucket.
    - `controllers/upload.controller.ts` + `routes/upload.routes.ts` mount `GET /api/uploads/cloudinary-signature?folder=properties` (JWT-authenticated only). Verified live — admin token returns a valid signature payload from Cloudinary cloud `dd61mc8me`.
    - `publicIdFromUrl(url)` + `deleteAssetByUrl(url)` clean up Cloudinary assets when a Property is deleted (best-effort — DB delete is the source of truth and is never rolled back by a Cloudinary failure).
    - Frontend `services/properties.ts → uploadImageToCloudinary(file, onProgress)` uses `XMLHttpRequest` (for progress events) to POST directly to `api.cloudinary.com`, then returns the `secure_url` which the form appends to `Property.images[]`. Only URLs are persisted in Postgres.
    - Display URLs are passed through `buildCloudinaryUrl(url, {width, crop})` which inserts `q_auto,f_auto,w_<n>,c_fill` — Cloudinary serves an automatically size- and format-optimized variant.
  - **Backend API surface** (all JWT-protected, `/api/properties/*`):
    - `GET    /api/properties`                  list w/ pagination + filters (search, propertyType, city, status, minPrice, maxPrice, ownerAgentId, sortBy, sortOrder). Search is a case-insensitive substring across `title|location|city|description`. Both ADMIN and AGENT see all properties.
    - `POST   /api/properties`                  create. Required: `title, propertyType, location, city, price>0, area>0`. AGENT's listing is auto-owned by themselves (cannot override). ADMIN may override `ownerAgentId` (defaults to admin's own id when omitted).
    - `GET    /api/properties/:id`              fetch one (includes ownerAgent).
    - `PUT    /api/properties/:id`              partial update. ADMIN edits any; AGENT only own (403 otherwise). AGENT cannot change `ownerAgentId` via PUT.
    - `DELETE /api/properties/:id`              ADMIN any; AGENT only own. Cleans up Cloudinary assets after the DB row is removed.
    - `PATCH  /api/properties/:id/assign`       ADMIN only — reassign owner.
    - `GET    /api/properties/:id/matching-leads` read-only suggestions. SQL OR across: lead.preferredLocation contains property.location/city, lead.propertyType matches, lead.budget >= property.price. AGENT scope: only their assigned leads.  Excludes `WON|LOST` leads. Scored & sorted by relevance, max 25 rows. Includes the lead's soonest PENDING follow-up.
  - **RBAC** (mirrors the Lead module pattern):
    - ADMIN: full CRUD on any property, can assign owners, sees every match.
    - AGENT: create their own, edit/delete only own (403 otherwise), can never reassign via PUT, only sees their own assigned leads in the matching-leads sidebar.
  - **Frontend pages / routes**:
    - `/properties` — `PropertiesPage` with header, grid/list view toggle (`view-grid-button` / `view-list-button`, persisted in localStorage `properties:view`), sticky filter sidebar (`property-filters-panel` w/ search, type, city, status, min/max price), responsive grid (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`) of `PropertyCard`s, list view rendered as `PropertyListRow`s, pagination, skeleton + empty states, "Add Property" CTA visible to both roles.
    - `/properties/:id` — `PropertyDetailPage` with back button, role-gated Edit/Delete buttons (`canManage` = admin OR ownerAgent), `PropertyImageGallery` (hero + thumbs + prev/next controls + counter), price + area headline, 4-up stat tiles (bedrooms / bathrooms / area / listed date), owner-agent line, multi-line description, right-rail `MatchingLeadsSidebar` (reuses `StatusBadge` from Lead module — read-only suggestions with phone/budget/location/agent + quick "Open WhatsApp" + "Open lead" actions; deep-links to `/leads/:id` and `/communications?leadId=:id`), plus a metadata card (Updated / ID).
  - **Components added** (`/app/frontend/src/components/properties/`):
    - `PropertyStatusBadge.tsx` — colour-coded badge for AVAILABLE / RESERVED / SOLD.
    - `PropertyImageUploader.tsx` — drag-and-drop multi-file Cloudinary uploader. Per-file blob preview, XHR progress bar, per-file error card with dismiss, client-side validation (image/*, ≤ 8 MB, ≤ 10 files), remove uploaded URL with `remove-image-button`, fully controlled (parent owns `images: string[]`).
    - `PropertyImageGallery.tsx` — detail-page gallery with hero (`property-gallery-hero`), thumbnail strip (`property-gallery-thumb-{i}`), prev/next nav, `1 / N` counter, graceful no-image fallback.
    - `PropertyCard.tsx` + `PropertyListRow.tsx` — two render flavours sharing `formatPrice`, `formatArea`, `buildCloudinaryUrl` from `lib/property-format.ts`.
    - `PropertyFormModal.tsx` — Add/Edit dialog. Fields: title, propertyType (6 options), status, location, city, price, area + areaUnit (SQFT/SQM), bedrooms, bathrooms, images (uploader), ownerAgent (admin-only dropdown via `agentsApi.list()`), description. Surface 403s and validation errors via `extractApiError`.
    - `PropertyFiltersPanel.tsx` — sticky sidebar w/ `EMPTY_FILTERS` constant + dirty-state "Clear filters" pill.
    - `MatchingLeadsSidebar.tsx` — reuses Lead `StatusBadge`, lists up to 25 sorted matches with quick-message + open-lead actions.
  - **Cloudinary cloud used**: `dd61mc8me` (user-provided). Verified end-to-end — admin login → `GET /api/uploads/cloudinary-signature?folder=properties` returns a signed payload; the browser uploader then POSTs directly to `https://api.cloudinary.com/v1_1/dd61mc8me/image/upload` and stores `secure_url` in `Property.images[]`.
  - **Files modified / added**:
    - Modified: `backend/.env`, `backend/prisma/schema.prisma`, `backend/src/index.ts`, `frontend/src/App.tsx`, `frontend/src/types/index.ts`.
    - Added (backend): `services/cloudinary.service.ts`, `services/property.service.ts`, `controllers/property.controller.ts`, `controllers/upload.controller.ts`, `routes/property.routes.ts`, `routes/upload.routes.ts`, migration `20260519200643_add_property_model/`.
    - Added (frontend): `services/properties.ts`, `lib/property-format.ts`, `pages/PropertiesPage.tsx`, `pages/PropertyDetailPage.tsx`, plus the 7 components under `components/properties/`.
    - `nav-items.ts` already contained the `Properties` entry from Phase 6.0 — no change needed.
  - **Files NOT touched**: auth (any), leads (any), follow-ups (any), communications (any), WhatsApp routes/service (any), analytics (any), CSV import/export (any), users management (any), pipeline (any), MainLayout, Navbar, Sidebar, MobileSidebar, nav-items, DB config (only an additive migration).
  - **Live smoke test** (admin token):
    ```
    POST /api/properties → 201 (Sea-facing 3BHK, Bandra West, Mumbai, ₹3.5Cr, 1500 SQFT, Apartment, AVAILABLE, owned by admin)
    GET  /api/properties → 1 property
    GET  /api/uploads/cloudinary-signature?folder=properties → {signature, timestamp, cloudName: "dd61mc8me", apiKey, uploadUrl}
    ```
  - **UI verified** via screenshots at 1440x900 (light theme):
    - `/properties` lists the seeded card with Available badge, type chip "Apartment", location "Bandra West, Mumbai", 3 beds · 3 baths · 1500 SQFT, ₹3.50 Cr, owner "Admin", grid/list toggle visible, "Add Property" button visible, filter sidebar with all 5 controls.
    - `/properties/:id` shows back button, Edit + Delete buttons (admin), "No images uploaded" gallery placeholder, title + Available status dot, ₹3.50 Cr · 1500 SQFT headline, "Matching Leads · Finding matches…" sidebar, metadata card.
    - "Add New Property" modal renders every field including the image dropzone "Drop images here or click to upload · 0/10 added".

**Phase 9.0: Clients Module + Merged Activity Timeline** — COMPLETE (2026-05-19)
  - **Scope**: Real `Client` model on Neon Postgres + full CRUD + search + agent/linkage filters + merged activity timeline (native client lifecycle events PLUS, when a lead is linked, the lead's communications + follow-ups + Activity feed entries). Ownership RBAC mirrors Leads and Properties exactly.
  - **Zero changes** to auth, leads, follow-ups, communication, WhatsApp, analytics, CSV import/export, user management, pipeline, properties, DB configuration, or architecture. Purely additive — two new tables and a new router. Existing services and tables are read-only consumers of `linkedLeadId`.
  - **New Prisma migration**: `20260519203534_add_client_model` adds:
    - Model `Client` (id, fullName, phone, email, budget `Decimal(15,2)`, preferredLocation, notes `Text`, `linkedLeadId` FK → `Lead` with `onDelete: SetNull` so deleting a lead never cascades into client loss, `assignedAgentId` FK → `User`, createdAt, updatedAt). Indexes on `(assignedAgentId, createdAt)` and `(linkedLeadId)` for the two hot query paths (agent dashboards + reverse lookup from a lead).
    - Model `ClientActivity` (id, clientId FK cascade, userId FK to acting user, action string, description Text, metadata Json, createdAt). Indexed on `(clientId, createdAt)`. Lives in its own table so the Communication module's `Activity` table is untouched.
    - Back-relations `User.clients`, `User.clientActivities`, `Lead.clients` (one-to-many: a lead can have zero-or-many clients per user choice).
  - **Backend API surface** (all JWT-protected, `/api/clients/*`):
    - `GET    /api/clients`               list with pagination + filters (search across fullName/phone/email/preferredLocation, assignedAgentId, linkedLeadId — `'NONE'` filters for unlinked clients, sortBy/sortOrder). RBAC scope: `buildClientScope(userId, role)` injects `assignedAgentId = userId` automatically for AGENT — same shape as Lead's scope helper.
    - `POST   /api/clients`               create. `fullName` is required. AGENT auto-owns; ADMIN may pick `assignedAgentId` or leave unassigned. Auto-logs `CREATED`, plus `LINKED_LEAD` when `linkedLeadId` provided.
    - `GET    /api/clients/:id`           fetch one. AGENT sees only own assigned (403 otherwise).
    - `PUT    /api/clients/:id`           partial update. ADMIN any; AGENT own only; AGENT cannot change `assignedAgentId`. Auto-logs deltas as semantically-typed lifecycle events: `LINKED_LEAD | UNLINKED_LEAD | AGENT_ASSIGNED | AGENT_UNASSIGNED | NOTES_UPDATED | UPDATED`.
    - `DELETE /api/clients/:id`           ADMIN any; AGENT own only. Cascade removes `client_activities`.
    - `PATCH  /api/clients/:id/assign`    ADMIN only — reassign agent + auto-log `AGENT_ASSIGNED` / `AGENT_UNASSIGNED`.
    - `GET    /api/clients/:id/timeline`  read-only merged feed. Pulls (a) ClientActivity rows, plus when `linkedLeadId` is set: (b) Communications (WhatsApp + Calls with type + direction + message preview), (c) FollowUps (status + date + notes preview), (d) Activity rows tagged to that lead. Items get a stable `source-prefixed` id (`client:`, `comm:`, `fu:`, `lact:`), are sorted newest-first, capped to 200.
  - **Files added (backend)**:
    - `services/client.service.ts` — `buildClientScope`, `listClients`, `getClientById`, `createClient`, `updateClient`, `deleteClient`, `logClientActivity` (best-effort; never throws). Decimal → number conversion in `toDto`.
    - `services/client-timeline.service.ts` — `buildClientTimeline(clientId)` reads 4 sources, normalizes to `TimelineItem`, sorts, slices.
    - `controllers/client.controller.ts` — all 7 handlers with RBAC + automatic lifecycle logging.
    - `routes/client.routes.ts` — wires the 7 endpoints, `requireRole('ADMIN')` only on `/assign`.
    - `index.ts` — adds `app.use('/api/clients', clientRouter)`.
  - **Frontend routes + pages**:
    - `/clients` — `ClientsPage` with grid/list toggle (persisted in localStorage `clients:view`), search input (debounced 400 ms), admin-only agent filter (uses existing `agentsApi.list()`), linkage filter `Any | With linked lead | Without linked lead` (server filter `linkedLeadId=NONE` + client-side filter for the "with linked lead" case to avoid an extra backend boolean column), pagination, skeleton + empty states.
    - `/clients/:id` — `ClientDetailPage` with avatar header, budget headline, 6-field profile grid (phone / email / budget / agent / linked lead / created), `notes` block, `ClientActivityTimeline` (merged feed, source-coloured icons, actor + relative time, empty-state copy), right rail with Quick info (updated, id) and an "Open lead" card when a linked lead exists. Edit/Delete buttons RBAC-gated. Message button only enabled when a lead is linked (deep-links to `/communications?leadId=`).
  - **Components added (`/app/frontend/src/components/clients/`)**:
    - `ClientCard.tsx` — grid card with avatar initial, name, location, budget, phone, email, agent, optional linked-lead chip (reuses existing `StatusBadge`).
    - `ClientListRow.tsx` — dense single-row list variant with the same data.
    - `ClientFormModal.tsx` — create/edit dialog. Searchable linked-lead picker (debounced lead query → `leadsApi.list`). Admin-only assigned-agent select. Validates `fullName` is non-empty. Surfaces 400/403 via `extractApiError`.
    - `ClientActivityTimeline.tsx` — vertical timeline with source-specific icons (CircleUserRound / MessageSquare / CalendarClock / Activity), source pill, actor + locale-formatted timestamp, empty state copy that adapts based on `hasLinkedLead`.
  - **Types added** (`frontend/src/types/index.ts`): `Client`, `ClientsResponse`, `CreateClientData`, `UpdateClientData`, `ClientTimelineSource`, `ClientTimelineItem`.
  - **Frontend service** (`services/clients.ts`): `clientsApi.list/get/create/update/delete/assign/timeline`.
  - **App routing** (`App.tsx`): added `/clients` and `/clients/:id` under the protected `MainLayout`. The "Clients" sidebar nav entry was already present from Phase 6.0, so no `nav-items.ts` change was needed.
  - **Files NOT touched**: backend auth/leads/follow-ups/communications/whatsapp/analytics/csv/users/pipeline/properties files (any); MainLayout, Navbar, Sidebar, MobileSidebar, nav-items; `frontend/src/services/api.ts`, `services/leads.ts`, `services/communications.ts`, `services/whatsapp.ts`, `services/properties.ts`, `services/analytics.ts`. The only existing files modified are `prisma/schema.prisma` (3 additive lines on `User`, 1 line on `Lead`, plus new `Client` + `ClientActivity` models), `backend/src/index.ts` (2 lines to wire the router), `frontend/src/types/index.ts` (additive types), and `frontend/src/App.tsx` (2 route lines).
  - **Live smoke test** (admin token, localhost):
    ```
    POST /api/clients   {fullName:"Vivek Kumar", phone:"+91 98765 11111", email:"vivek@…", budget:8500000, preferredLocation:"Powai, Mumbai", notes:"Looking for 3BHK near tech park"} → 201 (auto-owned by admin)
    GET  /api/clients                     → 1 client
    GET  /api/clients/:id/timeline        → 1 item {source:"CLIENT", action:"CREATED", description:"Client \"Vivek Kumar\" created", actor:"Admin"}
    ```
  - **UI verified** via screenshots at 1440x900 (light theme):
    - `/clients` lists the card with avatar "V", name, location chip, ₹85.00 L, phone, email, "Admin" owner badge. Grid/List toggle, "Add Client" CTA, search input + agent filter + link-state filter visible.
    - `/clients/:id` shows back button, Message/Edit/Delete actions, profile card with budget headline, 6-field grid (phone, email, budget, agent, linked lead "Not linked", created), notes block, and the Activity timeline rendering the single CREATED event "Client \"Vivek Kumar\" created · by Admin" with timestamp + source pill.
    - "Add New Client" modal renders every field including the searchable linked-lead picker and admin-only Assigned Agent dropdown.

**Phase 10.0: Deals Module — Phase-1 (List, Filters, CRUD; no Kanban / no timeline yet)** — COMPLETE (2026-05-20)
  - **Scope**: Real `Deal` model on Neon Postgres + full CRUD + search + filter by status & assigned agent. Frontend = single `/deals` page with grid/list toggle and inline-action cards. Phase-1 explicitly excludes Kanban and the per-deal timeline (deferred to Phase 10.5/11.0).
  - **Zero changes** to auth, leads, follow-ups, communications, WhatsApp, analytics, CSV, users, pipeline, properties, clients, DB config, or architecture. Purely additive — one new table, one router, one page.
  - **New Prisma migration**: `20260520071120_add_deal_model` adds:
    - Model `Deal` (id, title, propertyId FK → Property `onDelete: Restrict`, clientId FK → Client `onDelete: Restrict`, assignedAgentId FK → User REQUIRED, amount `Decimal(15,2)`, expectedClosingDate `DateTime?`, status `DealStatus @default(NEW)`, notes `Text?`, createdAt, updatedAt). Indexed on `(status, createdAt)`, `(assignedAgentId)`, `(propertyId)`, `(clientId)`.
    - Enum `DealStatus`: `NEW | NEGOTIATION | DOCUMENTATION | PAYMENT_PENDING | WON | LOST`.
    - `Restrict` on Property + Client FKs is deliberate: deleting a property/client that has a live deal must fail loudly rather than silently zombify the deal. Force the user to close out / delete the deal first.
    - Back-relations `User.deals`, `Property.deals`, `Client.deals`.
  - **Backend API surface** (all JWT-protected, `/api/deals/*`):
    - `GET    /api/deals`           list + pagination + search (title / notes / property.title / property.city / client.fullName / client.phone) + filter by `status` + filter by `assignedAgentId` + sortBy/sortOrder. Result `{deals, total, page, limit, pages}` with each deal embedding its `property` (id/title/city/location/price/images/status), `client` (id/fullName/phone/email), and `assignedAgent` (id/name/email/role). RBAC scope: AGENT auto-restricted to own; ADMIN unrestricted.
    - `POST   /api/deals`           create. Required: `title, propertyId, clientId, amount > 0`. AGENT auto-owns; ADMIN may pick `assignedAgentId` or leave omitted (defaults to admin's id — the schema requires the column to be non-null since every deal must have someone responsible for it). Foreign-key violations return `400 "Invalid property, client or agent reference"`.
    - `GET    /api/deals/:id`       fetch one. AGENT 403 on a deal they don't own.
    - `PUT    /api/deals/:id`       partial update. ADMIN any; AGENT only own; AGENT cannot change `assignedAgentId` via PUT (only an admin can reassign, mirroring the Lead/Client pattern).
    - `DELETE /api/deals/:id`       ADMIN any; AGENT only own. 204.
  - **Files added (backend)**:
    - `services/deal.service.ts` — `buildDealScope`, `listDeals`, `getDealById`, `createDeal`, `updateDeal`, `deleteDeal`. `toDto` converts both the deal's `amount` and the embedded `property.price` Decimals → numbers.
    - `controllers/deal.controller.ts` — full RBAC + `validateRequired` + explicit P2003/P2025 mapping to clean 400/404 errors.
    - `routes/deal.routes.ts` — wires the 5 endpoints. No `/assign` endpoint in Phase-1: ADMIN reassigns via the regular PUT body. (Easy to add `PATCH /:id/assign` later if needed.)
    - `index.ts` — adds `app.use('/api/deals', dealRouter)`.
  - **Frontend route + page**:
    - `/deals` — `DealsPage` (no detail page in Phase-1 per spec). Header w/ Grid/List toggle (persisted in `localStorage.deals:view`), Add Deal button. Filter bar w/ search (debounced 400 ms), status select (NEW/NEGOTIATION/DOCUMENTATION/PAYMENT_PENDING/WON/LOST), admin-only Agent filter, Clear button when dirty.
    - Grid mode renders `DealCard`s in a 1 → 2 → 3-col responsive grid: cover image (the property's first Cloudinary thumb at `w_480,c_fill`), `DealStatusBadge` overlay, title, big ₹ amount, client + property + closing-date lines, agent name + inline Edit/Trash buttons (RBAC-gated to ADMIN or the owning AGENT).
    - List mode renders `DealListRow`s — denser, same data, no cover image.
    - Skeleton, empty, and "no filter match" empty states. Pagination at the bottom when `pages > 1`.
  - **Components added (`/app/frontend/src/components/deals/`)**:
    - `DealStatusBadge.tsx` — 6-colour status chip (sky / amber / violet / orange / emerald / rose) with optional dot.
    - `DealCard.tsx` — grid card with cover image + amount headline + client/property/closing lines + inline Edit/Delete (RBAC-gated via `useAuth`). Reuses `buildCloudinaryUrl` from the Properties module.
    - `DealListRow.tsx` — dense single-line variant with the same data.
    - `DealFormModal.tsx` — create/edit dialog. Searchable client picker (debounced → `clientsApi.list`), searchable property picker (debounced → `propertiesApi.list`), amount, status, expectedClosingDate (HTML `<input type=date>`, value reduced to `YYYY-MM-DD`), admin-only `assignedAgentId` select (defaults to "Defaults to me"), notes. Inline validation surfaces clean error text via `extractApiError`.
  - **Types added** (`frontend/src/types/index.ts`): `DealStatus`, `Deal`, `DealsResponse`, `CreateDealData`, `UpdateDealData`.
  - **Frontend service** (`services/deals.ts`): `dealsApi.list/get/create/update/delete`.
  - **App routing** (`App.tsx`): added `/deals` under the protected `MainLayout`. The "Deals" sidebar nav entry was already in `nav-items.ts` from Phase 6.0, so no nav change was needed.
  - **Files NOT touched**: backend auth/leads/follow-ups/communications/whatsapp/analytics/csv/users/pipeline/properties/clients files (any); MainLayout, Navbar, Sidebar, MobileSidebar, nav-items; existing services for leads, communications, whatsapp, properties, clients, analytics. Only existing files modified: `prisma/schema.prisma` (1-line back-relation each on `User`, `Property`, `Client`, plus the new `Deal` model and `DealStatus` enum), `backend/src/index.ts` (2 lines to wire the router), `frontend/src/types/index.ts` (additive types), `frontend/src/App.tsx` (1 route line).
  - **Live smoke test** (admin token, localhost):
    ```
    POST /api/deals  {title:"Vivek - Bandra 3BHK", propertyId, clientId, amount:35000000, expectedClosingDate:"2026-08-15", status:"NEGOTIATION", notes:"…"} → 201 with embedded property + client + assignedAgent (admin auto-owned)
    GET  /api/deals  → 1 deal
    ```
  - **UI verified** via screenshots at 1440x900 (light theme):
    - `/deals` lists the deal card showing property cover image, "Negotiation" status pill, title "Vivek - Bandra 3BHK", ₹3.50 Cr amount, client name + phone, property + city, "Closing 15 Aug 2026", agent "Admin", and the inline Edit + Trash icon buttons.
    - "Add New Deal" modal renders every field — Title, searchable Client picker, searchable Property picker, Amount, Status (default New), Expected Closing Date, admin-only Assigned Agent (Defaults to me), Notes.

**Phase 10.0 Verification — COMPLETE & VERIFIED (2026-05-20, iteration_15.json)**
  - **Resumed from prior session** that expired during report generation. Backend tests (24/24 pytest) and AGENT RBAC for Deals (no agent filter visible, no Assigned Agent select in modal, no admin-owned deals visible to agent, empty state rendered correctly) were already confirmed in iteration_14 and were not re-run.
  - **Environment restore performed this session** (container was reset): `yarn install` in `/app/backend`, `npx prisma generate`, `npx prisma migrate deploy` (9 migrations — no pending), supervisor program `node_backend` recreated at `/etc/supervisor/conf.d/supervisord_node_backend.conf` (port 8002). `/api/health` returns 200 via both 8002 direct and the FastAPI proxy on 8001. Admin login returns a valid JWT.
  - **Frontend verification (ADMIN side, Deals Phase-1)** — 100% PASS:
    - `/deals` mounts with every documented testid: `deals-page`, `add-deal-button`, `deals-search-input`, `deals-status-filter`, `deals-agent-filter` (admin-only filter visible), `deals-view-toggle`, `deals-grid`.
    - Add Deal modal renders all 9 fields including the ADMIN-only `deal-agent-select`; inline validation "Title is required" fires via `[data-testid=deal-form-error]` on empty submit.
    - Status filter exposes all 6 statuses (New, Negotiation, Documentation, Payment Pending, Won, Lost) + "All status".
    - Grid/list view toggle persists `localStorage.deals:view`.
  - **Regression smoke (100% PASS)** across:
    - **Leads** — `/leads` mounts, search/filters render, Import (admin-only) + Export buttons visible.
    - **Clients** — `/clients` mounts, `clients-agent-filter` (admin-only) + `add-client-button` visible.
    - **Properties** — `/properties` mounts, grid/list toggle + `add-property-button` visible.
    - **Follow-ups** — `/followups` mounts, `add-followup-button` visible.
    - **Communications** — `/communications` mounts with inbox sidebar (3 conversations), `chat-panel` composer, 5 quick-reply chips, "Use template" + "Log a call" buttons.
    - **Analytics / Dashboard** — `/dashboard` renders 109 data-testids with live data: `date-range-filter` (today/7d/30d/custom), 4 communication stat cards, lead-funnel chart, leads-by-status chart, leads-by-source chart, follow-up completion donut (50%), agent-performance-grid (7 agent cards). Totals: 9 leads, 11.11% conversion.
    - **Mobile responsive nav (390×844)** — `mobile-menu-button` hamburger visible on dashboard. Desktop sidebar at 1440px shows all nav entries including `nav-deals`.
  - **Non-blocking observations** (NOT fixed — outside scope of "no impl changes unless blocking"):
    - `export-analytics-button` currently renders as a single button rather than a 6-option dropdown described in Phase 5.0. Page renders cleanly; CSV export endpoints exist server-side (`/api/analytics/export/*`).
    - Frontend issues silent 404s on stale analytics route names (`/agent-performance`, `/followup-completion`, `/communication-stats`, `/lead-funnel`, `/agent-stats`, `/export`). Page degrades gracefully because charts consume working endpoints (`/overview`, `/leads-by-status`, `/leads-by-source`, `/agents`).
  - **Files modified this session**: none (no implementation files touched; this state-file update only).
  - **Phase 10.0 final status: COMPLETE.** No further work required.

**Phase 10.1: Deals Phase-2 — Kanban Board + Detail Page + Activity Timeline** — COMPLETE (2026-05-20)
  - **Scope**: A new Kanban board for deals (`/deals/board`) backed by drag-and-drop with the same UX as the Lead Pipeline; a new Deal detail page (`/deals/:id`) with a property card, a client card, an assigned-agent block, status history and a full lifecycle activity timeline; and a backend `DealActivity` table that auto-logs every meaningful change to a deal.
  - **Zero changes** to auth, leads, follow-ups, communications, WhatsApp, analytics, CSV import/export, users, pipeline, properties, clients, deal Phase-1 list page, database configuration, or architecture. Purely additive — one new table, one new backend service, one new controller endpoint pair, two new pages, three new components.
  - **New Prisma migration**: `20260520080309_add_deal_activity_model` adds:
    - Model `DealActivity` (id `cuid`, dealId FK → `Deal` `onDelete: Cascade`, userId FK → `User` (nullable so a deleted/system actor never breaks the timeline), eventType `String`, notes `String?` `@db.Text`, createdAt). Indexed on `(dealId, createdAt)` so the timeline query is a clean B-tree range scan.
    - Back-relations `Deal.activities` (`@relation("DealToActivities")`) and `User.dealActivities` (`@relation("DealActivityActor")`).
    - `eventType` values emitted by the backend: `CREATED | STATUS_CHANGED | AMOUNT_UPDATED | AGENT_REASSIGNED | NOTES_UPDATED`. `notes` carries the human-readable description (e.g. `"Status changed from NEW to NEGOTIATION"`, `"Amount updated from ₹50.00 L to ₹50.01 L"`).
  - **Backend API surface** (all JWT-protected, mounted BEFORE `/:id` so route-segment ordering is correct):
    - `GET /api/deals/:id/timeline`      RBAC-scoped read-only feed (ADMIN any deal, AGENT only own). Returns `{items: DealTimelineItem[]}` sorted newest-first, capped to 200. Each item: `{id, source:'DEAL', eventType, notes, createdAt, actor:{id,name}|null}`.
    - `GET /api/deals/:id/activities`    alias of `/timeline` (the spec called them out separately). Same RBAC, same payload — serving once via a thin wrapper keeps the schema in lock-step.
  - **Auto-logging** is wired into `deal.controller.ts`. Every write fires one or more lifecycle events through `dealService.logDealActivity` — failures are swallowed so the parent write is never rolled back by an activity-log glitch (matches the Client module pattern).
    - `addDeal`   → emits `CREATED` with notes `Deal "<title>" created with status <STATUS> for ₹<amount>`.
    - `editDeal`  → diffs the pre-update snapshot against the persisted row via `collectLifecycleEvents`. A single PUT can emit MULTIPLE distinct events when an admin changes status, amount, agent and notes in one call. Cosmetic-only edits (title / closing date / property / client) are intentionally NOT logged so the timeline stays focused on the events the user asked for.
    - `removeDeal` is left clean — the parent `DealActivity` rows are cascade-deleted by the FK, so logging on delete would be a dangling event.
  - **Files added (backend)**:
    - `services/deal-timeline.service.ts` — `buildDealTimeline(dealId)`. Reads `deal_activities`, joins the acting user (`{id,name}`), formats ISO timestamps, returns the canonical `DealTimelineItem` shape.
    - `controllers/deal.controller.ts` — added `formatAmount`, `collectLifecycleEvents`, `getDealTimelineHandler`, `getDealActivitiesHandler`; instrumented `addDeal` + `editDeal` with auto-logging.
    - `services/deal.service.ts` — added `logDealActivity` helper (mirrors `logClientActivity`).
    - `routes/deal.routes.ts` — wires the two new GET endpoints before `/:id`.
  - **Frontend additions** (no nav-items change — Deals already had a sidebar entry, the Board is reachable via a Board button on `/deals`):
    - Route `/deals/board` → `DealBoardPage` — Kanban with 6 columns (NEW, NEGOTIATION, DOCUMENTATION, PAYMENT_PENDING, WON, LOST), `@dnd-kit` drag-and-drop, optimistic update with rollback on failure, URL-backed `?search=&agent=` filters, drop-zone highlight via `useDroppable.isOver`, `DragOverlay` ghost. Visual / interaction parity with the Lead `PipelinePage`.
    - Route `/deals/:id` → `DealDetailPage` — headline (title + status pill + amount), 3-up stat tiles (expected closing / assigned agent / created), notes block, full `DealTimeline`, right sidebar with `deal-property-card` (cover image + "Open property" deep-link), `deal-client-card` (phone/email + "Open client" deep-link), and `deal-meta-card` containing a "Recent status history" trail derived from STATUS_CHANGED + CREATED events.
    - Components: `DealBoardCard.tsx`, `DealBoardColumn.tsx`, `DealTimeline.tsx`. Lead `LeadCard` / `PipelineColumn` were not reused directly because the deal card surface is meaningfully different (amount headline + property cover thumb + client name), but the drag/drop wiring is byte-for-byte the same.
    - `DealCard.tsx` + `DealListRow.tsx` made clickable (the whole card navigates to `/deals/:id`, the inline Edit / Delete buttons keep working because we ignore clicks that bubbled from a `<button>`).
    - "Board" button added to `DealsPage` header (`open-deal-board-button`) — single click switches view.
    - `services/deals.ts` — added `timeline(id)` and `activities(id)` methods.
    - Types: `DealEventType`, `DealTimelineItem` added to `frontend/src/types/index.ts`.
    - `App.tsx` — registered `/deals/board` and `/deals/:id` under the protected layout.
  - **Files NOT touched**: backend auth/leads/follow-ups/communications/whatsapp/analytics/csv/users/pipeline/properties/clients (any); MainLayout, Navbar, Sidebar, MobileSidebar, nav-items; existing services for leads/communications/whatsapp/properties/clients/analytics. The only existing files modified are `prisma/schema.prisma` (one back-relation on `User`, one on `Deal`, plus the new `DealActivity` model), `backend/src/services/deal.service.ts` (added one helper at the bottom), `backend/src/controllers/deal.controller.ts` (added auto-logging into existing create/update handlers + two new GET handlers + helpers), `backend/src/routes/deal.routes.ts` (added two GETs), `frontend/src/types/index.ts` (additive types), `frontend/src/services/deals.ts` (two new methods), `frontend/src/App.tsx` (two route lines), `frontend/src/pages/DealsPage.tsx` (Board button + useNavigate), `frontend/src/components/deals/DealCard.tsx` and `frontend/src/components/deals/DealListRow.tsx` (made clickable).
  - **Live smoke test** (admin token):
    ```
    PUT  /api/deals/<id>  {amount: 5001000, status:"DOCUMENTATION", notes:"updated"}
      → 200 (deal updated)
    GET  /api/deals/<id>/timeline
      → 3 events: STATUS_CHANGED (WON→DOCUMENTATION), AMOUNT_UPDATED (₹50.00 L → ₹50.01 L), NOTES_UPDATED — all with actor "Admin"
    ```
  - **UI verified** via screenshots at 1440x900 (light theme):
    - `/deals/board` shows 6 Kanban columns with the correct accent colours, counts per column (`deal-board-count-NEW…LOST`), cards with grip handle + amount + client + property + agent avatar + closing date. Filters (search + admin-only Agent dropdown) render.
    - `/deals/:id` shows the title "TEST", Documentation status pill, ₹50.01 L headline, expected closing / assigned agent / created stat tiles, Notes block, Activity timeline with 3 events ("Notes updated · by Admin", "Amount updated · Amount updated from ₹50.00 L to ₹50.01 L · by Admin", "Status changed · Status changed from WON to DOCUMENTATION · by Admin"), Property card with cover image + "Open property", Client card with phone + email + "Open client", and Deal info sidebar with a Recent status history list.
  - **Phase 10.1 status: COMPLETE.**

**Phase 11.0: Reports Module (ADMIN-only) + Lightweight Notifications** — COMPLETE (2026-05-20)
  - **Scope**: Tenant-wide ADMIN-only Reports page at `/reports` covering five sections (Leads / Properties / Clients / Deals / Agents) backed by a new `/api/reports/*` router, plus a lightweight notifications system replacing the previously-decorative navbar bell. Both ship in this phase because they share data sources and the same "no new tables / no jobs / no microservices" constraint.
  - **Zero changes** to auth, leads, follow-ups, communications, WhatsApp, analytics, CSV import/export, users, pipeline, properties, clients, deals (Phase-1 + 2), database configuration, or architecture. Purely additive — three new backend route files, two new services, two new controllers, one new admin page, one navbar dropdown component.
  - **No new DB tables / no migrations / no new dependencies.** Notifications and reports both read existing tables (`follow_ups`, `deal_activities`, `leads`, `properties`, `clients`, `deals`, `users`).

  ### Backend — Reports
  - `services/report.service.ts` — five public functions:
    - `getLeadReport(range?)`     → `{total, byStatus, bySource, won, conversionRate}` using `prisma.lead.count` + two `groupBy` calls.
    - `getPropertyReport()`        → `{total, byStatus, available, sold}` (snapshot, no range).
    - `getClientReport()`          → `{total, linked, unlinked}` (snapshot).
    - `getDealReport(range?)`      → `{total, byStatus[{status,count,value}], totalValue, wonCount, lostCount, revenueTrend[]}`. Revenue trend is a 12-month `date_trunc('month', "createdAt")` raw query on WON deals — cheap (one B-tree scan) and avoids loading the deal set into memory.
    - `getAgentReport()`           → one row per active agent merging deal counts (assigned + won) + lead counts (assigned + won) + follow-up counts (done + total) into a single rollup. Three independent `groupBy` queries + one in-memory join keyed by `agentId`.
  - `controllers/report.controller.ts` — one JSON handler + one CSV handler per section. Shared `parseRange(req)` reads `?from=` / `?to=` ISO dates and snaps them to local-day boundaries. `sendCsv` mirrors the existing CSV pattern (UTF-8 BOM + `Content-Type text/csv` + `Content-Disposition attachment`).
  - `routes/report.routes.ts` — mounts `authenticate + requireRole('ADMIN')` once at the router level so every handler is RBAC-safe by construction. Verified live: agent caller gets `HTTP 403 {"error":"Insufficient permissions"}` on every report endpoint.
  - API surface:
    - `GET /api/reports/leads`       + `GET /api/reports/leads/export`
    - `GET /api/reports/properties`  + `GET /api/reports/properties/export`
    - `GET /api/reports/clients`     + `GET /api/reports/clients/export`
    - `GET /api/reports/deals`       + `GET /api/reports/deals/export`
    - `GET /api/reports/agents`      + `GET /api/reports/agents/export`

  ### Backend — Notifications
  - `services/notification.service.ts` — single `buildNotifications(scope)` that aggregates from THREE existing tables in parallel: `prisma.followUp.findMany` (pending + due-today or earlier), `prisma.dealActivity.findMany` (last 5 for the caller's deals), `prisma.lead.findMany` (5 most recent leads assigned to the caller, or any assigned lead for ADMIN). RBAC inside the service — ADMIN sees everything tenant-wide, AGENT only their own scope. Returns a flat `NotificationItem[]` shape (id, kind, title, description, href, createdAt, actor) sorted newest-first.
  - `controllers/notification.controller.ts` — single `listNotifications` GET handler.
  - `routes/notification.routes.ts` — mounted at `/api/notifications`, JWT required, both roles.
  - **Mark-as-read is FRONTEND-ONLY** (no DB column, no endpoint). Each user keeps an ISO timestamp at `localStorage.notif:lastRead:{userId}`. Any notification with `createdAt > lastRead` is "unread". "Mark read" stamps `lastRead` with the newest visible `createdAt`. Verified end-to-end: badge "9" → click Mark read → summary "9 recent · 0 unread", badge disappears, button hides.

  ### Frontend
  - `pages/ReportsPage.tsx` — single ADMIN-only page rendered at `/reports` (route already existed in `nav-items.ts` as ADMIN-restricted, but had no page before). Five sections, each with its own header card (icon + title + subtitle + per-section CSV button), stat cards, charts (recharts BarChart / PieChart / LineChart depending on the data shape), and tables where the data is dense. Date-range filter (`from` / `to` date inputs + Apply/Clear) drives the Lead + Deal sections; the rest are absolute snapshots.
    - Stat cards use the existing `<Card>` + StatCard inline component.
    - Charts use the existing thin Shadcn `ChartContainer` wrapper at `components/ui/chart.tsx`.
    - "Print / PDF" button at the top calls `window.print()`. A scoped `@media print` block hides nav / sidebar / filter card + collapses spacing so the printed output is a clean three-page report (verified visually).
    - All five sections expose stable testids: `report-{leads|properties|clients|deals|agents}-section` + per-stat `report-{section}-{key}` + `-export-button`.
  - `services/reports.ts` — typed wrappers around the five JSON endpoints. CSV exports use `responseType: 'blob'` (`api.get(...)` + `URL.createObjectURL`) — same pattern as the existing analytics CSV export.
  - `services/notifications.ts` — `list()` wrapper + `getLastRead(userId)` / `setLastRead(userId, iso)` helpers (localStorage round-trip wrapped in try/catch so private-mode browsers don't crash).
  - `components/layout/NotificationPanel.tsx` — Radix `DropdownMenu`-based dropdown anchored to the navbar bell. Polls `/api/notifications` every 60s while mounted. Surfaces per-kind icon + colour pill, item title, truncated description, relative time ("17m ago"), actor attribution, unread-dot on items newer than `lastRead`, count badge on the bell (`9+` when > 9), Mark-read button (only visible when there are unread items), empty state, loading skeletons.
  - `components/layout/Navbar.tsx` — replaced the dead Bell button with `<NotificationPanel />`. No other navbar changes.
  - `App.tsx` — added the `/reports` route under the existing `<ProtectedRoute roles={['ADMIN']}>` block. No route additions for notifications (panel mounts inside Navbar).

  ### Files added
    - Backend: `services/report.service.ts`, `controllers/report.controller.ts`, `routes/report.routes.ts`, `services/notification.service.ts`, `controllers/notification.controller.ts`, `routes/notification.routes.ts`.
    - Frontend: `pages/ReportsPage.tsx`, `services/reports.ts`, `services/notifications.ts`, `components/layout/NotificationPanel.tsx`.
  ### Files modified
    - `backend/src/index.ts` — 4 lines (2 imports + 2 `app.use` registrations).
    - `frontend/src/App.tsx` — 2 lines (import + admin route registration).
    - `frontend/src/components/layout/Navbar.tsx` — swapped the Bell placeholder for `<NotificationPanel />` + dropped now-unused `Bell` import.

  ### Files NOT touched
  Everything else (auth, leads, follow-ups, communications, WhatsApp, analytics, CSV, users, pipeline, properties, clients, deals Phase-1+2, MainLayout, Sidebar, MobileSidebar, nav-items, Prisma schema, db config).

  ### Live smoke test (admin token)
    ```
    GET /api/reports/leads      → totalLeads=9, byStatus[6], bySource[7], conversionRate=11.11
    GET /api/reports/properties → total=3, available=3, sold=0
    GET /api/reports/clients    → total=3, linked=1, unlinked=2
    GET /api/reports/deals      → total=2, totalValue=4_00_01_000, wonCount=1, revenueTrend=[{2026-05, 50_01_000, 1}]
    GET /api/reports/agents     → 7 agent rows with dealsCount + leadConversion + followUpRate per agent
    GET /api/notifications      → 9 items (5 FOLLOWUP/DEAL_ACTIVITY/LEAD_ASSIGNMENT mix) merged + sorted newest-first
    Agent token → /api/reports/leads → HTTP 403 (Insufficient permissions). /api/notifications → 6 items scoped to agent's own deals + leads.
    ```

  ### UI verified via screenshots at 1440x900 (light theme)
    - `/reports` ADMIN shows: header, From/To/Apply/Clear filter, then five section cards in order — Lead Reports (4 stat cards + 2 charts), Property Reports (3 stat cards + pie chart), Client Reports (3 stat cards), Deal Reports (4 stat cards + table + 12-month line chart), Agent Reports (table with 7 rows). Each section has a working "CSV" button (blob download verified).
    - Top-right bell shows a `9` badge. Click → dropdown panel mounts with title "Notifications", summary "9 recent · 9 unread", and the merged feed of deal-activity + lead-assignment items. Click "Mark read" → summary changes to "9 recent · 0 unread", badge disappears. Empty state copy "Nothing new yet" verified separately by stamping a future lastRead timestamp.
  - **Phase 11.0 status: COMPLETE.**

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
FRONTEND_URL=https://pdf-chart-bug.preview.emergentagent.com
ADMIN_EMAIL=admin@realestate.com
ADMIN_PASSWORD=Admin@2036
```

### Frontend (`/app/frontend/.env`)

```env
REACT_APP_BACKEND_URL=https://pdf-chart-bug.preview.emergentagent.com
VITE_BACKEND_URL=https://pdf-chart-bug.preview.emergentagent.com
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
