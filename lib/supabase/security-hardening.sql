-- =============================================
-- Security Hardening: RLS Policies Update
-- Run this in Supabase SQL Editor to enhance security
-- =============================================

-- =============================================
-- 1. Create security definer function for admin checks
-- This prevents RLS recursion issues when checking admin role
-- =============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_user_blocked(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND is_blocked = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- 2. Update users table policies (fix recursion)
-- =============================================

-- Drop existing admin policies to recreate with better performance
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Recreate admin policies using security definer function
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING (public.is_admin());

-- =============================================
-- 3. Add missing student_profiles policies
-- =============================================

-- Allow students to delete their own profile (leave hostel)
CREATE POLICY IF NOT EXISTS "Students can delete own profile"
  ON public.student_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can delete any student profile
CREATE POLICY IF NOT EXISTS "Admins can delete profiles"
  ON public.student_profiles
  FOR DELETE
  USING (public.is_admin());

-- Admins can update any student profile
CREATE POLICY IF NOT EXISTS "Admins can update profiles"
  ON public.student_profiles
  FOR UPDATE
  USING (public.is_admin());

-- =============================================
-- 4. Update hostel policies with admin function
-- =============================================

DROP POLICY IF EXISTS "Admins can update any hostel" ON public.hostels;
DROP POLICY IF EXISTS "Admins can delete any hostel" ON public.hostels;

CREATE POLICY "Admins can update any hostel"
  ON public.hostels FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete any hostel"
  ON public.hostels FOR DELETE
  USING (public.is_admin());

-- =============================================
-- 5. Add security indexes for faster RLS checks
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_blocked ON public.users(is_blocked) WHERE is_blocked = true;
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_hostels_owner_id ON public.hostels(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_profile ON public.payments(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_tickets_student_profile ON public.tickets(student_profile_id);

-- =============================================
-- 6. Add row-level audit logging (optional but recommended)
-- =============================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id),
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log (only admins can read)
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit log"
  ON public.audit_log FOR SELECT
  USING (public.is_admin());

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON public.audit_log(table_name);

-- =============================================
-- 7. Secure storage policies
-- =============================================

-- Ensure only authenticated users can upload
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'hostel-images' 
    AND auth.role() = 'authenticated'
    AND NOT public.is_user_blocked(auth.uid())
  );

-- =============================================
-- SECURITY VERIFICATION QUERIES
-- Run these to verify security setup
-- =============================================

-- Check all tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- List all policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';

-- =============================================
-- IMPORTANT NOTES:
-- 1. Never expose service_role key to client
-- 2. Always use anon key for client operations
-- 3. Validate all inputs on server side
-- 4. Use parameterized queries (Supabase does this)
-- 5. Regularly audit RLS policies
-- =============================================
