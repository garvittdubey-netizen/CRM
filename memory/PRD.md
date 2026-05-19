# PRD — Real Estate CRM

## Latest iteration (Phase 9.0)
> Build Clients module only.
> Backend: Client model (fullName/phone/email/budget/preferredLocation/notes/
> linkedLeadId optional FK/assignedAgentId) + CRUD + search + filter by assigned agent.
> Frontend: /clients (grid/list, search, filters, cards) + /clients/:id with merged
> activity timeline (client_activities table + linked lead's communications/follow-ups/
> activities, read-only). RBAC mirror of Leads. Client↔Lead many-to-one. No mocks.

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
- [x] **Phase 8.0 Properties module + Cloudinary uploads (iteration_12, 100%, 2026-05-19)**
  - Prisma migration `20260519200643_add_property_model` (Property + PropertyStatus + AreaUnit, User.properties back-relation)
  - Backend `/api/properties` GET/POST/PUT/DELETE + PATCH `/:id/assign` (ADMIN only) + GET `/:id/matching-leads`
  - Cloudinary direct upload via signed signature (`/api/uploads/cloudinary-signature`, cloud `dd61mc8me`, folder allow-list tightened to `properties` exact OR `properties/...` prefix)
  - RBAC: ADMIN any property; AGENT only own; AGENT cannot reassign owner; AGENT cannot set ownerAgentId on POST (always self)
  - `/properties` page: grid/list toggle (localStorage `properties:view`), sticky filter sidebar (search/type/city/status/min-max price), debounced search, paginated
  - `/properties/:id`: image gallery (hero + thumbs + prev/next), stat tiles, description, owner agent, "Matching Leads" sidebar (read-only, scored, RBAC-scoped, quick-action buttons to /leads/:id and /communications?leadId=)
  - PropertyImageUploader: drag-drop, XHR progress per file, blob preview, inline error per file, max 8MB + 10 files, remove uploaded URLs
  - 35/35 backend pytest pass incl. real Cloudinary multipart upload; all frontend RBAC flows verified for both roles
- [x] **Phase 9.0 Clients module + merged activity timeline (iteration_13, 100%, 2026-05-19)**
  - Prisma migration `20260519203534_add_client_model` (Client + ClientActivity; User.clients/clientActivities + Lead.clients back-relations; Client.linkedLead onDelete=SetNull verified; ClientActivity onDelete=Cascade verified)
  - Backend `/api/clients` GET/POST/PUT/DELETE + PATCH `/:id/assign` (ADMIN only) + GET `/:id/timeline`
  - Auto-logged lifecycle events: CREATED / UPDATED / LINKED_LEAD / UNLINKED_LEAD / AGENT_ASSIGNED / AGENT_UNASSIGNED / NOTES_UPDATED
  - RBAC mirrors Lead/Property exactly: ADMIN sees all; AGENT scope auto-restricted server-side; AGENT cannot reassign; AGENT cannot set assignedAgentId on POST; ADMIN explicit `null` honoured as "unassigned" (fixed post-test)
  - Merged timeline: CLIENT events + (when linkedLeadId set) COMMUNICATION + FOLLOWUP + ACTIVITY rows of the linked lead, source-prefixed ids, sorted newest-first, capped to 200
  - `/clients`: grid/list toggle (localStorage `clients:view`), debounced search, ADMIN-only agent filter, link-state filter (Any/Linked/Unlinked), pagination, empty + skeleton states
  - `/clients/:id`: avatar header + 6-field profile + notes + Activity timeline + linked-lead card + RBAC-gated Edit/Delete/Message buttons
  - ClientFormModal: searchable linked-lead picker (debounced 300 ms → leadsApi.list), ADMIN-only agent select, inline validation
  - 21/21 backend pytest pass; all frontend RBAC flows verified for both ADMIN and AGENT; lead deletion → client.linkedLeadId set to NULL confirmed live

## Backlog (prioritized)
- P1: Deals module.
- P2: Time-series trend charts; PDF export for analytics.
- P2: Replace window.alert with sonner/toast (Pipeline rollback, Property delete, Client delete).
- P3: Add `DialogDescription` (or `aria-describedby`) to all modal dialogs to silence Radix a11y warnings (LeadFormModal, PropertyFormModal, ClientFormModal).
- P3: Virtualize Pipeline board if a tenant exceeds ~500 leads.
- P3: Clean up pre-existing TS warnings in `LeadDetailPage.tsx` + `services/api.ts`.
- P3: Property — bulk image reorder via drag handles, agent dashboard view.
- P3: Client — parallelize the 4 timeline sub-queries with `Promise.all` for marginal speed-up.

## Next tasks
1. Deals module (Property + Client + Agent + amount + deal-status pipeline).
2. Reports page (Admin-only, aggregations on Leads/Properties/Deals/Clients).
3. Toast notification system (sonner) to replace window.alert site-wide.
