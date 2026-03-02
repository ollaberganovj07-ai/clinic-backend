// src/modules/users/auth/auth.repo.js
const { supabase } = require("../../../config/supabase");

/**
 * findUserByEmail - Email orqali foydalanuvchini topish
 */
async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  // PGRST116 - bu ma'lumot topilmaganligini anglatuvchi Supabase kodi.
  // Agar boshqa xato bo'lsa, uni tashqariga otamiz.
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
        password_hash: userData.passwordHash
      }
    ])
    .select('id, name, email')
    .single();

  if (error) {
    throw error;
  }
  return data;
}

module.exports = { findUserByEmail, createUser };