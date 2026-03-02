const express = require("express");
const doctorsController = require("./doctors.controller");

const router = express.Router();

/**
 * GET /api/doctors
 * Get all doctors (with optional specialization query param)
 */
router.get("/", doctorsController.getAllDoctors);

/**
 * GET /api/doctors/:id
 * Get doctor by ID with available slots
 */
router.get("/:id", doctorsController.getDoctorById);

module.exports = router;
