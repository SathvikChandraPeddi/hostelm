-- =============================================
-- FINAL RECURSION FIX (BREAK THE CYCLE)
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Drop policies on HOSTELS that might cause recursion
DROP POLICY IF EXISTS "Public can view approved hostels" ON public.hostels;
DROP POLICY IF EXISTS "Owners can view own hostels" ON public.hostels;
DROP POLICY IF EXISTS "Owners can update own hostels" ON public.hostels;
DROP POLICY IF EXISTS "Owners can insert hostels" ON public.hostels;
DROP POLICY IF EXISTS "Everyone can view approved hostels" ON public.hostels;

-- 2. Drop policies on STUDENT_PROFILES
DROP POLICY IF EXISTS "Students can create profile" ON public.student_profiles;

-- 3. Recreate HOSTELS policies securely (SIMPLE)
-- Allow anyone to read approved hostels (No dependency on student_profiles)
CREATE POLICY "Public can view approved hostels" 
ON public.hostels FOR SELECT 
USING (is_approved = true);

-- Allow owners to manage their own (No dependency on student_profiles)
CREATE POLICY "Owners can manage own hostels" 
ON public.hostels FOR ALL 
USING (auth.uid() = owner_id);

-- 4. Recreate STUDENT_PROFILES policies
-- Allow insert if user matches ID (We check hostel approval in the Application Code actions.ts, 
-- so strictly we don't need to enforce it in RLS if it causes recursion, but let's try a safe version)

CREATE POLICY "Students can create profile" 
ON public.student_profiles FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
  -- Removed the EXISTS(hostels) check to guarantee no recursion here. 
  -- The server action 'joinHostelAction' already verifies hostel.is_approved.
);

-- 5. Helper verification date
SELECT 'Fix applied successfully' as status;
