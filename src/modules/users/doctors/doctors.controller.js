const doctorsService = require("./doctors.service");

/**
 * GET /api/doctors
 * Get all doctors with optional specialization filter
 */
async function getAllDoctors(req, res, next) {
  try {
    const specialization = req.query.specialization || null;
    
    const doctors = await doctorsService.getAllDoctors(specialization);
    
    return res.status(200).json({
      success: true,
      data: doctors
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/doctors/:id
 * Get doctor by ID with available slots
 */
async function getDoctorById(req, res, next) {
  try {
    const doctorId = req.params.id;
    
    const doctor = await doctorsService.getDoctorById(doctorId);
    
    return res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getAllDoctors, getDoctorById };
