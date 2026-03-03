-- ================================================
-- Migration: doctors, slots, appointments tables
-- ================================================
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/YOUR-PROJECT/sql

-- 1. doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  experience_years INTEGER,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. slots table
CREATE TABLE IF NOT EXISTS public.slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  slot_time TIMESTAMPTZ NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slots_doctor_id ON public.slots(doctor_id);
CREATE INDEX IF NOT EXISTS idx_slots_is_booked ON public.slots(is_booked);

-- 3. appointments table (requires users table to exist)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);

-- 4. Enable RLS (optional - disable if using service role key)
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 5. Allow service role full access (Supabase uses service role for backend)
CREATE POLICY "Service role full access doctors" ON public.doctors
  FOR ALL USING (true);

CREATE POLICY "Service role full access slots" ON public.slots
  FOR ALL USING (true);

CREATE POLICY "Service role full access appointments" ON public.appointments
  FOR ALL USING (true);

-- 6. Sample data: Dr. Sobirov and Dr. Karimova
INSERT INTO public.doctors (name, specialization, experience_years, phone, email)
SELECT 'Dr. Sobirov', 'Cardiology', 15, '+998901234567', 'sobirov@hospital.com'
WHERE NOT EXISTS (SELECT 1 FROM public.doctors WHERE name = 'Dr. Sobirov');

INSERT INTO public.doctors (name, specialization, experience_years, phone, email)
SELECT 'Dr. Karimova', 'General Medicine', 8, '+998902345678', 'karimova@hospital.com'
WHERE NOT EXISTS (SELECT 1 FROM public.doctors WHERE name = 'Dr. Karimova');

-- 7. Sample slots for Dr. Sobirov (fixed times for next 3 days)
DO $$
DECLARE
  doc_id UUID;
BEGIN
  SELECT id INTO doc_id FROM public.doctors WHERE name = 'Dr. Sobirov' LIMIT 1;
  IF doc_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.slots WHERE doctor_id = doc_id LIMIT 1) THEN
    INSERT INTO public.slots (doctor_id, slot_time, is_booked) VALUES
      (doc_id, CURRENT_DATE + 1 + time '09:00', false),
      (doc_id, CURRENT_DATE + 1 + time '10:00', false),
      (doc_id, CURRENT_DATE + 1 + time '11:00', false),
      (doc_id, CURRENT_DATE + 1 + time '14:00', false),
      (doc_id, CURRENT_DATE + 2 + time '09:00', false),
      (doc_id, CURRENT_DATE + 2 + time '10:00', false),
      (doc_id, CURRENT_DATE + 3 + time '09:00', false);
  END IF;
END $$;

-- ================================================
-- Verification
-- ================================================
-- SELECT * FROM public.doctors;
-- SELECT * FROM public.slots WHERE is_booked = false LIMIT 10;
-- SELECT * FROM public.appointments;
