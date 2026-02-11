-- =============================================
-- MASTER FIX SCRIPT
-- Run this ENTIRE script in Supabase SQL Editor
-- =============================================

-- 1. FIX RLS RECURSION ON USERS TABLE
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;

-- Recreate simple policies
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. CREATE STUDENT_PROFILES TABLE IDEMPOTENTLY
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
  CONSTRAINT unique_student UNIQUE (user_id)
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- 3. ENSURE HOSTEL COLUMNS EXIST
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS hostel_code TEXT UNIQUE;
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.hostels ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- 4. FILL HOSTEL CODES & APPROVE HOSTELS
UPDATE public.hostels 
SET hostel_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)) 
WHERE hostel_code IS NULL;

-- Make not null after fill
ALTER TABLE public.hostels ALTER COLUMN hostel_code SET NOT NULL;

-- 5. APPROVE ALL HOSTELS (For testing)
UPDATE public.hostels SET is_approved = true;

-- 6. DROP & RECREATE STUDENT POLICIES (To avoid duplicates/errors)
DROP POLICY IF EXISTS "Students can read own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Students can create profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Owners can read hostel students" ON public.student_profiles;

CREATE POLICY "Students can read own profile" ON public.student_profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can create profile" ON public.student_profiles FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM public.hostels WHERE id = hostel_id AND is_approved = true)
);

CREATE POLICY "Owners can read hostel students" ON public.student_profiles FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.hostels WHERE id = hostel_id AND owner_id = auth.uid())
);
