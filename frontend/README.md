# PlaceHub Frontend

React + Vite frontend for the Campus Placement Management System.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:5173**

Ensure the backend is running on **http://localhost:3001** (see `backend/`).

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campus.edu | Admin@123 |
| Recruiter | recruiter@technova.com | Recruiter@123 |
| Student | ansh@student.edu | Student@123 |

## Tech Stack

- React 19 + Vite
- React Router 7
- Axios (JWT auth)
- Tailwind CSS 4
- Recharts
- React Hot Toast
- Lucide Icons

## Features

- Role-based dashboards (Student, Recruiter, Admin)
- Protected routes with JWT authentication
- Real API integration (no mock data)
- Responsive SaaS-style UI
- Analytics charts, assessment timer UI, document uploads, calendar
