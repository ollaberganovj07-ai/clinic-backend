const appointmentsRepo = require("./appointments.repo");

/**
 * createAppointment - Service layer for creating an appointment
 * @param {string} patientId - Patient ID from JWT
 * @param {object} appointmentData - { slot_id, reason }
 */
async function createAppointment(patientId, appointmentData) {
  const { slot_id, reason } = appointmentData;

  if (!slot_id) {
    const err = new Error("slot_id majburiy");
    err.status = 400;
    throw err;
  }

  const appointment = await appointmentsRepo.createAppointment({
    patient_id: patientId,
    slot_id,
    reason
  });

  return appointment;
}

/**
 * getMyAppointments - Get all appointments for the authenticated patient
 * @param {string} patientId - Patient ID from JWT
 */
async function getMyAppointments(patientId) {
  const appointments = await appointmentsRepo.getAppointmentsByPatient(patientId);
  return appointments;
}

/**
 * cancelAppointment - Cancel an appointment
 * @param {string} appointmentId - Appointment ID
 * @param {string} patientId - Patient ID from JWT
 */
async function cancelAppointment(appointmentId, patientId) {
  const appointment = await appointmentsRepo.cancelAppointment(appointmentId, patientId);

  if (!appointment) {
    const err = new Error("Appointment topilmadi yoki sizga tegishli emas");
    err.status = 404;
    throw err;
  }

  return appointment;
}

module.exports = {
  createAppointment,
  getMyAppointments,
  cancelAppointment
};
