# Real Estate CRM - PRD

## Original Problem Statement
Create a Real Estate CRM foundation with:
- React + Vite + TypeScript frontend
- TailwindCSS + Shadcn UI
- Node.js + Express backend
- PostgreSQL + Prisma ORM
- JWT authentication
- Admin and Agent roles
- Protected routes
- Responsive sidebar and navbar
- Dashboard page structure
- Dark/light mode auto-toggle

## Architecture

### Tech Stack
- Frontend: React 18 + Vite + TypeScript + TailwindCSS + Shadcn UI
- Backend: Node.js + Express + TypeScript (port 8002)
- Proxy: Python FastAPI (port 8001 → 8002)
- ORM: Prisma v5 + PostgreSQL 15
- Auth: JWT + bcryptjs
- Theme: next-themes

### Key Design Decisions
- Python FastAPI as reverse proxy (port 8001) → Node.js (port 8002) due to supervisor constraints
- JWT in localStorage with Authorization Bearer header
- Shadcn UI with custom navy blue (#1E3A5F) theme
- Split-screen login page (form + property image)

## What's Been Implemented (2026-05-19)

### Phase 1 — Foundation
**Backend (Node.js/Express/Prisma)**
- `src/index.ts` - Express app setup, CORS, routes
- `src/routes/auth.routes.ts` - Auth endpoints
- `src/controllers/auth.controller.ts` - Request handling
- `src/services/auth.service.ts` - Business logic
- `src/middleware/auth.ts` - JWT verification, role checks
- `src/lib/prisma.ts` - Singleton Prisma client
- `src/scripts/seed.ts` - Admin user seeding
- `prisma/schema.prisma` - User model + Role enum
- Initial migration: 20260519110814_init

**Frontend (React/Vite/TypeScript)**
- `src/App.tsx` - Route structure
- `src/pages/LoginPage.tsx` - Split-screen login
- `src/pages/DashboardPage.tsx` - Stats cards + layout
- `src/pages/UnauthorizedPage.tsx` - 403 page
- `src/components/layout/Sidebar.tsx` - Collapsible nav
- `src/components/layout/Navbar.tsx` - Theme + user menu
- `src/components/layout/MainLayout.tsx` - Shell
- `src/components/auth/ProtectedRoute.tsx` - Role guards
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/services/api.ts` - Axios instance + interceptors
- Shadcn UI: Button, Card, Input, Label, Badge, Avatar, etc.

**Infrastructure**
- PostgreSQL 15 installed locally (localhost:5432/real_estate_crm) — owned by `postgres`, NOT Emergent-managed
- Supervisor: node_backend.conf added (port 8002)
- EMERGENT_STATE.md created

### Phase 2 — Lead Management (2026-05-19)
**Backend**
- `prisma/schema.prisma` — Lead model + LeadStatus enum (NEW/CONTACTED/QUALIFIED/NEGOTIATING/WON/LOST)
- Migration: 20260519113134_add_lead_model
- `src/routes/lead.routes.ts` — full CRUD + PATCH /:id/assign (admin-only on delete & assign)
- `src/controllers/lead.controller.ts` — validation, error handling (P2025)
- `src/services/lead.service.ts` — search across fullName/phone/email/preferredLocation, filter by status/propertyType/bhk/assignedAgentId, pagination, sort. AGENT role scoped to own leads.
- `src/routes/users.routes.ts` — GET /api/users for assignment dropdown
- Decimal budget serialized as plain number for JSON

**Frontend**
- `src/pages/LeadsPage.tsx` — table, search (debounced), filters (status/property), pagination, role-aware delete
- `src/pages/LeadDetailPage.tsx` — contact/property/notes/tags/agent/status sections + inline notes editor
- `src/components/leads/LeadFormModal.tsx` — add & edit form
- `src/components/leads/StatusBadge.tsx`, `TagInput.tsx`
- `src/services/leads.ts` — typed API client
- `src/types/index.ts` — Lead, LeadsResponse, CreateLeadData, UpdateLeadData
- App.tsx wired: `/leads`, `/leads/:id` under ProtectedRoute + MainLayout
- Sidebar wired: "Leads" nav item with UserPlus icon

**Testing**: 17/17 backend pytest + 13/13 frontend E2E passed — `/app/test_reports/iteration_2.json`
**Regression suite**: `/app/backend/tests/test_leads.py`

## Prioritized Backlog

### P0 — Must Have (Phase 3)
- Properties module (CRUD)
- Clients module (CRUD)
- Deals module (CRUD)

### P1 — Important (Phase 4)
- Dashboard stats API connection
- User management page (Admin) — backend GET /api/users exists
- Reports page (Admin)
- Mobile sidebar drawer (Sheet component)
- Decide: AGENT edit scope on PUT /api/leads/:id (currently un-scoped)
- Decide: GET /api/users access tightening (currently any authenticated user)

### P2 — Nice to Have (Phase 5)
- Export leads (CSV/PDF)
- Email/WhatsApp notifications on lead status change
- Activity log / audit trail per lead
- File attachments (property photos, lead documents)
- Bulk import leads (CSV)
- Saved filter presets

## User Personas
- **Admin**: Manager overseeing all agents, leads, properties, reports
- **Agent**: Day-to-day user managing their assigned leads, properties, clients

## Next Tasks
1. Properties module (Prisma model + API + UI)
2. Clients module
3. Deals module
4. Connect dashboard stats to real API data (lead counts by status)
5. Implement mobile sidebar with Sheet component
6. Resolve open Lead module decisions (AGENT edit scope, /api/users access)
