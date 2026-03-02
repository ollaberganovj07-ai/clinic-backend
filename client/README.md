# Hospital Management - Frontend

React + Vite + Tailwind CSS frontend for the Hospital Management System.

## Quick Start

```bash
# Install dependencies (if not already done)
npm install

# Start dev server (runs on http://localhost:5173)
npm run dev
```

**Note:** Ensure the backend API is running on `http://localhost:3000` (the frontend proxies `/api` to the backend).

## Run Full Stack

From project root:

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
npm run client
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

## Features

- **Login** - Supports all roles: Admin, Doctor, Receptionist, Patient
- **Smart Redirection** - Role-based redirect after login:
  - Admin → `/admin/dashboard`
  - Receptionist → `/reception/dashboard`
  - Doctor → `/doctor/profile`
  - Patient → `/patient/home`
- **Reception Dashboard**:
  - View all doctors
  - Manage service pricing (localStorage)
  - Book appointments for walk-in patients
  - View all appointments
- **Responsive** - White & blue clinical theme
- **Protected Routes** - Role-based access control

## Build

```bash
npm run build
```

Output in `dist/` folder.
