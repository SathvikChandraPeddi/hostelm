-- =============================================
-- Hostel Discovery App - Phase 3 Schema
-- Owner Dashboard: Storage & RLS Updates
-- =============================================

-- Create storage bucket for hostel images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hostel-images', 'hostel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Anyone can view images (public bucket)
CREATE POLICY "Public can view hostel images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hostel-images');

-- Storage policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hostel-images' 
  AND auth.role() = 'authenticated'
);

-- Storage policy: Users can update their own uploads
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hostel-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policy: Users can delete their own uploads
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hostel-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- Update hostel_images to allow owner management
-- =============================================

-- Policy: Owners can delete images for their hostels
CREATE POLICY "Owners can delete hostel images"
  ON public.hostel_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.hostels 
      WHERE id = hostel_id AND owner_id = auth.uid()
    )
  );

-- Policy: Owners can update images for their hostels
CREATE POLICY "Owners can update hostel images"
  ON public.hostel_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.hostels 
      WHERE id = hostel_id AND owner_id = auth.uid()
    )
  );

-- =============================================
-- Add delete policy for hostels
-- =============================================

CREATE POLICY "Owners can delete their hostels"
  ON public.hostels
  FOR DELETE
  USING (auth.uid() = owner_id);

-- =============================================
-- Instructions:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Run this script after Phase 1 and Phase 2 schemas
-- 3. Verify storage bucket in Storage section
-- =============================================
