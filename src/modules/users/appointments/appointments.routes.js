const express = require("express");
const appointmentsController = require("./appointments.controller");
const authMiddleware = require("../../../infra/middlewares/authMiddleware");
const { checkRole } = require("../../../infra/middlewares/checkRole");
const { ROLES } = require("../../../shared/constants/roles");

const router = express.Router();

/**
 * POST /api/appointments
 * Create a new appointment (Patient only - books for themselves)
 */
router.post(
  "/", 
  authMiddleware, 
  checkRole(ROLES.PATIENT),
  appointmentsController.createAppointment
);

/**
 * POST /api/appointments/book-for-patient
 * Book appointment for any patient (Receptionist/Admin only)
 */
router.post(
  "/book-for-patient",
  authMiddleware,
  checkRole(ROLES.RECEPTIONIST, ROLES.ADMIN),
  appointmentsController.bookForPatient
);

/**
 * GET /api/appointments
 * Get appointments based on role:
 * - Patient: own appointments only
 * - Doctor: appointments with them
 * - Receptionist/Admin: all appointments
 */
router.get(
  "/", 
  authMiddleware, 
  appointmentsController.getAppointments
);

/**
 * GET /api/appointments/all
 * Get all appointments (Receptionist/Admin only)
 */
router.get(
  "/all",
  authMiddleware,
  checkRole(ROLES.RECEPTIONIST, ROLES.ADMIN),
  appointmentsController.getAllAppointments
);

/**
 * DELETE /api/appointments/:id
 * Cancel an appointment
 * - Patient: can cancel own appointments
 * - Receptionist/Admin: can cancel any appointment
 */
router.delete(
  "/:id", 
  authMiddleware, 
  appointmentsController.cancelAppointment
);

module.exports = router;
