const doctorsRepo = require("./doctors.repo");
const { NotFoundError, ValidationError } = require("../../../shared/errors/AppError");

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
    throw new NotFoundError("Doktor topilmadi");
  }

  return doctor;
}

/**
 * createDoctor - Create a new doctor
 * @param {object} doctorData - Doctor information
 */
async function createDoctor(doctorData) {
  const { name, specialization, experience_years, phone, email } = doctorData;

  if (!name || !specialization) {
    throw new ValidationError("name va specialization majburiy");
  }

  const doctor = await doctorsRepo.createDoctor({
    name,
    specialization,
    experience_years,
    phone,
    email
  });

  return doctor;
}

/**
 * updateDoctor - Update doctor information
 * @param {string} doctorId - Doctor ID
 * @param {object} updateData - Updated information
 */
async function updateDoctor(doctorId, updateData) {
  const doctor = await doctorsRepo.updateDoctor(doctorId, updateData);

  if (!doctor) {
    throw new NotFoundError("Doktor topilmadi");
  }

  return doctor;
}

/**
 * deleteDoctor - Delete a doctor
 * @param {string} doctorId - Doctor ID
 */
async function deleteDoctor(doctorId) {
  const deleted = await doctorsRepo.deleteDoctor(doctorId);

  if (!deleted) {
    throw new NotFoundError("Doktor topilmadi");
  }

  return deleted;
}

module.exports = { 
  getAllDoctors, 
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};
