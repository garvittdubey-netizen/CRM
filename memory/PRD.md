# BuilderOne CRM — Product Requirements Document

## Original Problem Statement
Continue from existing EMERGENT_STATE (Real Estate CRM) and execute a strict cosmetic rebrand to **BuilderOne CRM** (a product by MICROTECHNIQUE IT). The CRM itself must remain functionally and visually unchanged after login. Allowed scope is limited to (a) full rebrand to BuilderOne CRM, (b) addition of a public marketing landing page in front of the login flow, and (c) a non-functional demo-credentials card on the login page. Do NOT touch backend, Cloudinary, storage, or database logic — those will be handled in Phase-2 separately.

## Owner / Product
MICROTECHNIQUE IT (MITCS) — https://microtechniqueit.com/

## Architecture (unchanged from Phase 14.3)
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS + Shadcn UI (port 3000)
- **Backend**: Node.js + Express + TypeScript (port 8002) behind a FastAPI proxy on port 8001 (supervisor-managed)
- **DB**: PostgreSQL (managed Neon, ap-southeast-1) via Prisma v5
- **Auth**: JWT (jsonwebtoken) + bcryptjs, 3-tier RBAC (SUPER_ADMIN > ADMIN > AGENT)
- **External integrations**: Meta WhatsApp Cloud API v22.0, Cloudinary

## User Personas
1. **Marketing visitor / prospect** — lands on `/`, evaluates the product, contacts MITCS via WhatsApp.
2. **Existing CRM user** (SUPER_ADMIN / ADMIN / AGENT) — logs in at `/login`, lands on `/dashboard`, uses the existing CRM unchanged.

## Core Requirements (this phase)
| # | Requirement | Status |
|---|-------------|--------|
| A1 | Full rebrand to "BuilderOne CRM" everywhere visible | DONE |
| A2 | Replace logo across login, sidebar, mobile drawer, title, favicon, manifest, meta tags | DONE |
| A3 | Remove black backgrounds from uploaded logos before use | DONE (Pillow thresholded alpha) |
| A4 | Footer copy: `BuilderOne CRM © 2026 / A product by MICROTECHNIQUE IT` | DONE |
| B1 | New public landing page at `/` (premium light SaaS, navy + gold) | DONE |
| B2 | Hero: BuilderOne CRM + tagline + Explore + WhatsApp buttons + logo card | DONE |
| B3 | Features grid (10 cards) | DONE |
| B4 | Workflow timeline (7 steps) | DONE |
| B5 | Why BuilderOne (5 reasons) | DONE |
| B6 | About product with MITCS logo + microtechniqueit.com link | DONE |
| B7 | CTA + Floating WhatsApp (wa.me/916355997080) | DONE |
| C1 | Demo credentials card (display-only): demo@builderone.com / demo@builderone.com | DONE |
| C2 | Copy-to-clipboard buttons for email and password | DONE |
| C3 | "Use demo credentials" auto-fill shortcut | DONE |
| C4 | Login form logic preserved | DONE |
| Z1 | CRM after login unchanged (dashboard, sidebar nav, navbar, RBAC, workflows) | DONE |

## What's been implemented (with dates)
- **2026-05-22 — Phase 15.0** — BuilderOne rebrand + Landing page + Demo login card.
- All prior phases (1.0 → 14.3) preserved verbatim.

## Files Changed (this phase)
**Added (3)**:
- `frontend/src/pages/LandingPage.tsx`
- `frontend/public/manifest.json`
- `/etc/supervisor/conf.d/supervisord_node_backend.conf` (restored after container drift)

**Modified (5)**:
- `frontend/src/App.tsx` — added `/` landing route, fallback wildcard → `/`
- `frontend/src/pages/LoginPage.tsx` — branding + demo credentials card
- `frontend/src/components/layout/Sidebar.tsx` — logo swap to BuilderOne image
- `frontend/src/components/layout/MobileSidebar.tsx` — same logo swap
- `frontend/index.html` — title, description, OG/Twitter meta, favicon, manifest link, theme-color

**Public assets added** (in `frontend/public/`):
- `builderone-logo.png`, `builderone-logo-cropped.png`, `mitcs-logo.png`, `favicon.png`, `favicon.ico`

## Prioritized Backlog (deferred — Phase 16+)
- **P0** — Seed `demo@builderone.com` user so the demo card credentials actually log in (user explicitly opted to handle separately).
- **P1** — Cloudinary / CDN upload of BuilderOne + MITCS logos (currently served from `/public`).
- **P1** — Replace login right-pane Unsplash image with a BuilderOne-brand photograph.
- **P2** — `/about-mitcs` and `/legal/privacy` pages deep-linked from landing footer.
- **P2** — Sticky-nav active-section indicator on landing page.

## Next Tasks
1. Seed the demo user in `backend/src/scripts/seed.ts` (when user is ready) — idempotent `prisma.user.upsert`.
2. Convert the floating WhatsApp number to an env var (`VITE_WHATSAPP_NUMBER`).
3. Phase 16+ — Cloudinary / storage work as previously deferred in Phase 15.0 scope.

## Engagement Enhancement Suggestion
**Why not add a "Book a 10-min walkthrough" Cal.com / Google Calendar embed on the landing CTA?** A one-tap booking flow next to the WhatsApp button would convert curious prospects into qualified demos without forcing them to start a WhatsApp conversation — directly boosting MITCS's pipeline visibility and conversion rate.
