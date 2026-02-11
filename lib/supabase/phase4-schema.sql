-- =============================================
-- Phase 4: Admin Dashboard Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Add is_blocked column to users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Add is_approved column to hostels
ALTER TABLE public.hostels 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- =============================================
-- Admin RLS Policies
-- =============================================

-- Policy: Admins can read all users
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Policy: Admins can update all users
CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (
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
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Policy: Admins can delete any hostel
CREATE POLICY "Admins can delete any hostel"
  ON public.hostels FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- =============================================
-- Create your admin user (run after creating account)
-- Replace with your actual user ID and email
-- =============================================
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-admin@email.com';
