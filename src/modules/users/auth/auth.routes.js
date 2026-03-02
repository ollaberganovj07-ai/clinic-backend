const express = require("express");
const authController = require("./auth.controller");
const authMiddleware = require("../../../infra/middlewares/authMiddleware");
const { checkRole } = require("../../../infra/middlewares/checkRole");
const { ROLES } = require("../../../shared/constants/roles");

const router = express.Router();

/**
 * POST /api/auth/register
 * Public route - default role is 'patient'
 */
router.post("/register", authController.register);

/**
 * POST /api/auth/login
 * Public route
 */
router.post("/login", authController.login);

/**
 * GET /api/auth/users
 * Get all users (Admin only)
 */
router.get(
  "/users",
  authMiddleware,
  checkRole(ROLES.ADMIN),
  authController.getAllUsers
);

/**
 * PUT /api/auth/users/:userId/role
 * Update user role (Admin only)
 */
router.put(
  "/users/:userId/role",
  authMiddleware,
  checkRole(ROLES.ADMIN),
  authController.updateUserRole
);

module.exports = router;