-- =============================================
-- HostelM - Complete Database Schema
-- Run this ONCE in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE 1: USERS
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'owner', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- TABLE 2: HOSTELS
-- =============================================
CREATE TABLE IF NOT EXISTS public.hostels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price > 0),
  total_beds INTEGER NOT NULL CHECK (total_beds > 0),
  vacant_beds INTEGER NOT NULL CHECK (vacant_beds >= 0),
  description TEXT,
  owner_phone TEXT NOT NULL,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_beds CHECK (vacant_beds <= total_beds)
);

ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;

-- Hostels Policies
CREATE POLICY "Hostels are publicly readable" ON public.hostels
  FOR SELECT USING (true);

CREATE POLICY "Owners can insert hostels" ON public.hostels
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their hostels" ON public.hostels
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their hostels" ON public.hostels
  FOR DELETE USING (auth.uid() = owner_id);

-- =============================================
-- TABLE 3: HOSTEL_IMAGES
-- =============================================
CREATE TABLE IF NOT EXISTS public.hostel_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.hostel_images ENABLE ROW LEVEL SECURITY;

-- Hostel Images Policies
CREATE POLICY "Hostel images are publicly readable" ON public.hostel_images
  FOR SELECT USING (true);

CREATE POLICY "Owners can insert hostel images" ON public.hostel_images
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.hostels WHERE id = hostel_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can update hostel images" ON public.hostel_images
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.hostels WHERE id = hostel_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can delete hostel images" ON public.hostel_images
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.hostels WHERE id = hostel_id AND owner_id = auth.uid())
  );

-- =============================================
-- STORAGE: HOSTEL-IMAGES BUCKET
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('hostel-images', 'hostel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public can view hostel images" ON storage.objects
  FOR SELECT USING (bucket_id = 'hostel-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'hostel-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'hostel-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- DONE! Your database is ready.
-- =============================================
