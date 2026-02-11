-- =============================================
-- Phase 8: Updates & Notice Board System
-- =============================================
-- Run this SQL in Supabase SQL Editor

-- Create updates table
CREATE TABLE IF NOT EXISTS public.updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_id UUID REFERENCES public.hostels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_global BOOLEAN NOT NULL DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_updates_hostel ON public.updates(hostel_id);
CREATE INDEX IF NOT EXISTS idx_updates_global ON public.updates(is_global);
CREATE INDEX IF NOT EXISTS idx_updates_created_by ON public.updates(created_by);

-- Enable RLS
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- Everyone authenticated can view global updates
CREATE POLICY "Anyone can view global updates"
    ON public.updates FOR SELECT
    TO authenticated
    USING (is_global = true);

-- Students can view updates for their hostel
CREATE POLICY "Students can view hostel updates"
    ON public.updates FOR SELECT
    TO authenticated
    USING (
        hostel_id IN (
            SELECT hostel_id FROM public.student_profiles WHERE user_id = auth.uid()
        )
    );

-- Owners can view updates for their hostels
CREATE POLICY "Owners can view own hostel updates"
    ON public.updates FOR SELECT
    TO authenticated
    USING (
        hostel_id IN (
            SELECT id FROM public.hostels WHERE owner_id = auth.uid()
        )
    );

-- Owners can create updates for their hostels only (not global)
CREATE POLICY "Owners can create hostel updates"
    ON public.updates FOR INSERT
    TO authenticated
    WITH CHECK (
        is_global = false
        AND created_by = auth.uid()
        AND hostel_id IN (
            SELECT id FROM public.hostels WHERE owner_id = auth.uid()
        )
    );

-- Owners can delete their own updates
CREATE POLICY "Owners can delete own updates"
    ON public.updates FOR DELETE
    TO authenticated
    USING (
        created_by = auth.uid()
        AND hostel_id IN (
            SELECT id FROM public.hostels WHERE owner_id = auth.uid()
        )
    );

-- Admins can view all updates
CREATE POLICY "Admins can view all updates"
    ON public.updates FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can create any update (global or hostel-specific)
CREATE POLICY "Admins can create any update"
    ON public.updates FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
        AND created_by = auth.uid()
    );

-- Admins can delete any update
CREATE POLICY "Admins can delete any update"
    ON public.updates FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    );
