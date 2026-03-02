const { supabase } = require("../../../config/supabase");

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
    const err = new Error("Slot mavjud emas yoki allaqachon band qilingan");
    err.status = 409;
    throw err;
  }

  const { data: updatedSlot, error: updateError } = await supabase
    .from('slots')
    .update({ is_booked: true })
    .eq('id', slot_id)
    .eq('is_booked', false)
    .select()
    .single();

  if (updateError || !updatedSlot) {
    const err = new Error("Slot boshqa bemor tomonidan band qilindi");
    err.status = 409;
    throw err;
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

module.exports = {
  checkSlotAvailability,
  createAppointment,
  getAppointmentsByPatient,
  cancelAppointment
};
