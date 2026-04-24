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
ADMIN_PASSWORD_HASH=$2a$10$bpVi7dFTtjbMFtM3u2Lcee8H37rkRR2g4R0A6pQJvTbwuQdhWQQum
FRONTEND_URL=https://your-frontend-domain.com
```

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

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Server health check |
| POST | `/api/book` | No | Submit a booking |
| POST | `/api/review` | No | Submit a review |
| POST | `/api/contact` | No | Submit a contact |
| POST | `/api/admin/login` | No | Admin login (returns JWT) |
| GET | `/api/admin/bookings` | JWT | List all bookings |
| PATCH | `/api/admin/bookings/:id` | JWT | Update booking status |
| GET | `/api/admin/reviews` | JWT | List all reviews |
| DELETE | `/api/admin/reviews/:id` | JWT | Delete a review |
| GET | `/api/admin/contacts` | JWT | List all contacts |
| POST | `/api/admin/contact/:id/toggle` | JWT | Toggle contact status |
| GET | `/api/admin/stats` | JWT | Dashboard stats |

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
├── admin.html              # Admin dashboard
├── styles.css              # Global styles
├── api.js                  # Frontend API client
├── script.js               # Shared JS utilities
├── backend/
│   ├── server.js           # Express server
│   ├── db.js               # MongoDB connection
│   ├── package.json
│   ├── .env.example
│   ├── routes/
│   │   └── auth.js         # Auth middleware
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Review.js
│   │   └── Contact.js
│   └── tests/
│       └── api.test.js     # Smoke tests
└── DEPLOYMENT.md           # This file
```

---

## Security Notes

- Change `JWT_SECRET` and `ADMIN_PASSWORD_HASH` before production.
- Set `FRONTEND_URL` to enable CORS restriction.
- Helmet, rate limiting, and input validation are enabled by default.
- All admin endpoints require a valid Bearer token.

