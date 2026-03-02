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
      data: doctors
    });
  } catch (err) {
    console.error('❌ Error in getAllDoctors controller:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Full error object:', JSON.stringify(err, null, 2));
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
    console.error('Error stack:', err.stack);
    console.error('Full error object:', JSON.stringify(err, null, 2));
    return next(err);
  }
}

module.exports = { getAllDoctors, getDoctorById };
