const { supabase } = require("../../../config/supabase");

/**
 * getAllDoctors - Fetch all doctors with optional specialization filter
 * @param {string} specialization - Optional specialization filter
 */
async function getAllDoctors(specialization) {
  try {
    console.log('🔄 Repository: Querying doctors from Supabase...');
    
    let query = supabase
      .from('doctors')
      .select('*');

    if (specialization) {
      console.log('🔍 Filtering by specialization:', specialization);
      query = query.ilike('specialization', `%${specialization}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Supabase query error:', error);
      throw error;
    }

    console.log(`✅ Repository: Retrieved ${data?.length || 0} doctors`);
    return data;
  } catch (err) {
    console.error('❌ Repository error in getAllDoctors:');
    console.error('Error details:', err);
    throw err;
  }
}

/**
 * getDoctorById - Fetch doctor by ID with available slots
 * @param {string} doctorId - Doctor ID
 */
async function getDoctorById(doctorId) {
  try {
    console.log('🔄 Repository: Fetching doctor by ID:', doctorId);
    
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', doctorId)
      .single();

    if (doctorError) {
      if (doctorError.code === 'PGRST116') {
        console.log('⚠️ Doctor not found with ID:', doctorId);
        return null;
      }
      console.error('❌ Error fetching doctor:', doctorError);
      throw doctorError;
    }

    console.log('✅ Doctor found, fetching slots...');

    const { data: slots, error: slotsError } = await supabase
      .from('slots')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('is_booked', false)
      .order('slot_time', { ascending: true });

    if (slotsError) {
      console.error('❌ Error fetching slots:', slotsError);
      throw slotsError;
    }

    console.log(`✅ Retrieved ${slots?.length || 0} available slots`);

    return {
      ...doctor,
      available_slots: slots || []
    };
  } catch (err) {
    console.error('❌ Repository error in getDoctorById:');
    console.error('Error details:', err);
    throw err;
  }
}

/**
 * createDoctor - Create a new doctor
 * @param {object} doctorData - Doctor information
 */
async function createDoctor(doctorData) {
  const { data, error } = await supabase
    .from('doctors')
    .insert([doctorData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * updateDoctor - Update doctor information
 * @param {string} doctorId - Doctor ID
 * @param {object} updateData - Updated information
 */
async function updateDoctor(doctorId, updateData) {
  const { data, error } = await supabase
    .from('doctors')
    .update(updateData)
    .eq('id', doctorId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * deleteDoctor - Delete a doctor
 * @param {string} doctorId - Doctor ID
 */
async function deleteDoctor(doctorId) {
  const { data, error } = await supabase
    .from('doctors')
    .delete()
    .eq('id', doctorId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

module.exports = { 
  getAllDoctors, 
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};
