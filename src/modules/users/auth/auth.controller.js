const authService = require("./auth.service");
const { ROLES } = require("../../../shared/constants/roles");

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const role = req.body.role || ROLES.PATIENT;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "email, password, name are required",
      });
    }

    const result = await authService.register({ email, password, name, role });
    return res.status(201).json({ 
      success: true, 
      data: result,
      message: "Ro'yxatdan o'tish muvaffaqiyatli"
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const result = await authService.login({ email, password });
    return res.status(200).json({ 
      success: true, 
      data: result,
      message: "Kirish muvaffaqiyatli"
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/auth/patients
 * Get patients list (Receptionist/Admin)
 */
async function getPatients(req, res, next) {
  try {
    const patients = await authService.getPatients();
    return res.status(200).json({
      success: true,
      data: patients,
      count: patients.length
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/auth/users
 * Get all users (Admin only)
 */
async function getAllUsers(req, res, next) {
  try {
    const users = await authService.getAllUsers();
    return res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUT /api/auth/users/:userId/role
 * Update user role (Admin only)
 */
async function updateUserRole(req, res, next) {
  try {
    const adminId = req.user.id;
    const targetUserId = req.params.userId;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "role majburiy"
      });
    }

    const updatedUser = await authService.updateUserRole(adminId, targetUserId, role);
    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Foydalanuvchi roli yangilandi"
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { 
  register, 
  login,
  getPatients,
  getAllUsers,
  updateUserRole
};