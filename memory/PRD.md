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

### Backend (Node.js/Express/Prisma)
- `src/index.ts` - Express app setup, CORS, routes
- `src/routes/auth.routes.ts` - Auth endpoints
- `src/controllers/auth.controller.ts` - Request handling
- `src/services/auth.service.ts` - Business logic
- `src/middleware/auth.ts` - JWT verification, role checks
- `src/lib/prisma.ts` - Singleton Prisma client
- `src/scripts/seed.ts` - Admin user seeding
- `prisma/schema.prisma` - User model + Role enum
- Initial migration: 20260519110814_init

### Frontend (React/Vite/TypeScript)
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

### Infrastructure
- PostgreSQL 15 installed and running
- Database: real_estate_crm
- Supervisor: node_backend.conf added
- EMERGENT_STATE.md created

## Prioritized Backlog

### P0 — Must Have (Phase 2)
- Properties module (CRUD)
- Clients module (CRUD)
- Deals module (CRUD)

### P1 — Important (Phase 3)
- Dashboard stats API connection
- User management (Admin)
- Reports page (Admin)
- Mobile sidebar drawer

### P2 — Nice to Have (Phase 4)
- Search and filtering
- Export (CSV/PDF)
- Email notifications
- Activity log
- File attachments (property photos)

## User Personas
- **Admin**: Manager overseeing all agents, properties, reports
- **Agent**: Day-to-day user managing their assigned properties and clients

## Next Tasks
1. Build Properties module (Prisma model + API + UI)
2. Build Clients module
3. Build Deals module
4. Connect dashboard stats to real API data
5. Implement mobile sidebar with Sheet component
