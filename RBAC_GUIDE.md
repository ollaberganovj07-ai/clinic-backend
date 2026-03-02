# 🔐 Role-Based Access Control (RBAC) Implementation Guide

## 📋 Overview

This document describes the complete RBAC system implemented for the Hospital Management API. The system supports four user roles with different permission levels.

## 🎭 User Roles

### 1. **Patient** (Default Role)
- Can view all doctors and their available slots
- Can book appointments for themselves
- Can view and cancel their own appointments
- **Cannot** access other patients' data

### 2. **Doctor**
- Can view their own appointments
- Can manage their own availability slots
- Can update their own profile
- **Cannot** access other doctors' or patients' data

### 3. **Receptionist**
- Can view all doctors
- Can view all appointments
- Can book appointments for any patient
- Can cancel any appointment
- Can manage services
- **Cannot** modify user roles or system settings

### 4. **Admin** (Highest Level)
- Full access to all modules
- Can manage user roles
- Can create/update/delete doctors
- Can view all data
- Can access system settings

## 🗄️ Database Schema Update

### Step 1: Run the SQL Migration

Execute the following SQL in your Supabase SQL Editor:

```sql
-- Create ENUM type for user roles
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'receptionist', 'admin');

-- Add role column to users table
ALTER TABLE users 
ADD COLUMN role user_role NOT NULL DEFAULT 'patient';

-- Create index for better performance
CREATE INDEX idx_users_role ON users(role);

-- Update existing users
UPDATE users SET role = 'patient' WHERE role IS NULL;
```

**Location:** `migrations/001_add_role_to_users.sql`

## 🔑 JWT Token Structure

Tokens now include the user's role:

```json
{
  "sub": "user-id-uuid",
  "email": "user@example.com",
  "role": "patient",
  "iat": 1709337600,
  "exp": 1709942400
}
```

## 🛡️ Middleware Architecture

### 1. **authMiddleware**
Validates JWT token and extracts user information (including role).

```javascript
// Usage
router.get('/protected', authMiddleware, handler);
```

### 2. **checkRole(...roles)**
Checks if user has one of the specified roles.

```javascript
// Single role
router.post('/admin-only', authMiddleware, checkRole(ROLES.ADMIN), handler);

// Multiple roles
router.get('/staff', authMiddleware, checkRole(ROLES.RECEPTIONIST, ROLES.ADMIN), handler);
```

### 3. **checkMinRole(minimumRole)**
Checks if user has at least the specified role level.

```javascript
router.get('/staff-area', authMiddleware, checkMinRole(ROLES.RECEPTIONIST), handler);
// Allows: RECEPTIONIST, ADMIN
// Denies: PATIENT, DOCTOR
```

### 4. **checkOwnership(paramName)**
Ensures user can only access their own resources (with admin/receptionist override).

```javascript
router.get('/users/:userId/profile', authMiddleware, checkOwnership('userId'), handler);
```

## 📡 API Endpoints

### Authentication Endpoints

#### 1. Register (Public)
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "role": "patient"  // Optional, defaults to 'patient'
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Ro'yxatdan o'tish muvaffaqiyatli"
}
```

#### 2. Login (Public)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123"
}
```

#### 3. Get All Users (Admin Only)
```http
GET /api/auth/users
Authorization: Bearer <admin-token>
```

#### 4. Update User Role (Admin Only)
```http
PUT /api/auth/users/:userId/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "receptionist"
}
```

### Doctor Endpoints

#### 1. Get All Doctors (Authenticated)
```http
GET /api/doctors?specialization=cardiology
Authorization: Bearer <token>
```

**Accessible by:** All authenticated users

#### 2. Get Doctor by ID (Authenticated)
```http
GET /api/doctors/:id
Authorization: Bearer <token>
```

**Accessible by:** All authenticated users

#### 3. Create Doctor (Admin Only)
```http
POST /api/doctors
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Dr. Smith",
  "specialization": "Cardiology",
  "experience_years": 15,
  "phone": "+998901234567",
  "email": "dr.smith@hospital.com"
}
```

#### 4. Update Doctor (Admin Only)
```http
PUT /api/doctors/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "phone": "+998901234568",
  "experience_years": 16
}
```

#### 5. Delete Doctor (Admin Only)
```http
DELETE /api/doctors/:id
Authorization: Bearer <admin-token>
```

### Appointment Endpoints

#### 1. Create Appointment (Patient Only)
```http
POST /api/appointments
Authorization: Bearer <patient-token>
Content-Type: application/json

{
  "slot_id": "slot-uuid",
  "reason": "Regular checkup"
}
```

**Note:** Patient ID is automatically taken from JWT token.

#### 2. Book Appointment for Patient (Receptionist/Admin)
```http
POST /api/appointments/book-for-patient
Authorization: Bearer <receptionist-or-admin-token>
Content-Type: application/json

{
  "patient_id": "patient-uuid",
  "slot_id": "slot-uuid",
  "reason": "Emergency consultation"
}
```

#### 3. Get Appointments (Role-Based)
```http
GET /api/appointments
Authorization: Bearer <token>
```

**Behavior:**
- **Patient:** Returns only their own appointments
- **Doctor:** Returns appointments with them
- **Receptionist/Admin:** Returns all appointments

#### 4. Get All Appointments (Receptionist/Admin)
```http
GET /api/appointments/all
Authorization: Bearer <staff-token>
```

#### 5. Cancel Appointment
```http
DELETE /api/appointments/:id
Authorization: Bearer <token>
```

**Behavior:**
- **Patient:** Can cancel only their own appointments
- **Receptionist/Admin:** Can cancel any appointment

## 🚨 Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token topilmadi. Authorization header required.",
  "code": "UNAUTHORIZED",
  "requestId": "req-uuid"
}
```

### 403 Forbidden (Access Denied)
```json
{
  "success": false,
  "message": "Ruxsat berilmadi. Kerakli rol: admin",
  "code": "FORBIDDEN",
  "details": {
    "required": ["admin"],
    "current": "patient"
  },
  "requestId": "req-uuid"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "code": "NOT_FOUND",
  "requestId": "req-uuid"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Slot boshqa bemor tomonidan band qilindi",
  "code": "CONFLICT",
  "requestId": "req-uuid"
}
```

## 📝 Implementation Checklist

### ✅ Completed Tasks

1. **Database Schema**
   - [x] Created `user_role` ENUM type
   - [x] Added `role` column to `users` table
   - [x] Created index on `role` column
   - [x] Set default value to `'patient'`

2. **Role Management**
   - [x] Created role constants (`ROLES`)
   - [x] Created role hierarchy
   - [x] Created permission mappings
   - [x] Created helper functions

3. **Authentication**
   - [x] Updated registration to assign default `patient` role
   - [x] Updated JWT token to include role
   - [x] Updated login to return role information

4. **Authorization Middleware**
   - [x] Created `checkRole()` middleware
   - [x] Created `checkMinRole()` middleware
   - [x] Created `checkOwnership()` middleware
   - [x] Updated `authMiddleware` to extract role from JWT

5. **Error Handling**
   - [x] Created custom error classes
   - [x] Implemented 403 Forbidden errors
   - [x] Added detailed error messages

6. **Protected Routes**
   - [x] Protected doctors routes
   - [x] Protected appointments routes
   - [x] Added admin routes for user management
   - [x] Added receptionist routes for appointment management

7. **API Endpoints**
   - [x] Patient endpoints (own appointments)
   - [x] Doctor endpoints (own schedule)
   - [x] Receptionist endpoints (all appointments)
   - [x] Admin endpoints (user management)

## 🧪 Testing Guide

### 1. Create Test Users

```bash
# Create a patient
POST /api/auth/register
{
  "name": "Test Patient",
  "email": "patient@test.com",
  "password": "test123"
}

# Create an admin (manually set role in database or use admin endpoint)
# Then use admin token to create other roles:

PUT /api/auth/users/:userId/role
{
  "role": "receptionist"
}
```

### 2. Test Access Control

```bash
# Test patient can access doctors (should work)
GET /api/doctors
Authorization: Bearer <patient-token>

# Test patient cannot access admin routes (should fail with 403)
GET /api/auth/users
Authorization: Bearer <patient-token>

# Test admin can access everything (should work)
GET /api/auth/users
Authorization: Bearer <admin-token>
```

### 3. Test Appointment Booking

```bash
# Patient books for themselves
POST /api/appointments
Authorization: Bearer <patient-token>
{
  "slot_id": "uuid",
  "reason": "Test appointment"
}

# Receptionist books for any patient
POST /api/appointments/book-for-patient
Authorization: Bearer <receptionist-token>
{
  "patient_id": "patient-uuid",
  "slot_id": "slot-uuid",
  "reason": "Staff-booked appointment"
}
```

## 🔧 Configuration Files

### Key Files Created/Modified

```
src/
├── shared/
│   ├── constants/
│   │   └── roles.js                    # Role definitions and utilities
│   └── errors/
│       └── AppError.js                  # Custom error classes
├── infra/
│   └── middlewares/
│       ├── authMiddleware.js            # JWT validation (updated)
│       └── checkRole.js                 # Authorization middleware (new)
├── modules/
│   └── users/
│       ├── auth/
│       │   ├── auth.repo.js             # Updated with role support
│       │   ├── auth.service.js          # Updated with role in JWT
│       │   ├── auth.controller.js       # Added admin endpoints
│       │   └── auth.routes.js           # Added admin routes
│       ├── doctors/
│       │   ├── doctors.routes.js        # Protected with roles
│       │   ├── doctors.controller.js    # Added CRUD operations
│       │   ├── doctors.service.js       # Added business logic
│       │   └── doctors.repo.js          # Added database operations
│       └── appointments/
│           ├── appointments.routes.js   # Role-based access
│           ├── appointments.controller.js # Role-based logic
│           ├── appointments.service.js  # Updated for multiple roles
│           └── appointments.repo.js     # Added staff methods
└── migrations/
    └── 001_add_role_to_users.sql       # Database migration

```

## 🎯 Next Steps

1. **Run the SQL migration** in your Supabase project
2. **Test all endpoints** with different user roles
3. **Create an admin user** manually in the database
4. **Configure frontend** to use the role information from JWT
5. **Implement role-based UI** in your frontend application

## 📞 Support

If you encounter any issues:
1. Check the terminal logs for detailed error messages
2. Verify JWT token includes the `role` field
3. Ensure database migration was executed successfully
4. Check user role in the database: `SELECT id, email, role FROM users;`

---

**Implementation Date:** 2026-03-02  
**Status:** ✅ Complete and Ready for Testing
