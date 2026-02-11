-- =============================================
-- FIX: Remove infinite recursion in RLS policies
-- Run this in Supabase SQL Editor
-- =============================================

-- First, drop ALL existing user policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Recreate policies WITHOUT recursion
-- The key is to use auth.uid() directly without querying public.users

-- Policy: Users can always read their own profile
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- For admin access, we'll use a function that doesn't trigger RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Policy: Admins can read all users (using the SECURITY DEFINER function)
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (public.is_admin());

-- Policy: Admins can update all users
CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (public.is_admin());

-- Policy: Admins can delete users (except themselves)
CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING (public.is_admin() AND id != auth.uid());

-- =============================================
-- Verify admin role is set
-- =============================================
SELECT id, email, role FROM public.users WHERE email = 'sathvikpeddi0@gmail.com';

-- If role is not 'admin', run this:
-- UPDATE public.users SET role = 'admin' WHERE email = 'sathvikpeddi0@gmail.com';
