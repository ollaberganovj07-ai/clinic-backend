const express = require("express");
const appointmentsController = require("./appointments.controller");
const authMiddleware = require("../../../infra/middlewares/authMiddleware");

const router = express.Router();

/**
 * POST /api/appointments
 * Create a new appointment (requires authentication)
 */
router.post("/", authMiddleware, appointmentsController.createAppointment);

/**
 * GET /api/appointments
 * Get all appointments for the authenticated patient
 */
router.get("/", authMiddleware, appointmentsController.getMyAppointments);

/**
 * DELETE /api/appointments/:id
 * Cancel an appointment (requires authentication)
 */
router.delete("/:id", authMiddleware, appointmentsController.cancelAppointment);

module.exports = router;
