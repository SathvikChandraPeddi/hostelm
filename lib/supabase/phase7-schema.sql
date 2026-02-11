-- =============================================
-- Phase 7: Ticket Management System
-- =============================================
-- Run this SQL in Supabase SQL Editor

-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved')) DEFAULT 'open',
    owner_reply TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_student ON public.tickets(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_tickets_hostel ON public.tickets(hostel_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- Students: can view only their own tickets
CREATE POLICY "Students can view own tickets"
    ON public.tickets FOR SELECT
    TO authenticated
    USING (
        student_profile_id IN (
            SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
        )
    );

-- Students: can create tickets for themselves
CREATE POLICY "Students can create tickets"
    ON public.tickets FOR INSERT
    TO authenticated
    WITH CHECK (
        student_profile_id IN (
            SELECT id FROM public.student_profiles WHERE user_id = auth.uid()
        )
    );

-- Owners: can view tickets for their hostels
CREATE POLICY "Owners can view hostel tickets"
    ON public.tickets FOR SELECT
    TO authenticated
    USING (
        hostel_id IN (
            SELECT id FROM public.hostels WHERE owner_id = auth.uid()
        )
    );

-- Owners: can update tickets for their hostels (reply + status)
CREATE POLICY "Owners can update hostel tickets"
    ON public.tickets FOR UPDATE
    TO authenticated
    USING (
        hostel_id IN (
            SELECT id FROM public.hostels WHERE owner_id = auth.uid()
        )
    )
    WITH CHECK (
        hostel_id IN (
            SELECT id FROM public.hostels WHERE owner_id = auth.uid()
        )
    );

-- Admins: can view all tickets
CREATE POLICY "Admins can view all tickets"
    ON public.tickets FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins: can update all tickets (notes + status override)
CREATE POLICY "Admins can update all tickets"
    ON public.tickets FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    );
