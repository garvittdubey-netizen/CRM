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
- [x] PostgreSQL database setup (localhost:5432/real_estate_crm)
- [x] Prisma schema + initial migration (`20260519110814_init`)
- [x] Admin user auto-seeded on startup
- [x] JWT authentication (login, register, logout, /me)
- [x] Login page (split-screen, professional design)
- [x] Protected routes (role-based: ADMIN / AGENT)
- [x] Responsive sidebar (collapsible, role-aware nav)
- [x] Top navbar (user menu, theme toggle, notifications)
- [x] Dashboard page structure (stats cards, placeholders)
- [x] Dark/Light mode auto-toggle (next-themes)
- [x] Shadcn UI components (Button, Card, Input, Label, Badge, etc.)

### Pending Features
- [ ] Properties module (listing, CRUD)
- [ ] Clients module
- [ ] Deals module
- [ ] Reports (Admin only)
- [ ] User management (Admin only)
- [ ] Settings page
- [ ] Mobile sidebar (Sheet/Drawer)

### Current Phase
**Phase 1: Foundation** — COMPLETE

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
| createdAt | DateTime | default: now()     |
| updatedAt | DateTime | auto-updated       |

**Enum: Role**
- `ADMIN` — Full access, user management, reports
- `AGENT` — Standard CRM access

### Database Connection

```bash
# Connect to PostgreSQL
psql postgresql://postgres:Admin@2036@localhost:5432/real_estate_crm
```

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
DATABASE_URL=postgresql://postgres:Admin@2036@localhost:5432/real_estate_crm
JWT_SECRET=de45b3e0ad171b94d92263e40f26801ea167ef8e4154fbb31f3f0170056ed9bb
JWT_EXPIRES_IN=7d
PORT=8002
NODE_ENV=development
FRONTEND_URL=https://b5446777-1bde-406a-8a40-8a08bc6c3a10.preview.emergentagent.com
ADMIN_EMAIL=admin@realestate.com
ADMIN_PASSWORD=Admin@2036
```

### Frontend (`/app/frontend/.env`)

```env
REACT_APP_BACKEND_URL=https://b5446777-1bde-406a-8a40-8a08bc6c3a10.preview.emergentagent.com
VITE_BACKEND_URL=https://b5446777-1bde-406a-8a40-8a08bc6c3a10.preview.emergentagent.com
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

### Immediate Next Steps (Phase 2)

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

4. **User Management** (Admin only)
   - GET /api/users — list all users
   - POST /api/users — create agent
   - PUT /api/users/:id — update role
   - DELETE /api/users/:id

5. **Connect Dashboard Stats**
   - Update DashboardPage.tsx to fetch real counts from API
   - Add API endpoints: GET /api/dashboard/stats

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
