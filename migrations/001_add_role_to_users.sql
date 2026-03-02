-- ================================================
-- RBAC Migration: Add role column to users table
-- ================================================
-- Run this SQL in your Supabase SQL Editor
-- https://app.supabase.com/project/YOUR-PROJECT/sql

-- 1. Create ENUM type for user roles
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'receptionist', 'admin');

-- 2. Add role column to users table with default value 'patient'
ALTER TABLE users 
ADD COLUMN role user_role NOT NULL DEFAULT 'patient';

-- 3. Create index on role column for faster queries
CREATE INDEX idx_users_role ON users(role);

-- 4. Update existing users to have 'patient' role if not set
UPDATE users SET role = 'patient' WHERE role IS NULL;

-- 5. Optional: Create a function to check if user has required role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Optional: Create admin user (update email and password as needed)
-- INSERT INTO users (name, email, password_hash, role)
-- VALUES (
--   'System Admin',
--   'admin@example.com',
--   '$2a$10$...', -- bcrypt hash of your password
--   'admin'
-- );

-- ================================================
-- Verification Queries
-- ================================================
-- Check the role column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- View all users with their roles
SELECT id, name, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- Count users by role
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
