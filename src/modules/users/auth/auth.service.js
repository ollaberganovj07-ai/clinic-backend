// src/modules/users/auth/auth.service.js
const authRepo = require("./auth.repo");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ROLES, isValidRole } = require("../../../shared/constants/roles");
const { ConflictError, UnauthorizedError, ValidationError } = require("../../../shared/errors/AppError");

function getJwtSecret() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET .env faylida topilmadi");
  return process.env.JWT_SECRET;
}

async function register({ name, email, password, role = ROLES.PATIENT }) {
  const existing = await authRepo.findUserByEmail(email);
  if (existing) {
    throw new ConflictError("Bu email allaqachon ro'yxatdan o'tgan");
  }

  if (role && !isValidRole(role)) {
    throw new ValidationError("Noto'g'ri role qiymati");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await authRepo.createUser({ name, email, passwordHash, role });

  const token = jwt.sign(
    { 
      sub: user.id, 
      email: user.email,
      role: user.role
    }, 
    getJwtSecret(), 
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return { user, token };
}

async function login({ phone, password }) {
  const user = await authRepo.findUserByPhone(phone);
  if (!user) {
    throw new UnauthorizedError("Telefon raqam yoki parol noto'g'ri");
  }

  if (!user.password_hash) {
    throw new UnauthorizedError("Telefon raqam yoki parol noto'g'ri");
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new UnauthorizedError("Telefon raqam yoki parol noto'g'ri");
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email || null,
      phone: user.phone_number,
      role: user.role
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role
    },
    token
  };
}

async function updateUserRole(adminId, targetUserId, newRole) {
  if (!isValidRole(newRole)) {
    throw new ValidationError("Noto'g'ri role qiymati");
  }

  const admin = await authRepo.findUserById(adminId);
  if (!admin || admin.role !== ROLES.ADMIN) {
    throw new UnauthorizedError("Faqat admin foydalanuvchilar role o'zgartira oladi");
  }

  const updatedUser = await authRepo.updateUserRole(targetUserId, newRole);
  return updatedUser;
}

async function getAllUsers() {
  const users = await authRepo.getAllUsers();
  return users;
}

async function getPatients() {
  const patients = await authRepo.getPatients();
  return patients;
}

module.exports = { 
  register, 
  login,
  updateUserRole,
  getAllUsers,
  getPatients
};