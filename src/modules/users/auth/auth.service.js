// src/modules/users/auth/auth.service.js
const authRepo = require("./auth.repo");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function getJwtSecret() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET .env faylida topilmadi");
  return process.env.JWT_SECRET;
}

async function register({ name, email, password }) {
  // 1. Bazada bunday email bormi?
  const existing = await authRepo.findUserByEmail(email);
  if (existing) {
    const err = new Error("Bu email allaqachon ro'yxatdan o'tgan");
    err.status = 409;
    throw err;
  }

  // 2. Parolni xavfsiz xesh qilish
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Repo orqali bazaga saqlash
  const user = await authRepo.createUser({ name, email, passwordHash });

  // 4. Token yaratish
  const token = jwt.sign({ sub: user.id, email: user.email }, getJwtSecret(), { expiresIn: "7d" });

  return { user, token };
}

async function login({ email, password }) {
  // 1. Foydalanuvchini email orqali topish
  const user = await authRepo.findUserByEmail(email);
  if (!user) {
    const err = new Error("Email yoki parol noto'g'ri");
    err.status = 401;
    throw err;
  }

  // 2. Parolni tekshirish
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error("Email yoki parol noto'g'ri");
    err.status = 401;
    throw err;
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, getJwtSecret(), { expiresIn: "7d" });
  return { user: { id: user.id, name: user.name, email: user.email }, token };
}

module.exports = { register, login };