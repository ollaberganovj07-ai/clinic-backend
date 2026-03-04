// src/modules/users/auth/auth.repo.js
const { supabase } = require('../../../config/supabase');
const { ROLES } = require('../../../shared/constants/roles');

async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, password_hash, role, created_at, phone_number')
    .eq('email', email)
    .single();
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data;
}

/**
 * findUserByPhone - Telefon raqami orqali foydalanuvchini topish (login uchun)
 */
async function findUserByPhone(phone) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, phone_number, password_hash, role, created_at')
    .eq('phone_number', phone)
    .single();
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data;
}

async function findUserById(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at, phone_number')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data;
}

async function createUser(userData) {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      name: userData.name,
      email: userData.email || null, // Email ixtiyoriy bo'lishi mumkin
      phone_number: userData.phoneNumber, // Telefon raqami qo'shildi
      password_hash: userData.passwordHash || null,
      role: userData.role || ROLES.PATIENT,
    }])
    .select('id, name, email, phone_number, role')
    .single();
  if (error) {
    throw error;
  }
  return data;
}

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

async function getPatients() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, phone_number, role, created_at')
    .eq('role', ROLES.PATIENT)
    .order('name', { ascending: true });
  if (error) {
    throw error;
  }
  return data;
}

async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, phone_number, role, created_at')
    .order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return data;
}

module.exports = {
  findUserByEmail,
  findUserByPhone, // Eksportga qo'shildi
  findUserById,
  createUser,
  updateUserRole,
  getAllUsers,
  getPatients,
};
