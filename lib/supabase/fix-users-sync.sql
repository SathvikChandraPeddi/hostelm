-- =============================================
-- Fix: Auto-create user profile on signup
-- Run this in Supabase SQL Editor
-- =============================================

-- Create a function that runs when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.users.name),
    email = COALESCE(EXCLUDED.email, public.users.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- IMPORTANT: Backfill existing users
-- This will create profiles for users who signed up
-- before this trigger was added
-- =============================================
INSERT INTO public.users (id, name, email, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', 'User'),
  email,
  COALESCE(raw_user_meta_data->>'role', 'student')
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- Add required columns for admin features
-- =============================================
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

ALTER TABLE public.hostels 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- =============================================
-- Admin RLS Policies (allow admins to manage users/hostels)
-- =============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any hostel" ON public.hostels;
DROP POLICY IF EXISTS "Admins can delete any hostel" ON public.hostels;

-- Policy: Admins can read all users
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Policy: Admins can update all users
CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Policy: Admins can delete users
CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Policy: Admins can update any hostel
CREATE POLICY "Admins can update any hostel"
  ON public.hostels FOR UPDATE
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Policy: Admins can delete any hostel  
CREATE POLICY "Admins can delete any hostel"
  ON public.hostels FOR DELETE
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Verify it worked
SELECT * FROM public.users;

-- =============================================
-- HOW TO MAKE A USER AN ADMIN
-- =============================================
-- After creating an account (as student/owner), 
-- run this command with your email to become admin:
--
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';
--
-- Example:
-- UPDATE public.users SET role = 'admin' WHERE email = 'saketh@gmail.com';
