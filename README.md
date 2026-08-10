# Campus Placement Management System

A full-stack campus placement platform with **Node.js/Express/MongoDB** backend and **React/Vite** frontend.

## Project Structure

```
Campus_placement_system/
├── backend/          # REST API (Step 1)
└── frontend/         # React UI (Step 2)
```

## Quick Start

### 1. Backend (port 3001)

```bash
cd backend
npm install
cp .env.example .env
# Start MongoDB, then:
npm run seed
npm run dev
```

### 2. Frontend (port 5173)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:5173**

The Vite dev server proxies `/api` → `http://localhost:3001`.

## Demo Credentials

| Role          | Email                  | Password      |
| ------------- | ---------------------- | ------------- |
| **Admin**     | admin@campus.edu       | Admin@123     |
| **Recruiter** | recruiter@technova.com | Recruiter@123 |
| **Student**   | ansh@student.edu       | Student@123   |

All seeded students use password **Student@123**.

## Features

### Student Portal

- Dashboard with profile completion, eligible jobs, applications, interviews, assessments, offers
- Profile management (education, skills, projects, resume upload)
- Browse eligible job drives with eligibility engine results
- Apply to drives, track applications, take assessments, manage offers
- Documents, calendar, notifications

### Recruiter Portal

- Company profile, create/publish job drives
- Filter applicants (CGPA, branch, status)
- Shortlist/reject, schedule interviews, create assessments
- Extend offers to selected candidates

### Admin Portal

- Manage students, recruiters, companies, departments
- View all drives, applications, interviews, assessments, offers
- Analytics charts (placement rate, department/year/company stats, packages)
- Announcements, audit logs, user management

## Tech Stack

| Layer    | Technologies                                                     |
| -------- | ---------------------------------------------------------------- |
| Frontend | React 19, Vite, React Router, Axios, Tailwind CSS 4, Recharts    |
| Backend  | Node.js, Express, MongoDB, Mongoose, JWT, Cloudinary, Nodemailer |
| Auth     | JWT + bcrypt, role-based access (student, recruiter, admin)      |

## API Testing

```bash
# Backend API tests
cd backend && npm run test:api

# Frontend integration tests (requires both servers running)
cd frontend && npm run test:integration
```

## Environment

**Backend** (`backend/.env`): MongoDB URI, JWT secret, email, Cloudinary, PORT=3001

**Frontend** (`frontend/.env`): `VITE_API_URL=/api` (uses Vite proxy in dev)
