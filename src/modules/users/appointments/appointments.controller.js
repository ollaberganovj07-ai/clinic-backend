const appointmentsService = require("./appointments.service");

/**
 * POST /api/appointments
 * Create a new appointment (authenticated)
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
      data: appointment
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/appointments
 * Get all appointments for the authenticated patient
 */
async function getMyAppointments(req, res, next) {
  try {
    const patientId = req.user.id;

    const appointments = await appointmentsService.getMyAppointments(patientId);

    return res.status(200).json({
      success: true,
      data: appointments
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
    const patientId = req.user.id;
    const appointmentId = req.params.id;

    const appointment = await appointmentsService.cancelAppointment(appointmentId, patientId);

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
  getMyAppointments,
  cancelAppointment
};
