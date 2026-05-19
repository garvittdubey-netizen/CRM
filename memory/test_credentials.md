# Test Credentials - Real Estate CRM

## Admin User
- **Email:** admin@realestate.com
- **Password:** Admin@2036
- **Role:** ADMIN
- **Created by:** Auto-seeded on server startup

## Auth Endpoints
- POST /api/auth/login
- POST /api/auth/register
- GET  /api/auth/me (requires Bearer token)
- POST /api/auth/logout (requires Bearer token)

## Database
- PostgreSQL: localhost:5432
- Database: real_estate_crm
- User: postgres
- Password: Admin@2036
- Connection string: postgresql://postgres:Admin@2036@localhost:5432/real_estate_crm

## Service URLs
- Frontend: http://localhost:3000
- Backend (proxy): http://localhost:8001
- Backend (Node.js): http://localhost:8002
- Preview: https://b5446777-1bde-406a-8a40-8a08bc6c3a10.preview.emergentagent.com
