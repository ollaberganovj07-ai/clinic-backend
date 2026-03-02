// src/modules/users/auth/auth.repo.js
const { supabase } = require("../../../config/supabase");
const { ROLES } = require("../../../shared/constants/roles");

/**
 * findUserByEmail - Email orqali foydalanuvchini topish
 */
async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, password_hash, role, created_at')
    .eq('email', email)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data;
}

/**
 * findUserById - ID orqali foydalanuvchini topish
 */
async function findUserById(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .eq('id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data;
}

/**
 * createUser - Yangi foydalanuvchi yaratish
 */
async function createUser(userData) {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        name: userData.name,
        email: userData.email,
        password_hash: userData.passwordHash,
        role: userData.role || ROLES.PATIENT
      }
    ])
    .select('id, name, email, role')
    .single();

  if (error) {
    throw error;
  }
  return data;
}

/**
 * updateUserRole - Foydalanuvchi rolini yangilash (Admin only)
 */
async function updateUserRole(userId, newRole) {
  const { data, error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId)
    .select('id, name, email, role')
    .single();

  if (error) {
    throw error;
  }
  return data;
}

/**
 * getAllUsers - Barcha foydalanuvchilarni olish (Admin only)
 */
async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  return data;
}

module.exports = { 
  findUserByEmail, 
  findUserById,
  createUser,
  updateUserRole,
  getAllUsers
};