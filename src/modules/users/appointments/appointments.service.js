const appointmentsRepo = require("./appointments.repo");
const { ValidationError, NotFoundError } = require("../../../shared/errors/AppError");

/**
 * createAppointment - Service layer for creating an appointment
 * @param {string} patientId - Patient ID from JWT
 * @param {object} appointmentData - { slot_id, reason }
 */
async function createAppointment(patientId, appointmentData) {
  const { slot_id, reason } = appointmentData;

  if (!slot_id) {
    throw new ValidationError("slot_id majburiy");
  }

  const appointment = await appointmentsRepo.createAppointment({
    patient_id: patientId,
    slot_id,
    reason
  });

  return appointment;
}

/**
 * getAppointmentsByPatient - Get all appointments for a specific patient
 * @param {string} patientId - Patient ID
 */
async function getAppointmentsByPatient(patientId) {
  const appointments = await appointmentsRepo.getAppointmentsByPatient(patientId);
  return appointments;
}

/**
 * getAppointmentsByDoctor - Get all appointments for a specific doctor
 * @param {string} doctorId - Doctor ID
 */
async function getAppointmentsByDoctor(doctorId) {
  const appointments = await appointmentsRepo.getAppointmentsByDoctor(doctorId);
  return appointments;
}

/**
 * getAllAppointmentsForStaff - Get all appointments (Receptionist/Admin)
 */
async function getAllAppointmentsForStaff() {
  const appointments = await appointmentsRepo.getAllAppointments();
  return appointments;
}

/**
 * cancelAppointment - Cancel an appointment (patient cancels their own)
 * @param {string} appointmentId - Appointment ID
 * @param {string} patientId - Patient ID from JWT
 */
async function cancelAppointment(appointmentId, patientId) {
  const appointment = await appointmentsRepo.cancelAppointment(appointmentId, patientId);

  if (!appointment) {
    throw new NotFoundError("Appointment topilmadi yoki sizga tegishli emas");
  }

  return appointment;
}

/**
 * cancelAnyAppointment - Cancel any appointment (Receptionist/Admin)
 * @param {string} appointmentId - Appointment ID
 */
async function cancelAnyAppointment(appointmentId) {
  const appointment = await appointmentsRepo.cancelAnyAppointment(appointmentId);

  if (!appointment) {
    throw new NotFoundError("Appointment topilmadi");
  }

  return appointment;
}

module.exports = {
  createAppointment,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  getAllAppointmentsForStaff,
  cancelAppointment,
  cancelAnyAppointment
};
