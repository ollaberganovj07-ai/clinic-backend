const { supabase } = require("../../../config/supabase");
const { ConflictError } = require("../../../shared/errors/AppError");

async function getDoctorAppointmentsForToday(doctorId) {
const today = new Date().toISOString().split('T')[0];
const { data, error } = await supabase
.from('appointments')
.select('id')
.eq('doctor_id', doctorId)
.gte('created_at', `${today}T00:00:00Z`)
.lte('created_at', `${today}T23:59:59Z`);
if (error) throw error;
return data;
}

async function checkSlotAvailability(slotId) {
const { data, error } = await supabase
.from('slots')
.select('*')
.eq('id', slotId)
.eq('is_booked', false)
.single();
if (error) {
if (error.code === 'PGRST116') return null;
throw error;
}
return data;
}

async function createAppointment(appointmentData) {
const { patient_id, slot_id, doctor_id, reason, queue_number } = appointmentData;
const slot = await checkSlotAvailability(slot_id);
if (!slot) {
throw new ConflictError("Slot mavjud emas yoki band qilingan");
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
doctor_id: doctor_id || slot.doctor_id,
reason: reason || null,
queue_number,
status: 'confirmed'
}
])
.select()
.single();
if (appointmentError) {
await supabase.from('slots').update({ is_booked: false }).eq('id', slot_id);
throw appointmentError;
}
return appointment;
}

async function getAppointmentsByDoctor(doctorId) {
const { data, error } = await supabase
.from('appointments')
.select('*, patient:users!appointments_patient_id_fkey(id, name, email, phone_number), slot:slots(id, slot_time)')
.eq('doctor_id', doctorId)
.order('created_at', { ascending: false });
if (error) throw error;
return data;
}

async function getAllAppointments() {
const { data, error } = await supabase
.from('appointments')
.select('*, patient:users!appointments_patient_id_fkey(id, name, email, phone_number), doctor:doctors(), slot:slots(id, slot_time)')
.order('created_at', { ascending: false });
if (error) throw error;
return data;
}

async function cancelAppointment(appointmentId, patientId) {
const { data: appointment, error: fetchError } = await supabase
.from('appointments')
.select('*, slot:slots(*)')
.eq('id', appointmentId)
.eq('patient_id', patientId)
.single();
if (fetchError) throw fetchError;
await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appointmentId);
await supabase.from('slots').update({ is_booked: false }).eq('id', appointment.slot_id);
return appointment;
}

module.exports = {
getDoctorAppointmentsForToday,
checkSlotAvailability,
createAppointment,
getAppointmentsByDoctor,
getAllAppointments,
cancelAppointment
};