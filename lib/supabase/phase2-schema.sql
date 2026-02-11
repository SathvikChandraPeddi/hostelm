-- =============================================
-- Hostel Discovery App - Phase 2 Schema
-- Tables: hostels, hostel_images
-- =============================================

-- Hostels table
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

-- Hostel images table
CREATE TABLE IF NOT EXISTS public.hostel_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hostels_area ON public.hostels(area);
CREATE INDEX IF NOT EXISTS idx_hostels_price ON public.hostels(price);
CREATE INDEX IF NOT EXISTS idx_hostel_images_hostel_id ON public.hostel_images(hostel_id);

-- Enable Row Level Security
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read hostels (public browsing)
CREATE POLICY "Hostels are publicly readable"
  ON public.hostels
  FOR SELECT
  USING (true);

-- Policy: Only owners can insert/update their hostels
CREATE POLICY "Owners can insert hostels"
  ON public.hostels
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their hostels"
  ON public.hostels
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Policy: Anyone can read hostel images
CREATE POLICY "Hostel images are publicly readable"
  ON public.hostel_images
  FOR SELECT
  USING (true);

-- Policy: Owners can manage images for their hostels
CREATE POLICY "Owners can insert hostel images"
  ON public.hostel_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.hostels 
      WHERE id = hostel_id AND owner_id = auth.uid()
    )
  );

-- Trigger for updated_at on hostels
CREATE TRIGGER on_hostels_updated
  BEFORE UPDATE ON public.hostels
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- SEED DATA FOR TESTING
-- =============================================

-- Insert sample hostels
INSERT INTO public.hostels (id, name, area, address, price, total_beds, vacant_beds, description, owner_phone) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
   'Sunrise Student Hostel', 
   'Koramangala', 
   '123 5th Block, Koramangala, Bangalore 560095',
   8500,
   50,
   12,
   'A modern student hostel with all amenities including WiFi, AC rooms, attached bathrooms, and a fully equipped gym. Located just 5 minutes from major tech parks. We provide nutritious meals 3 times a day with vegetarian and non-vegetarian options.',
   '+919876543210'),
   
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901',
   'Green Valley PG',
   'HSR Layout',
   '456 Sector 2, HSR Layout, Bangalore 560102',
   7000,
   30,
   5,
   'Comfortable and affordable PG accommodation for students and working professionals. Features include 24/7 security, power backup, laundry service, and home-cooked meals. Walking distance to HSR BDA Complex.',
   '+919876543211'),
   
  ('c3d4e5f6-a7b8-9012-cdef-123456789012',
   'Campus Corner Hostel',
   'Electronic City',
   '789 Phase 1, Electronic City, Bangalore 560100',
   6500,
   80,
   25,
   'Budget-friendly hostel perfect for students. Amenities include study rooms, common TV lounge, indoor games, and parking. Just 10 minutes from Infosys and Wipro campuses.',
   '+919876543212'),
   
  ('d4e5f6a7-b8c9-0123-defa-234567890123',
   'Elite Student Living',
   'Indiranagar',
   '321 100 Feet Road, Indiranagar, Bangalore 560038',
   12000,
   40,
   8,
   'Premium hostel accommodation in the heart of Indiranagar. Fully furnished AC rooms, high-speed fiber internet, modern gym, rooftop cafeteria, and weekly housekeeping. Perfect for those seeking comfort and convenience.',
   '+919876543213'),
   
  ('e5f6a7b8-c9d0-1234-efab-345678901234',
   'Scholars Den',
   'Marathahalli',
   '555 Outer Ring Road, Marathahalli, Bangalore 560037',
   7500,
   60,
   0,
   'Well-maintained hostel with a focus on academics. Features include dedicated study halls, library access, and a quiet environment. Located near multiple IT parks and shopping centers.',
   '+919876543214'),
   
  ('f6a7b8c9-d0e1-2345-fabc-456789012345',
   'Happy Homes Hostel',
   'Whitefield',
   '888 ITPL Main Road, Whitefield, Bangalore 560066',
   9000,
   45,
   15,
   'A home away from home! Spacious rooms, attached bathrooms, branded mattresses, and purified drinking water. We organize weekend activities and cultural events. 24x7 water and electricity supply.',
   '+919876543215');

-- Insert sample hostel images (using placeholder URLs - replace with actual Supabase storage URLs)
INSERT INTO public.hostel_images (hostel_id, image_url, display_order) VALUES
  -- Sunrise Student Hostel
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', 3),
  
  -- Green Valley PG
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', 1),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 2),
  
  -- Campus Corner Hostel
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 1),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 2),
  
  -- Elite Student Living
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800', 1),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 2),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800', 3),
  
  -- Scholars Den
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800', 1),
  
  -- Happy Homes Hostel
  ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 1),
  ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 2);

-- =============================================
-- Instructions:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Run this entire script after Phase 1 schema
-- 3. Verify tables in Table Editor
-- =============================================
