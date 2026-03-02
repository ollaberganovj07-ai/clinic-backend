const express = require("express");
const doctorsController = require("./doctors.controller");
const authMiddleware = require("../../../infra/middlewares/authMiddleware");
const { checkRole } = require("../../../infra/middlewares/checkRole");
const { ROLES } = require("../../../shared/constants/roles");

const router = express.Router();

/**
 * GET /api/doctors
 * Get all doctors (with optional specialization query param)
 * Public route - all authenticated users can view doctors
 */
router.get("/", authMiddleware, doctorsController.getAllDoctors);

/**
 * GET /api/doctors/:id
 * Get doctor by ID with available slots
 * Public route - all authenticated users can view doctor details
 */
router.get("/:id", authMiddleware, doctorsController.getDoctorById);

/**
 * POST /api/doctors
 * Create a new doctor profile (Admin only)
 */
router.post(
  "/",
  authMiddleware,
  checkRole(ROLES.ADMIN),
  doctorsController.createDoctor
);

/**
 * PUT /api/doctors/:id
 * Update doctor profile (Admin only)
 */
router.put(
  "/:id",
  authMiddleware,
  checkRole(ROLES.ADMIN),
  doctorsController.updateDoctor
);

/**
 * DELETE /api/doctors/:id
 * Delete doctor (Admin only)
 */
router.delete(
  "/:id",
  authMiddleware,
  checkRole(ROLES.ADMIN),
  doctorsController.deleteDoctor
);

module.exports = router;
