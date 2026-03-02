# 🏗️ RBAC Architecture Diagram

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                           │
│                 POST /api/appointments                           │
│          Authorization: Bearer eyJhbGc...                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      authMiddleware                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  1. Extract JWT from Authorization header                  │ │
│  │  2. Verify token signature                                 │ │
│  │  3. Decode payload                                         │ │
│  │  4. Attach to req.user:                                    │ │
│  │     { id, email, role }                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    checkRole(ROLES.PATIENT)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  1. Check if req.user exists                               │ │
│  │  2. Get req.user.role                                      │ │
│  │  3. Compare with allowed roles                             │ │
│  │  4. Allow OR Throw ForbiddenError (403)                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CONTROLLER                               │
│                  appointments.controller.js                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  1. Extract req.user.id, req.user.role                     │ │
│  │  2. Call service layer                                     │ │
│  │  3. Return response                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          SERVICE                                 │
│                  appointments.service.js                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  1. Validate input                                         │ │
│  │  2. Apply business logic                                   │ │
│  │  3. Call repository                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        REPOSITORY                                │
│                  appointments.repo.js                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  1. Check slot availability                                │ │
│  │  2. Update slot (transaction-safe)                         │ │
│  │  3. Create appointment                                     │ │
│  │  4. Return data                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                  │
│                      PostgreSQL Database                         │
└─────────────────────────────────────────────────────────────────┘
```

## Role Decision Tree

```
                    ┌─────────────────┐
                    │  User Request   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Has JWT Token? │
                    └────┬────────┬───┘
                         │        │
                    YES  │        │  NO
                         │        │
                         ▼        ▼
                  ┌──────────┐  ┌─────────────┐
                  │ Extract  │  │ 401 ERROR   │
                  │   Role   │  │ Unauthorized│
                  └────┬─────┘  └─────────────┘
                       │
         ┌─────────────┼─────────────┬──────────────┐
         │             │             │              │
         ▼             ▼             ▼              ▼
    ┌────────┐   ┌─────────┐   ┌────────────┐  ┌───────┐
    │PATIENT │   │ DOCTOR  │   │RECEPTIONIST│  │ ADMIN │
    └───┬────┘   └────┬────┘   └─────┬──────┘  └───┬───┘
        │             │              │             │
        ▼             ▼              ▼             ▼
   Own Data       Own Schedule   All Appointments Full Access
   Own Appts      Own Slots      All Doctors      All Users
   Book Self      View Appts     Book for Any     All Roles
                                 Cancel Any       Manage All
```

## Permission Matrix Visual

```
┌──────────────────────────────────────────────────────────────────┐
│                      PERMISSION MATRIX                            │
├──────────────────┬─────────┬─────────┬──────────────┬───────────┤
│ OPERATION        │ PATIENT │ DOCTOR  │ RECEPTIONIST │   ADMIN   │
├──────────────────┼─────────┼─────────┼──────────────┼───────────┤
│ View Doctors     │    ✅   │    ✅   │      ✅      │     ✅    │
├──────────────────┼─────────┼─────────┼──────────────┼───────────┤
│ Own Appointments │    ✅   │    ✅   │      -       │     ✅    │
├──────────────────┼─────────┼─────────┼──────────────┼───────────┤
│ Book Self        │    ✅   │    -    │      -       │     ✅    │
├──────────────────┼─────────┼─────────┼──────────────┼───────────┤
│ All Appointments │    ❌   │    ❌   │      ✅      │     ✅    │
├──────────────────┼─────────┼─────────┼──────────────┼───────────┤
│ Book for Others  │    ❌   │    ❌   │      ✅      │     ✅    │
├──────────────────┼─────────┼─────────┼──────────────┼───────────┤
│ Cancel Own       │    ✅   │    -    │      -       │     ✅    │
├──────────────────┼─────────┼─────────┼──────────────┼───────────┤
│ Cancel Any       │    ❌   │    ❌   │      ✅      │     ✅    │
├──────────────────┼─────────┼─────────┼──────────────┼───────────┤
│ Create Doctor    │    ❌   │    ❌   │      ❌      │     ✅    │
├──────────────────┼─────────┼─────────┼──────────────┼───────────┤
│ Manage Users     │    ❌   │    ❌   │      ❌      │     ✅    │
├──────────────────┼─────────┼─────────┼──────────────┼───────────┤
│ Update Roles     │    ❌   │    ❌   │      ❌      │     ✅    │
└──────────────────┴─────────┴─────────┴──────────────┴───────────┘

Legend: ✅ = Allowed, ❌ = Denied (403), - = Not applicable
```

## JWT Token Structure

```
┌──────────────────────────────────────────────────────────────────┐
│                         JWT TOKEN                                 │
├──────────────────────────────────────────────────────────────────┤
│  HEADER                                                           │
│  {                                                                │
│    "alg": "HS256",                                                │
│    "typ": "JWT"                                                   │
│  }                                                                │
├──────────────────────────────────────────────────────────────────┤
│  PAYLOAD                                                          │
│  {                                                                │
│    "sub": "user-uuid-1234",           ← User ID                  │
│    "email": "patient@example.com",    ← Email                    │
│    "role": "patient",                 ← ROLE (NEW!)              │
│    "iat": 1709337600,                 ← Issued at                │
│    "exp": 1709942400                  ← Expires at               │
│  }                                                                │
├──────────────────────────────────────────────────────────────────┤
│  SIGNATURE                                                        │
│  HMACSHA256(                                                      │
│    base64UrlEncode(header) + "." +                                │
│    base64UrlEncode(payload),                                      │
│    JWT_SECRET                                                     │
│  )                                                                │
└──────────────────────────────────────────────────────────────────┘
```

## Middleware Chain

```
Request Flow:
┌─────────┐      ┌──────────────┐      ┌───────────┐      ┌────────────┐
│ Client  │─────▶│authMiddleware│─────▶│ checkRole │─────▶│ Controller │
│ Request │      │(Authenticate)│      │(Authorize)│      │  Handler   │
└─────────┘      └──────────────┘      └───────────┘      └────────────┘
                        │                     │
                        │ No token            │ Wrong role
                        ▼                     ▼
                  ┌──────────┐          ┌──────────┐
                  │401 Error │          │403 Error │
                  │Unauthorized         │Forbidden │
                  └──────────┘          └──────────┘
```

## Database Schema

```
┌──────────────────────────────────────────────────────────────────┐
│                         users TABLE                               │
├──────────────────┬───────────────┬────────────────────────────────┤
│ Column           │ Type          │ Constraint                     │
├──────────────────┼───────────────┼────────────────────────────────┤
│ id               │ UUID          │ PRIMARY KEY                    │
│ name             │ VARCHAR       │ NOT NULL                       │
│ email            │ VARCHAR       │ UNIQUE, NOT NULL               │
│ password_hash    │ VARCHAR       │ NOT NULL                       │
│ role             │ user_role     │ NOT NULL, DEFAULT 'patient'    │
│ created_at       │ TIMESTAMP     │ DEFAULT NOW()                  │
└──────────────────┴───────────────┴────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      user_role ENUM                               │
├──────────────────────────────────────────────────────────────────┤
│  • patient       (Level 1)                                        │
│  • doctor        (Level 2)                                        │
│  • receptionist  (Level 3)                                        │
│  • admin         (Level 4)                                        │
└──────────────────────────────────────────────────────────────────┘
```

## File Structure

```
my-project/
│
├── migrations/
│   └── 001_add_role_to_users.sql       ← Database migration
│
├── src/
│   ├── shared/
│   │   ├── constants/
│   │   │   └── roles.js                ← Role definitions
│   │   └── errors/
│   │       └── AppError.js             ← Custom errors
│   │
│   ├── infra/
│   │   └── middlewares/
│   │       ├── authMiddleware.js       ← Authentication
│   │       └── checkRole.js            ← Authorization
│   │
│   ├── modules/
│   │   └── users/
│   │       ├── auth/
│   │       │   ├── auth.repo.js        ← Role in DB
│   │       │   ├── auth.service.js     ← Role in JWT
│   │       │   ├── auth.controller.js  ← Admin endpoints
│   │       │   └── auth.routes.js      ← Protected routes
│   │       │
│   │       ├── doctors/
│   │       │   ├── doctors.repo.js     ← CRUD operations
│   │       │   ├── doctors.service.js  ← Business logic
│   │       │   ├── doctors.controller.js
│   │       │   └── doctors.routes.js   ← Role-protected
│   │       │
│   │       └── appointments/
│   │           ├── appointments.repo.js    ← Role queries
│   │           ├── appointments.service.js ← Role filtering
│   │           ├── appointments.controller.js
│   │           └── appointments.routes.js  ← Multi-role
│   │
│   └── app.js                          ← Route registration
│
├── RBAC_GUIDE.md                       ← Full documentation
├── RBAC_TESTING.md                     ← Test scenarios
├── RBAC_SUMMARY.md                     ← Implementation summary
└── RBAC_ARCHITECTURE.md                ← This file
```

## Error Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                       ERROR SCENARIOS                             │
└──────────────────────────────────────────────────────────────────┘

Scenario 1: No Token
┌─────────┐      ┌──────────────┐      ┌──────────────┐
│ Request │─────▶│authMiddleware│─────▶│ 401 Response │
│ No Auth │      │   Rejects    │      │"Token required"
└─────────┘      └──────────────┘      └──────────────┘

Scenario 2: Invalid Token
┌─────────┐      ┌──────────────┐      ┌──────────────┐
│ Request │─────▶│authMiddleware│─────▶│ 401 Response │
│Bad Token│      │JWT.verify()  │      │"Invalid token"
└─────────┘      └──────────────┘      └──────────────┘

Scenario 3: Expired Token
┌─────────┐      ┌──────────────┐      ┌──────────────┐
│ Request │─────▶│authMiddleware│─────▶│ 401 Response │
│Old Token│      │exp < now     │      │"Token expired"
└─────────┘      └──────────────┘      └──────────────┘

Scenario 4: Wrong Role
┌─────────┐      ┌──────────────┐      ┌───────────┐      ┌──────────┐
│ Request │─────▶│authMiddleware│─────▶│ checkRole │─────▶│403 Error │
│Patient  │      │role=patient  │      │needs admin│      │"Access   │
│Token    │      │    ✅        │      │    ❌     │      │ Denied"  │
└─────────┘      └──────────────┘      └───────────┘      └──────────┘
```

## Security Layers

```
┌──────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Layer 1: Authentication (WHO are you?)                          │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  authMiddleware: Validates JWT token                    │     │
│  │  • Verifies signature                                   │     │
│  │  • Checks expiration                                    │     │
│  │  • Extracts user info (id, email, role)                │     │
│  └────────────────────────────────────────────────────────┘     │
│                          ▼                                        │
│  Layer 2: Authorization (WHAT can you do?)                       │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  checkRole: Validates permissions                       │     │
│  │  • Checks user role                                     │     │
│  │  • Compares with required roles                         │     │
│  │  • Allows or denies access                              │     │
│  └────────────────────────────────────────────────────────┘     │
│                          ▼                                        │
│  Layer 3: Data Filtering (SEE only YOUR data)                    │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Service/Repository: Filters queries                    │     │
│  │  • Patient: WHERE patient_id = user.id                  │     │
│  │  • Doctor: WHERE doctor_id = user.id                    │     │
│  │  • Admin: No filter (see all)                           │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

**Tip:** Use this diagram when explaining RBAC to team members or for reference during development!
