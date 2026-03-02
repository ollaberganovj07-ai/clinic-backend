const doctorsRepo = require("./doctors.repo");

/**
 * getAllDoctors - Service layer for fetching all doctors
 * @param {string} specialization - Optional specialization filter
 */
async function getAllDoctors(specialization) {
  const doctors = await doctorsRepo.getAllDoctors(specialization);
  return doctors;
}

/**
 * getDoctorById - Service layer for fetching doctor by ID
 * @param {string} doctorId - Doctor ID
 */
async function getDoctorById(doctorId) {
  const doctor = await doctorsRepo.getDoctorById(doctorId);
  
  if (!doctor) {
    const err = new Error("Doktor topilmadi");
    err.status = 404;
    throw err;
  }

  return doctor;
}

module.exports = { getAllDoctors, getDoctorById };
