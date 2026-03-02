# 🧪 RBAC Testing Quick Reference

## 🚀 Quick Start

### 1. Run Database Migration

```sql
-- Execute in Supabase SQL Editor
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'receptionist', 'admin');
ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'patient';
CREATE INDEX idx_users_role ON users(role);
```

### 2. Create Admin User (One-time Setup)

**Option A: Via SQL**
```sql
-- First, register a user normally, then update their role
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

**Option B: Register and manually update in Supabase Dashboard**
1. POST /api/auth/register with your admin email
2. Go to Supabase Dashboard → Table Editor → users
3. Find your user and change role to 'admin'

## 📋 Test Scenarios

### Scenario 1: Patient Access

```bash
# 1. Register as patient
POST http://localhost:3000/api/auth/register
{
  "name": "Test Patient",
  "email": "patient@test.com",
  "password": "test123"
}

# 2. Login and save token
POST http://localhost:3000/api/auth/login
{
  "email": "patient@test.com",
  "password": "test123"
}

# 3. View doctors (✅ Should work)
GET http://localhost:3000/api/doctors
Authorization: Bearer <patient-token>

# 4. View own appointments (✅ Should work)
GET http://localhost:3000/api/appointments
Authorization: Bearer <patient-token>

# 5. Book appointment (✅ Should work)
POST http://localhost:3000/api/appointments
Authorization: Bearer <patient-token>
{
  "slot_id": "slot-uuid",
  "reason": "Regular checkup"
}

# 6. Try to view all users (❌ Should fail - 403 Forbidden)
GET http://localhost:3000/api/auth/users
Authorization: Bearer <patient-token>

# 7. Try to create doctor (❌ Should fail - 403 Forbidden)
POST http://localhost:3000/api/doctors
Authorization: Bearer <patient-token>
{
  "name": "Dr. Test",
  "specialization": "Cardiology"
}
```

### Scenario 2: Admin Access

```bash
# 1. Login as admin
POST http://localhost:3000/api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# 2. View all users (✅ Should work)
GET http://localhost:3000/api/auth/users
Authorization: Bearer <admin-token>

# 3. Update user role (✅ Should work)
PUT http://localhost:3000/api/auth/users/:userId/role
Authorization: Bearer <admin-token>
{
  "role": "receptionist"
}

# 4. Create doctor (✅ Should work)
POST http://localhost:3000/api/doctors
Authorization: Bearer <admin-token>
{
  "name": "Dr. Ahmad",
  "specialization": "Cardiology",
  "experience_years": 10,
  "phone": "+998901234567",
  "email": "ahmad@hospital.com"
}

# 5. View all appointments (✅ Should work)
GET http://localhost:3000/api/appointments/all
Authorization: Bearer <admin-token>

# 6. Book appointment for any patient (✅ Should work)
POST http://localhost:3000/api/appointments/book-for-patient
Authorization: Bearer <admin-token>
{
  "patient_id": "patient-uuid",
  "slot_id": "slot-uuid",
  "reason": "Admin-booked appointment"
}
```

### Scenario 3: Receptionist Access

```bash
# 1. Create receptionist (using admin token)
PUT http://localhost:3000/api/auth/users/:userId/role
Authorization: Bearer <admin-token>
{
  "role": "receptionist"
}

# 2. Login as receptionist
POST http://localhost:3000/api/auth/login
{
  "email": "receptionist@hospital.com",
  "password": "recep123"
}

# 3. View all doctors (✅ Should work)
GET http://localhost:3000/api/doctors
Authorization: Bearer <receptionist-token>

# 4. View all appointments (✅ Should work)
GET http://localhost:3000/api/appointments/all
Authorization: Bearer <receptionist-token>

# 5. Book appointment for patient (✅ Should work)
POST http://localhost:3000/api/appointments/book-for-patient
Authorization: Bearer <receptionist-token>
{
  "patient_id": "patient-uuid",
  "slot_id": "slot-uuid",
  "reason": "Receptionist-booked"
}

# 6. Cancel any appointment (✅ Should work)
DELETE http://localhost:3000/api/appointments/:appointmentId
Authorization: Bearer <receptionist-token>

# 7. Try to view all users (❌ Should fail - 403 Forbidden)
GET http://localhost:3000/api/auth/users
Authorization: Bearer <receptionist-token>

# 8. Try to create doctor (❌ Should fail - 403 Forbidden)
POST http://localhost:3000/api/doctors
Authorization: Bearer <receptionist-token>
```

## 🎯 Expected Error Responses

### 401 Unauthorized (No token or invalid token)
```json
{
  "success": false,
  "message": "Token topilmadi. Authorization header required.",
  "code": "UNAUTHORIZED"
}
```

### 403 Forbidden (Insufficient permissions)
```json
{
  "success": false,
  "message": "Ruxsat berilmadi. Kerakli rol: admin",
  "code": "FORBIDDEN",
  "details": {
    "required": ["admin"],
    "current": "patient"
  }
}
```

## 🔍 Verification Commands

### Check User Roles in Database
```sql
-- View all users with roles
SELECT id, name, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- Count users by role
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- Find specific user
SELECT * FROM users WHERE email = 'admin@example.com';
```

### Decode JWT Token
Use https://jwt.io to decode and verify token contains:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "patient",    // ← Check this field
  "iat": 1709337600,
  "exp": 1709942400
}
```

## 📊 Permission Matrix

| Action | Patient | Doctor | Receptionist | Admin |
|--------|---------|--------|--------------|-------|
| View doctors | ✅ | ✅ | ✅ | ✅ |
| View own appointments | ✅ | ✅ | - | ✅ |
| Book own appointment | ✅ | - | - | ✅ |
| View all appointments | ❌ | ❌ | ✅ | ✅ |
| Book for any patient | ❌ | ❌ | ✅ | ✅ |
| Cancel own appointment | ✅ | - | - | ✅ |
| Cancel any appointment | ❌ | ❌ | ✅ | ✅ |
| Create doctor | ❌ | ❌ | ❌ | ✅ |
| Update doctor | ❌ | ❌ | ❌ | ✅ |
| Delete doctor | ❌ | ❌ | ❌ | ✅ |
| View all users | ❌ | ❌ | ❌ | ✅ |
| Update user roles | ❌ | ❌ | ❌ | ✅ |

## 🐛 Troubleshooting

### Issue: "Role ma'lumoti topilmadi"
**Solution:** Old tokens don't have role. User must login again to get new token with role.

### Issue: "FORBIDDEN" errors for valid operations
**Solution:** Check user's role in database matches expected role in token.

### Issue: Database migration fails
**Solution:** Ensure `users` table exists and has correct structure.

### Issue: Token doesn't include role
**Solution:** 
1. Check `auth.service.js` includes role in JWT payload
2. User must logout and login again
3. Verify JWT_SECRET is set in .env

## 📝 Thunder Client Collection

Save these as Thunder Client requests:

### Collection: RBAC Tests

```json
{
  "name": "RBAC Tests",
  "requests": [
    {
      "name": "Register Patient",
      "method": "POST",
      "url": "http://localhost:3000/api/auth/register",
      "body": {
        "name": "Test Patient",
        "email": "patient@test.com",
        "password": "test123"
      }
    },
    {
      "name": "Login Patient",
      "method": "POST",
      "url": "http://localhost:3000/api/auth/login",
      "body": {
        "email": "patient@test.com",
        "password": "test123"
      }
    },
    {
      "name": "View Doctors (Patient)",
      "method": "GET",
      "url": "http://localhost:3000/api/doctors",
      "headers": {
        "Authorization": "Bearer {{patientToken}}"
      }
    },
    {
      "name": "View All Users (Patient) - Should Fail",
      "method": "GET",
      "url": "http://localhost:3000/api/auth/users",
      "headers": {
        "Authorization": "Bearer {{patientToken}}"
      }
    }
  ]
}
```

---

**Quick Tip:** Start with testing patient endpoints, then admin, then receptionist to ensure proper access control at each level.
