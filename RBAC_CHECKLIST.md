# ✅ RBAC Implementation Checklist

## 🎯 Pre-Deployment Checklist

### Database Setup
- [ ] Open Supabase SQL Editor
- [ ] Execute migration script from `migrations/001_add_role_to_users.sql`
- [ ] Verify role column exists: `SELECT * FROM users LIMIT 1;`
- [ ] Check ENUM was created: `SELECT unnest(enum_range(NULL::user_role));`

### Admin User Creation
- [ ] Register a user via API or directly in database
- [ ] Update that user's role to 'admin' in Supabase Dashboard or SQL:
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'your-admin@example.com';
  ```
- [ ] Verify admin user: `SELECT id, email, role FROM users WHERE role = 'admin';`

### Environment Variables
- [ ] Confirm `.env` file has all required variables:
  - [ ] `PORT=3000`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `JWT_SECRET`
  - [ ] `JWT_EXPIRES_IN=7d`

### Dependencies
- [ ] Run `npm install` (cross-fetch should be installed)
- [ ] Verify no missing dependencies: `npm list`

### Server
- [ ] Stop any running servers
- [ ] Start fresh: `npm run dev`
- [ ] Verify server logs show:
  - [ ] "✅ Supabase URL: ..."
  - [ ] "✅ Supabase client initialized successfully"
  - [ ] "🚀 Server 3000 portda muvaffaqiyatli ishga tushdi"

## 🧪 Testing Checklist

### Phase 1: Authentication & JWT
- [ ] **Register Patient**
  - [ ] POST `/api/auth/register` with patient credentials
  - [ ] Verify response includes `user.role === 'patient'`
  - [ ] Verify token is returned
  - [ ] Decode token at jwt.io and confirm `role` field exists

- [ ] **Login Patient**
  - [ ] POST `/api/auth/login`
  - [ ] Verify response includes role
  - [ ] Save token for subsequent tests

### Phase 2: Patient Access (Use Patient Token)
- [ ] **View Doctors** ✅ Should work
  - [ ] GET `/api/doctors`
  - [ ] Verify 200 OK response
  
- [ ] **View Own Appointments** ✅ Should work
  - [ ] GET `/api/appointments`
  - [ ] Verify 200 OK response
  
- [ ] **Book Appointment** ✅ Should work
  - [ ] POST `/api/appointments` with `slot_id`
  - [ ] Verify 201 Created response
  
- [ ] **Try Admin Endpoint** ❌ Should fail with 403
  - [ ] GET `/api/auth/users`
  - [ ] Verify 403 Forbidden response
  - [ ] Verify error message mentions required role
  
- [ ] **Try Create Doctor** ❌ Should fail with 403
  - [ ] POST `/api/doctors`
  - [ ] Verify 403 Forbidden response

### Phase 3: Admin Access (Use Admin Token)
- [ ] **Login as Admin**
  - [ ] POST `/api/auth/login` with admin credentials
  - [ ] Verify `user.role === 'admin'`
  - [ ] Save admin token

- [ ] **View All Users** ✅ Should work
  - [ ] GET `/api/auth/users`
  - [ ] Verify 200 OK and array of users returned

- [ ] **Update User Role** ✅ Should work
  - [ ] PUT `/api/auth/users/:userId/role` with `{"role": "receptionist"}`
  - [ ] Verify 200 OK response
  - [ ] Verify user role updated in database

- [ ] **Create Doctor** ✅ Should work
  - [ ] POST `/api/doctors` with doctor data
  - [ ] Verify 201 Created response

- [ ] **View All Appointments** ✅ Should work
  - [ ] GET `/api/appointments/all`
  - [ ] Verify 200 OK and all appointments returned

- [ ] **Book for Any Patient** ✅ Should work
  - [ ] POST `/api/appointments/book-for-patient`
  - [ ] Verify 201 Created response

### Phase 4: Receptionist Access
- [ ] **Create Receptionist User**
  - [ ] Use admin token to update a user's role to 'receptionist'
  
- [ ] **Login as Receptionist**
  - [ ] POST `/api/auth/login`
  - [ ] Save receptionist token

- [ ] **View All Doctors** ✅ Should work
  - [ ] GET `/api/doctors`
  - [ ] Verify 200 OK

- [ ] **View All Appointments** ✅ Should work
  - [ ] GET `/api/appointments/all`
  - [ ] Verify 200 OK

- [ ] **Book for Patient** ✅ Should work
  - [ ] POST `/api/appointments/book-for-patient`
  - [ ] Verify 201 Created

- [ ] **Cancel Any Appointment** ✅ Should work
  - [ ] DELETE `/api/appointments/:id`
  - [ ] Verify 200 OK

- [ ] **Try View Users** ❌ Should fail with 403
  - [ ] GET `/api/auth/users`
  - [ ] Verify 403 Forbidden

- [ ] **Try Create Doctor** ❌ Should fail with 403
  - [ ] POST `/api/doctors`
  - [ ] Verify 403 Forbidden

### Phase 5: Error Handling
- [ ] **No Token**
  - [ ] GET `/api/doctors` without Authorization header
  - [ ] Verify 401 Unauthorized

- [ ] **Invalid Token**
  - [ ] GET `/api/doctors` with `Authorization: Bearer invalid-token`
  - [ ] Verify 401 Unauthorized
  - [ ] Verify error message: "Noto'g'ri token"

- [ ] **Expired Token**
  - [ ] Use expired token (or manually set JWT_EXPIRES_IN to 1s and wait)
  - [ ] Verify 401 Unauthorized
  - [ ] Verify error message: "Token muddati tugagan"

- [ ] **Wrong Role**
  - [ ] Patient tries admin endpoint
  - [ ] Verify 403 Forbidden
  - [ ] Verify error includes `required` and `current` role details

### Phase 6: Data Isolation
- [ ] **Patient A** creates appointment
- [ ] **Patient B** tries to cancel Patient A's appointment
  - [ ] DELETE `/api/appointments/:patientA-appointment-id` with Patient B token
  - [ ] Verify 404 Not Found (because query filters by patient_id)

- [ ] **Patient** views own appointments
  - [ ] GET `/api/appointments`
  - [ ] Verify only their appointments returned (not other patients')

## 📊 Verification Queries

### Database Verification
Run these SQL queries in Supabase:

```sql
-- Check role column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- View all users with roles
SELECT id, name, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- Count users by role
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- Verify admin exists
SELECT * FROM users WHERE role = 'admin';

-- Check appointments
SELECT a.id, a.status, u.email as patient_email, d.name as doctor_name
FROM appointments a
JOIN users u ON a.patient_id = u.id
JOIN doctors d ON a.doctor_id = d.id
ORDER BY a.created_at DESC
LIMIT 10;
```

### Server Log Verification
Check terminal for these messages:

- [ ] "✅ Supabase URL: ..."
- [ ] "✅ Supabase client initialized successfully"
- [ ] "✅ Authenticated user: [email] ([role])" - on successful auth
- [ ] "✅ Access granted: User [email] ([role])" - on successful authorization
- [ ] "⚠️ Access denied: User [email] ([role]) attempted to access..." - on 403

## 🎯 Success Criteria

All of the following must be true:

- [ ] Database migration completed without errors
- [ ] Admin user exists and can login
- [ ] JWT tokens include `role` field
- [ ] Patient can access own data only
- [ ] Patient receives 403 on admin endpoints
- [ ] Admin can access all endpoints
- [ ] Receptionist has correct permissions (all appointments, no user management)
- [ ] 401 errors for invalid/missing tokens
- [ ] 403 errors for insufficient permissions
- [ ] Error messages are descriptive and helpful
- [ ] Server logs show authentication/authorization activity
- [ ] No linter errors in code

## 📝 Documentation Review

- [ ] Read `RBAC_GUIDE.md` for complete API documentation
- [ ] Review `RBAC_TESTING.md` for test scenarios
- [ ] Check `RBAC_ARCHITECTURE.md` for system diagrams
- [ ] Understand `RBAC_SUMMARY.md` for quick overview

## 🚀 Deployment Ready

Once all items above are checked:

- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Team briefed on RBAC system
- [ ] Frontend team notified about role field in JWT
- [ ] Monitor logs for first few hours after deployment
- [ ] Have rollback plan ready (database backup before migration)

## 🔧 Troubleshooting

If any test fails, check:

1. **Database:**
   - Migration executed successfully?
   - Role column exists?
   - User roles set correctly?

2. **JWT:**
   - Token includes `role` field? (decode at jwt.io)
   - JWT_SECRET matches in .env?
   - Token not expired?

3. **Middleware:**
   - authMiddleware executing before checkRole?
   - req.user populated with role?
   - Correct middleware applied to route?

4. **Server:**
   - Server restarted after code changes?
   - No errors in terminal logs?
   - Dependencies installed (cross-fetch)?

## ✨ Next Steps After Testing

1. **Frontend Integration:**
   - Update login/register to handle role
   - Store role in frontend state
   - Implement role-based UI visibility
   - Hide/show features based on user role

2. **Additional Features:**
   - Doctor can manage own slots
   - Doctor dashboard with own appointments
   - Receptionist dashboard
   - Admin analytics and reports

3. **Security Enhancements:**
   - Rate limiting per role
   - Audit logging for admin actions
   - Password strength requirements
   - Two-factor authentication for admin

---

**Status Template:**
```
RBAC Testing Status: [  ] Not Started  [  ] In Progress  [✅] Complete

Date: __________
Tester: __________
Environment: __________

Issues Found: __________
Issues Resolved: __________

Ready for Production: [  ] Yes  [  ] No
```
