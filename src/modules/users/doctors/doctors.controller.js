const doctorsService = require("./doctors.service");

/**
 * GET /api/doctors
 * Get all doctors with optional specialization filter
 */
async function getAllDoctors(req, res, next) {
  try {
    const specialization = req.query.specialization || null;
    
    console.log('📋 Fetching doctors with specialization:', specialization || 'all');
    
    const doctors = await doctorsService.getAllDoctors(specialization);
    
    console.log(`✅ Successfully fetched ${doctors.length} doctors`);
    
    return res.status(200).json({
      success: true,
      data: doctors,
      count: doctors.length
    });
  } catch (err) {
    console.error('❌ Error in getAllDoctors controller:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
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
    
    console.log('🔍 Fetching doctor with ID:', doctorId);
    
    const doctor = await doctorsService.getDoctorById(doctorId);
    
    console.log('✅ Successfully fetched doctor:', doctor.id);
    
    return res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (err) {
    console.error('❌ Error in getDoctorById controller:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    return next(err);
  }
}

/**
 * POST /api/doctors
 * Create a new doctor (Admin only)
 */
async function createDoctor(req, res, next) {
  try {
    const doctorData = req.body;
    
    const doctor = await doctorsService.createDoctor(doctorData);
    
    return res.status(201).json({
      success: true,
      data: doctor,
      message: "Doktor muvaffaqiyatli yaratildi"
    });
  } catch (err) {
    console.error('❌ Error in createDoctor:', err.message);
    return next(err);
  }
}

/**
 * PUT /api/doctors/:id
 * Update doctor profile (Admin only)
 */
async function updateDoctor(req, res, next) {
  try {
    const doctorId = req.params.id;
    const updateData = req.body;
    
    const doctor = await doctorsService.updateDoctor(doctorId, updateData);
    
    return res.status(200).json({
      success: true,
      data: doctor,
      message: "Doktor ma'lumotlari yangilandi"
    });
  } catch (err) {
    console.error('❌ Error in updateDoctor:', err.message);
    return next(err);
  }
}

/**
 * DELETE /api/doctors/:id
 * Delete doctor (Admin only)
 */
async function deleteDoctor(req, res, next) {
  try {
    const doctorId = req.params.id;
    
    await doctorsService.deleteDoctor(doctorId);
    
    return res.status(200).json({
      success: true,
      message: "Doktor o'chirildi"
    });
  } catch (err) {
    console.error('❌ Error in deleteDoctor:', err.message);
    return next(err);
  }
}

module.exports = { 
  getAllDoctors, 
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};
