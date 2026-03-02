const { supabase } = require("../../../config/supabase");
const { ConflictError } = require("../../../shared/errors/AppError");

/**
 * checkSlotAvailability - Check if a slot is still available
 * @param {string} slotId - Slot ID
 */
async function checkSlotAvailability(slotId) {
  const { data, error } = await supabase
    .from('slots')
    .select('*')
    .eq('id', slotId)
    .eq('is_booked', false)
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
 * createAppointment - Create appointment with transaction-safe slot booking
 * @param {object} appointmentData - { patient_id, slot_id, reason }
 */
async function createAppointment(appointmentData) {
  const { patient_id, slot_id, reason } = appointmentData;

  const slot = await checkSlotAvailability(slot_id);
  if (!slot) {
    throw new ConflictError("Slot mavjud emas yoki allaqachon band qilingan");
  }

  const { data: updatedSlot, error: updateError } = await supabase
    .from('slots')
    .update({ is_booked: true })
    .eq('id', slot_id)
    .eq('is_booked', false)
    .select()
    .single();

  if (updateError || !updatedSlot) {
    throw new ConflictError("Slot boshqa bemor tomonidan band qilindi");
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert([
      {
        patient_id,
        slot_id,
        doctor_id: slot.doctor_id,
        reason: reason || null,
        status: 'confirmed'
      }
    ])
    .select()
    .single();

  if (appointmentError) {
    await supabase
      .from('slots')
      .update({ is_booked: false })
      .eq('id', slot_id);
    
    throw appointmentError;
  }

  return appointment;
}

/**
 * getAppointmentsByPatient - Get all appointments for a patient
 * @param {string} patientId - Patient ID
 */
async function getAppointmentsByPatient(patientId) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors(*),
      slot:slots(*)
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * getAppointmentsByDoctor - Get all appointments for a doctor
 * @param {string} doctorId - Doctor ID
 */
async function getAppointmentsByDoctor(doctorId) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:users!appointments_patient_id_fkey(id, name, email),
      slot:slots(*)
    `)
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * getAllAppointments - Get all appointments (for staff)
 */
async function getAllAppointments() {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:users!appointments_patient_id_fkey(id, name, email),
      doctor:doctors(*),
      slot:slots(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * cancelAppointment - Cancel an appointment and free the slot
 * @param {string} appointmentId - Appointment ID
 * @param {string} patientId - Patient ID (for authorization)
 */
async function cancelAppointment(appointmentId, patientId) {
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*, slot:slots(*)')
    .eq('id', appointmentId)
    .eq('patient_id', patientId)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return null;
    }
    throw fetchError;
  }

  const { error: updateAppointmentError } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId);

  if (updateAppointmentError) {
    throw updateAppointmentError;
  }

  const { error: updateSlotError } = await supabase
    .from('slots')
    .update({ is_booked: false })
    .eq('id', appointment.slot_id);

  if (updateSlotError) {
    throw updateSlotError;
  }

  return appointment;
}

/**
 * cancelAnyAppointment - Cancel any appointment (staff only)
 * @param {string} appointmentId - Appointment ID
 */
async function cancelAnyAppointment(appointmentId) {
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*, slot:slots(*)')
    .eq('id', appointmentId)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return null;
    }
    throw fetchError;
  }

  const { error: updateAppointmentError } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId);

  if (updateAppointmentError) {
    throw updateAppointmentError;
  }

  const { error: updateSlotError } = await supabase
    .from('slots')
    .update({ is_booked: false })
    .eq('id', appointment.slot_id);

  if (updateSlotError) {
    throw updateSlotError;
  }

  return appointment;
}

module.exports = {
  checkSlotAvailability,
  createAppointment,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  getAllAppointments,
  cancelAppointment,
  cancelAnyAppointment
};
