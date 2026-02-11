-- =============================================
-- Phase 5: Student Hostel Joining System
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- MODIFY HOSTELS TABLE
-- =============================================

-- Add hostel_code for unique joining
ALTER TABLE public.hostels
ADD COLUMN IF NOT EXISTS hostel_code TEXT UNIQUE;

-- Add logo_url for hostel branding
ALTER TABLE public.hostels
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Generate hostel codes for existing hostels
UPDATE public.hostels
SET hostel_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))
WHERE hostel_code IS NULL;

-- Make hostel_code NOT NULL after populating
ALTER TABLE public.hostels
ALTER COLUMN hostel_code SET NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_hostels_code ON public.hostels(hostel_code);

-- =============================================
-- CREATE STUDENT_PROFILES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  parent_phone TEXT,
  college_or_workplace TEXT,
  floor_number TEXT,
  room_number TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One student can only join one hostel
  CONSTRAINT unique_student UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STUDENT_PROFILES RLS POLICIES
-- =============================================

-- Students can read their own profile
CREATE POLICY "Students can read own profile"
  ON public.student_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Students can insert their own profile (only role='student')
CREATE POLICY "Students can create profile"
  ON public.student_profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'student'
    ) AND
    EXISTS (
      SELECT 1 FROM public.hostels 
      WHERE id = hostel_id AND is_approved = true
    )
  );

-- Students can update their own profile
CREATE POLICY "Students can update own profile"
  ON public.student_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Owners can read profiles of students in their hostels
CREATE POLICY "Owners can read hostel students"
  ON public.student_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hostels 
      WHERE id = hostel_id AND owner_id = auth.uid()
    )
  );

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.student_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- HELPER FUNCTION: Generate unique hostel code
-- =============================================

CREATE OR REPLACE FUNCTION public.generate_hostel_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-char uppercase alphanumeric code
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM public.hostels WHERE hostel_code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGER: Auto-generate hostel code on insert
-- =============================================

CREATE OR REPLACE FUNCTION public.set_hostel_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hostel_code IS NULL THEN
    NEW.hostel_code := public.generate_hostel_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_hostel_insert_code
  BEFORE INSERT ON public.hostels
  FOR EACH ROW
  EXECUTE FUNCTION public.set_hostel_code();

-- =============================================
-- Instructions:
-- 1. Run this script in Supabase SQL Editor
-- 2. Existing hostels will get auto-generated codes
-- 3. New hostels will auto-generate codes on insert
-- =============================================
