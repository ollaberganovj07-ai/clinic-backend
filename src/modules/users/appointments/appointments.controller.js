const appointmentsService = require("./appointments.service");
const { ROLES } = require("../../../shared/constants/roles");
const { ForbiddenError } = require("../../../shared/errors/AppError");

/**
 * POST /api/appointments
 * Create a new appointment (Patient creates for themselves)
 */
async function createAppointment(req, res, next) {
  try {
    const patientId = req.user.id;
    const { slot_id, reason } = req.body;

    if (!slot_id) {
      return res.status(400).json({
        success: false,
        message: "slot_id majburiy"
      });
    }

    const appointment = await appointmentsService.createAppointment(patientId, {
      slot_id,
      reason
    });

    return res.status(201).json({
      success: true,
      data: appointment,
      message: "Appointment muvaffaqiyatli yaratildi"
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/appointments/book-for-patient
 * Book appointment for any patient (Receptionist/Admin only)
 */
async function bookForPatient(req, res, next) {
  try {
    const { patient_id, slot_id, reason } = req.body;

    if (!patient_id || !slot_id) {
      return res.status(400).json({
        success: false,
        message: "patient_id va slot_id majburiy"
      });
    }

    const appointment = await appointmentsService.createAppointment(patient_id, {
      slot_id,
      reason
    });

    return res.status(201).json({
      success: true,
      data: appointment,
      message: "Appointment bemor uchun muvaffaqiyatli yaratildi"
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/appointments
 * Get appointments based on user role
 */
async function getAppointments(req, res, next) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let appointments;

    switch (userRole) {
      case ROLES.PATIENT:
        appointments = await appointmentsService.getAppointmentsByPatient(userId);
        break;
      case ROLES.DOCTOR:
        appointments = await appointmentsService.getAppointmentsByDoctor(userId);
        break;
      case ROLES.RECEPTIONIST:
      case ROLES.ADMIN:
        appointments = await appointmentsService.getAllAppointmentsForStaff();
        break;
      default:
        throw new ForbiddenError("Noto'g'ri rol");
    }

    return res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/appointments/all
 * Get all appointments (Receptionist/Admin only)
 */
async function getAllAppointments(req, res, next) {
  try {
    const appointments = await appointmentsService.getAllAppointmentsForStaff();

    return res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /api/appointments/:id
 * Cancel an appointment
 */
async function cancelAppointment(req, res, next) {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    let appointment;

    if (userRole === ROLES.RECEPTIONIST || userRole === ROLES.ADMIN) {
      appointment = await appointmentsService.cancelAnyAppointment(appointmentId);
    } else if (userRole === ROLES.PATIENT) {
      appointment = await appointmentsService.cancelAppointment(appointmentId, userId);
    } else {
      throw new ForbiddenError("Appointment bekor qilish huquqi yo'q");
    }

    return res.status(200).json({
      success: true,
      message: "Appointment bekor qilindi",
      data: appointment
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createAppointment,
  bookForPatient,
  getAppointments,
  getAllAppointments,
  cancelAppointment
};
