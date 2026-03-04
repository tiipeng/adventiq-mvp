# AdventIQ — "We enable the Fast Forward."

SaaS platform connecting businesses with expert consultants and university lab rentals.
Target market: Germany & Poland.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS 3 |
| Backend | Node.js 18+ + Express 4 |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File Uploads | Multer |
| Dev runner | Concurrently |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install all dependencies

```bash
npm run install:all
```

### 2. Seed the database with realistic mock data

```bash
npm run seed
```

### 3. Start the development server (frontend + backend simultaneously)

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## Seeded Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@adventiq.com | Admin123! |
| Business | anna.schmidt@techcorp.de | Business123! |
| Business | jan.kowalski@innovate.pl | Business123! |
| Expert | dr.mueller@university.de | Expert123! |
| Expert | prof.nowak@warsaw-uni.pl | Expert123! |
| Expert | dr.chen@fraunhofer.de | Expert123! |
| Lab | cleanroom@tum.de | Lab123! |
| Lab | biotech.lab@uw.edu.pl | Lab123! |

---

## Project Structure

```
adventiq/
├── package.json          # Root: runs both services with concurrently
├── README.md
├── server/               # Express + SQLite backend
│   ├── package.json
│   ├── index.js          # Entry point
│   ├── db/
│   │   ├── database.js   # SQLite connection + schema
│   │   └── seed.js       # Seed script
│   ├── middleware/
│   │   └── auth.js       # JWT middleware
│   └── routes/
│       ├── auth.js
│       ├── experts.js
│       ├── labs.js
│       ├── bookings.js
│       ├── reports.js
│       └── admin.js
└── client/               # React + Vite + Tailwind frontend
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx
        ├── utils/
        │   └── api.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── ExpertCard.jsx
        │   ├── LabCard.jsx
        │   └── BookingCard.jsx
        └── pages/
            ├── Landing.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── BusinessDashboard.jsx
            ├── ExpertDashboard.jsx
            ├── LabDashboard.jsx
            ├── AdminPanel.jsx
            ├── ExpertsList.jsx
            ├── LabsList.jsx
            ├── ExpertProfile.jsx
            ├── LabProfile.jsx
            ├── ProblemForm.jsx
            ├── BookingCalendar.jsx
            ├── Payment.jsx
            ├── BookingConfirmation.jsx
            └── Reports.jsx
```

---

## API Routes

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login, returns JWT
- `GET /api/auth/me` — Get current user profile

### Experts
- `GET /api/experts` — List with filters (expertise, price, location)
- `GET /api/experts/:id` — Full profile
- `PUT /api/experts/:id` — Update profile (expert only)

### Labs
- `GET /api/labs` — List with filters
- `GET /api/labs/:id` — Full profile
- `PUT /api/labs/:id` — Update profile (lab only)

### Bookings
- `POST /api/bookings` — Create booking (business user)
- `GET /api/bookings` — List (filtered by role)
- `GET /api/bookings/:id` — Single booking
- `PUT /api/bookings/:id/status` — Approve/reject (expert/lab)

### Reports
- `POST /api/reports` — Submit report (expert/lab, with optional file upload)
- `GET /api/reports/booking/:booking_id` — Get report for booking

### Admin
- `GET /api/admin/users` — All users
- `PUT /api/admin/users/:id/status` — Approve/reject user
- `GET /api/admin/bookings` — All bookings
- `GET /api/admin/stats` — Platform stats

---

## AI Placeholder Functions

The codebase includes placeholder stubs for future AI integration:

- `generateAIReport(bookingId)` — Auto-generate consultation reports
- `matchExpertByAI(problemDescription)` — Smart expert matching
- `suggestPricingByAI(expertId, demandData)` — Dynamic pricing suggestions

---

## Environment Variables

Create `server/.env` for production (defaults work for local dev):

```env
PORT=3001
JWT_SECRET=adventiq-super-secret-jwt-key-change-in-production
NODE_ENV=development
```
