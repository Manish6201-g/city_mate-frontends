# CityMate — Deployment Guide

## Quick Start (Local Development)

```bash
cd backend
cp .env.example .env
npm install
npm start        # Backend on http://localhost:3001
```

Open `index.html` with Live Server (VS Code) or any static server on port 5500.

---

## Production Deployment

### 1. Backend (Render, Railway, or VPS)

**Environment Variables** (`backend/.env`):
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/citymate?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-min-32-chars-long
PORT=3001
NODE_ENV=production
ADMIN_EMAIL=admin@citymate.com
ADMIN_PASSWORD=admin123
FRONTEND_URL=https://your-frontend-domain.com
```

> **Note:** `ADMIN_PASSWORD_HASH` has been replaced by `ADMIN_PASSWORD`. The server automatically hashes and seeds the default admin on first startup.

**Build & Start**:
```bash
cd backend
npm install --production
npm start
```

**Health Check**: `GET /health` returns `{ "status": "ok", "mongodb": "connected" }`

### 2. Frontend (Netlify, Vercel, or any CDN)

1. Update `api.js` — set `API_BASE_URL` to your backend URL:
   ```js
   const API_BASE_URL = 'https://your-backend.onrender.com';
   ```
2. Deploy the root folder (all HTML, CSS, JS files except `backend/` and `city-mate/`).

### 3. MongoDB Atlas (Required for Production)

1. Create a free M0 cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Whitelist your backend IP
3. Copy the connection string into `MONGO_URI`

Without MongoDB, the app falls back to in-memory storage (data lost on restart).

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@citymate.com` | `admin123` |

---

## API Endpoints

### Public
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Server health check |
| POST | `/api/book` | No | Submit a booking |
| POST | `/api/review` | No | Submit a review |
| POST | `/api/contact` | No | Submit a contact |
| POST | `/api/admin/login` | No | Admin login (returns JWT) |
| POST | `/api/admin/forgot-password` | No | Request password reset token |
| POST | `/api/admin/reset-password` | No | Reset password using token |

### Admin (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/bookings` | List all bookings |
| POST | `/api/admin/update/:id` | Update booking status |
| DELETE | `/api/admin/booking/:id` | Delete a booking |
| GET | `/api/admin/reviews` | List all reviews |
| DELETE | `/api/admin/review/:id` | Delete a review |
| GET | `/api/admin/contacts` | List all contacts |
| POST | `/api/admin/contact/:id/toggle` | Toggle contact status |
| GET | `/api/admin/admins` | List all admins |
| POST | `/api/admin/admins` | Create a new admin |
| DELETE | `/api/admin/admins/:id` | Delete an admin |

---

## New Features

### Admin Password Reset
- Admins can request a reset token via `forgot-password.html`.
- The token is returned in the API response (email service integration recommended for production).
- Use the token on `reset-password.html` to set a new password.
- Tokens expire after 1 hour.

### Multi-Admin Support
- The default admin is auto-seeded on first server start.
- Existing admins can create additional admins from the **Admins** tab in `admin.html`.
- Admins cannot delete their own account.
- Roles: `admin` and `superadmin`.

---

## Testing

```bash
cd backend
npm test        # Runs smoke tests against running server
```

---

## File Structure

```
city_mate/
├── index.html              # Homepage
├── services.html           # Services listing
├── booking-form.html       # Booking form
├── reviews.html            # Reviews page
├── contact.html            # Contact page
├── login.html              # Admin login
├── forgot-password.html    # Request password reset
├── reset-password.html     # Set new password
├── admin.html              # Admin dashboard
├── styles.css              # Global styles
├── api.js                  # Frontend API client
├── script.js               # Shared JS utilities
├── DEPLOYMENT.md           # This file
└── backend/
    ├── server.js           # Express server
    ├── package.json
    ├── .env.example
    ├── models/
    │   ├── Admin.js        # Admin model
    │   ├── Booking.js
    │   ├── Review.js
    │   └── Contact.js
    ├── routes/
    │   ├── auth.js         # Auth & password reset
    │   ├── admin.js        # Admin management & stats
    │   ├── bookings.js
    │   ├── reviews.js
    │   └── contacts.js
    └── tests/
        └── api.test.js     # Smoke tests
```

---

## Security Notes

- Change `JWT_SECRET` and `ADMIN_PASSWORD` before production.
- Set `FRONTEND_URL` to enable CORS restriction.
- Helmet, rate limiting, and input validation are enabled by default.
- All admin endpoints require a valid Bearer token.
- Password reset tokens are valid for 1 hour and are single-use.

