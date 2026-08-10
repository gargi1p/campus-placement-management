<div align="center">

# 🎓 Campus Placement Management System

### One platform. Every placement milestone.

_A full-stack workspace that connects students, recruiters, and placement teams from first application to final offer._

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](frontend)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](backend)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](frontend)

</div>

---

## ✨ The placement journey, simplified

Campus hiring should not live in scattered spreadsheets and email threads. This application brings the full process into one focused experience: build profiles, publish opportunities, evaluate candidates, schedule interviews, run assessments, and manage offers.

> **Designed for clarity:** every user sees the tools and information relevant to their role.

## 🧭 Three portals, one workflow

| 🎒 Students | 💼 Recruiters | 🛡️ Administrators |
| --- | --- | --- |
| Build a rich academic profile | Create and publish job drives | Manage people, companies, and departments |
| Find eligible opportunities | Filter and review applicants | Monitor drives, applications, and offers |
| Apply, assess, interview, and respond to offers | Shortlist candidates and schedule interviews | View placement analytics and audit logs |
| Keep track with documents, calendar, and notifications | Create assessments and extend offers | Publish announcements and manage users |

## 🚀 What’s included

<table>
  <tr>
    <td width="50%">
      <h3>🔐 Secure access</h3>
      JWT authentication, hashed passwords, protected routes, role-based authorization, and rate limiting.
    </td>
    <td width="50%">
      <h3>🎯 Smarter applications</h3>
      Eligibility-aware drives, application status tracking, and a clear candidate journey.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📅 Hiring operations</h3>
      Interviews, assessments, offers, documents, and notifications in one place.
    </td>
    <td width="50%">
      <h3>📊 Placement intelligence</h3>
      Admin dashboards for placement rates, departments, years, companies, and packages.
    </td>
  </tr>
</table>

## 🛠️ Technology

| Layer | Tools |
| --- | --- |
| **Frontend** | React 19 · Vite · React Router · Tailwind CSS · Axios · Recharts |
| **Backend** | Node.js · Express · Mongoose |
| **Data & security** | MongoDB · JWT · bcrypt · Helmet · express-rate-limit |
| **Integrations** | Cloudinary · Multer · Nodemailer |

## 🗂️ Project map

```text
Campus_placement_system/
│
├── backend/                     # Express REST API
│   ├── controllers/             # Application logic
│   ├── middleware/              # Auth, validation & error handling
│   ├── models/                  # MongoDB schemas
│   ├── routes/                  # API endpoints
│   ├── seeds/                   # Demo data
│   └── tests/                   # API smoke tests
│
└── frontend/                    # React + Vite client
    ├── src/api/                 # API modules
    ├── src/components/          # Reusable interface components
    ├── src/pages/               # Role-specific pages
    └── tests/                   # Integration tests
```

## ⚡ Quick start

### Prerequisites

- Node.js 18+
- npm
- MongoDB (local instance or Atlas)

### 1 · Launch the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3001
MONGO_URI=mongodb://127.0.0.1:27017/campus-placement
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRE=7d
```

Then seed the demo data and run the API:

```bash
npm run seed
npm run dev
```

### 2 · Launch the frontend

In a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=/api
```

```bash
npm run dev
```

Visit **[localhost:5173](http://localhost:5173)**. During development, Vite proxies `/api` calls to `http://localhost:3001`.

> 💡 Configure the appropriate Cloudinary and Nodemailer environment values when you want uploads and email delivery enabled.

## 🔑 Demo accounts

After running `npm run seed` inside `backend`, use any of these accounts to explore the platform.

| Role | Sign in with | Password |
| :--- | :--- | :--- |
| 🛡️ **Admin** | `admin@campus.edu` | `Admin@123` |
| 💼 **Recruiter** | `recruiter@technova.com` | `Recruiter@123` |
| 🎒 **Student** | `ansh@student.edu` | `Student@123` |

All seeded student accounts use `Student@123`.

## 🔌 API overview

All endpoints are served below `/api`. Protected routes require a valid JWT and enforce the relevant user role.

| Domain | Endpoint |
| --- | --- |
| Authentication | `/api/auth` |
| Student workflows | `/api/students` |
| Recruiter workflows | `/api/recruiters` |
| Administration | `/api/admin` |
| Assessments | `/api/assessments` |
| Offers | `/api/offers` |
| Documents | `/api/documents` |
| Notifications | `/api/notifications` |
| Analytics | `/api/analytics` |

## ✅ Quality checks

```bash
# API smoke tests
cd backend
npm run test:api

# Frontend linting and production build
cd frontend
npm run lint
npm run build

# Frontend integration tests (requires both services running)
npm run test:integration
```

---

<div align="center">
  Built to make campus placements feel less like paperwork and more like progress. ✨
</div>
