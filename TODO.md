# Admin Password Reset & Multi-Admin Implementation

## Backend
- [x] Create `backend/models/Admin.js`
- [x] Update `backend/routes/auth.js` (DB login, forgot-password, reset-password)
- [x] Update `backend/routes/admin.js` (list, create, delete admins)
- [x] Update `backend/server.js` (seed default admin)
- [x] Install `crypto` dependency (built-in, no install needed)

## Frontend
- [x] Update `api.js` with new endpoints
- [x] Update `login.html` with "Forgot Password?" link
- [x] Create `forgot-password.html`
- [x] Create `reset-password.html`
- [x] Update `admin.html` with Admins tab
- [x] Update `DEPLOYMENT.md`

## Verification
- [x] Backend starts and seeds default admin
- [x] Login returns JWT with role
- [x] Forgot-password generates token
- [x] Reset-password updates password
- [x] Create/list admins works via API

