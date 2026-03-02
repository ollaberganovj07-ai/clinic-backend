const { supabase } = require("../../../config/supabase");

/**
 * getAllDoctors - Fetch all doctors with optional specialization filter
 * @param {string} specialization - Optional specialization filter
 */
async function getAllDoctors(specialization) {
  let query = supabase
    .from('doctors')
    .select('*');

  if (specialization) {
    query = query.ilike('specialization', `%${specialization}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

/**
 * getDoctorById - Fetch doctor by ID with available slots
 * @param {string} doctorId - Doctor ID
 */
async function getDoctorById(doctorId) {
  const { data: doctor, error: doctorError } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', doctorId)
    .single();

  if (doctorError) {
    if (doctorError.code === 'PGRST116') {
      return null;
    }
    throw doctorError;
  }

  const { data: slots, error: slotsError } = await supabase
    .from('slots')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('is_booked', false)
    .order('slot_time', { ascending: true });

  if (slotsError) {
    throw slotsError;
  }

  return {
    ...doctor,
    available_slots: slots || []
  };
}

module.exports = { getAllDoctors, getDoctorById };
