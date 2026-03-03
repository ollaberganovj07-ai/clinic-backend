# Database Migrations

Run these SQL scripts in your **Supabase SQL Editor**:  
https://app.supabase.com/project/YOUR-PROJECT/sql

## Order of Execution

1. **001_add_role_to_users.sql** – Adds `role` column to `users` table (if not already done)
2. **002_create_doctors_slots_appointments.sql** – Creates `doctors`, `slots`, and `appointments` tables with sample data

## 002_create_doctors_slots_appointments.sql

- Creates `doctors`, `slots`, and `appointments` tables
- Adds sample doctors: **Dr. Sobirov** (Cardiology), **Dr. Karimova** (General Medicine)
- Adds sample availability slots for Dr. Sobirov

**Important:** The `users` table must exist first (from your auth setup).
