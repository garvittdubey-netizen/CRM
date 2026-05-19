# PRD — Real Estate CRM

## Latest iteration (Phase 8.0)
> Build Properties module only.
> Backend: Property model (title, propertyType, location, city, price, area+areaUnit,
> bedrooms, bathrooms, status AVAILABLE/SOLD/RESERVED, description, images[], ownerAgentId)
> + CRUD + search + filters (type/city/price-range/status) + matching-leads endpoint.
> Frontend: /properties (grid/list toggle, filters sidebar, cards) + /properties/:id
> (gallery + matching leads sidebar). Real Cloudinary multi-image upload (cloud dd61mc8me).
> Real Neon Postgres only. No mocks. ADMIN+AGENT ownership RBAC mirrored from Leads.

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

## Backlog (prioritized)
- P1: Clients / Deals modules.
- P2: Time-series trend charts; PDF export for analytics.
- P2: Replace window.alert with sonner/toast (especially for Pipeline rollback notifications and Property delete failures).
- P3: Virtualize Pipeline board if a tenant exceeds ~500 leads.
- P3: Clean up pre-existing TS warnings in `LeadDetailPage.tsx` + `services/api.ts`.
- P3: Add `DialogDescription` to all modals.
- P3: Property — add `agentDashboardView` (count of own listings, sold-this-month, etc.)
- P3: Property — bulk image reorder via drag handles.

## Next tasks
1. Clients module (CRUD + tagging + link to Lead + activity history).
2. Deals module (Property + Client + Agent + amount + status pipeline).
3. Toast notification system (sonner) to replace window.alert site-wide.
