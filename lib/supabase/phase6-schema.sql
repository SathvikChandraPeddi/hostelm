-- =============================================
-- Phase 6: Payments & Dues Tracking System
-- (No Payment Gateway - Manual Tracking Only)
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add monthly_rent to student_profiles
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS monthly_rent INTEGER DEFAULT 5000;

-- 2. Create payments table (NO Razorpay fields)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('due', 'paid')) DEFAULT 'due',
  payment_method TEXT DEFAULT 'cash', -- cash, upi_offline, bank_transfer, etc.
  payment_date TIMESTAMPTZ,
  marked_paid_by UUID REFERENCES public.users(id),
  marked_paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One payment record per student per month
  CONSTRAINT unique_payment_per_month UNIQUE (student_profile_id, month)
);

-- 3. Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Students can read own payments
CREATE POLICY "Students can read own payments"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_profiles
      WHERE id = student_profile_id AND user_id = auth.uid()
    )
  );

-- Owners can read payments for their hostels
CREATE POLICY "Owners can read hostel payments"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hostels
      WHERE id = hostel_id AND owner_id = auth.uid()
    )
  );

-- Owners can insert dues for their hostel students
CREATE POLICY "Owners can insert hostel payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.hostels
      WHERE id = hostel_id AND owner_id = auth.uid()
    )
  );

-- Owners can update (mark as paid) payments for their hostels
CREATE POLICY "Owners can update hostel payments"
  ON public.payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.hostels
      WHERE id = hostel_id AND owner_id = auth.uid()
    )
  );

-- Admins can read all payments
CREATE POLICY "Admins can read all payments"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can insert payments
CREATE POLICY "Admins can insert payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update payments
CREATE POLICY "Admins can update payments"
  ON public.payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_payments_hostel ON public.payments(hostel_id);
CREATE INDEX IF NOT EXISTS idx_payments_month ON public.payments(month);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- =============================================
-- Instructions:
-- 1. Run this script in Supabase SQL Editor
-- 2. If payments table already exists with Razorpay columns,
--    DROP TABLE public.payments first, then re-run.
-- =============================================
