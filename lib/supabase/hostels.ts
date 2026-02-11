import { createClient } from './server';
import type { HostelWithImages } from '@/lib/types';

// Fetch all hostels with their first image (only approved ones for public)
export async function getHostels(): Promise<HostelWithImages[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('hostels')
    .select(`
      *,
      hostel_images (
        id,
        image_url,
        display_order
      )
    `)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching hostels:', error);
    return [];
  }

  return (data as HostelWithImages[]) || [];
}

// Fetch single hostel by ID with all images
export async function getHostelById(id: string): Promise<HostelWithImages | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('hostels')
    .select(`
      *,
      hostel_images (
        id,
        image_url,
        display_order
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching hostel:', error);
    return null;
  }

  return data as HostelWithImages;
}

// Fetch hostels by area
export async function getHostelsByArea(area: string): Promise<HostelWithImages[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('hostels')
    .select(`
      *,
      hostel_images (
        id,
        image_url,
        display_order
      )
    `)
    .ilike('area', `%${area}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching hostels by area:', error);
    return [];
  }

  return (data as HostelWithImages[]) || [];
}

// =============================================
// OWNER MANAGEMENT FUNCTIONS
// =============================================

// Fetch hostels owned by a specific user
export async function getOwnerHostels(ownerId: string): Promise<HostelWithImages[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('hostels')
    .select(`
      *,
      hostel_images (
        id,
        image_url,
        display_order
      )
    `)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching owner hostels:', error);
    return [];
  }

  return (data as HostelWithImages[]) || [];
}

// Create a new hostel
export interface CreateHostelData {
  name: string;
  area: string;
  address: string;
  price: number;
  total_beds: number;
  vacant_beds: number;
  description?: string;
  owner_phone: string;
  owner_id: string;
  is_approved?: boolean;
}

export async function createHostel(data: CreateHostelData): Promise<{ id: string } | null> {
  const supabase = await createClient();

  const { data: hostel, error } = await supabase
    .from('hostels')
    .insert(data)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating hostel:', error);
    return null;
  }

  return hostel;
}

// Update an existing hostel
export interface UpdateHostelData {
  name?: string;
  area?: string;
  address?: string;
  price?: number;
  total_beds?: number;
  vacant_beds?: number;
  description?: string;
  owner_phone?: string;
}

export async function updateHostel(id: string, data: UpdateHostelData): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('hostels')
    .update(data)
    .eq('id', id);

  if (error) {
    console.error('Error updating hostel:', error);
    return false;
  }

  return true;
}

// Delete a hostel
export async function deleteHostel(id: string): Promise<boolean> {
  const supabase = await createClient();

  // First delete associated images from storage
  const { data: images } = await supabase
    .from('hostel_images')
    .select('image_url')
    .eq('hostel_id', id);

  // Delete hostel (cascade will delete hostel_images records)
  const { error } = await supabase
    .from('hostels')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting hostel:', error);
    return false;
  }

  return true;
}

// Add image to hostel
export async function addHostelImage(hostelId: string, imageUrl: string, displayOrder: number = 0): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('hostel_images')
    .insert({
      hostel_id: hostelId,
      image_url: imageUrl,
      display_order: displayOrder,
    });

  if (error) {
    console.error('Error adding hostel image:', error);
    return false;
  }

  return true;
}

// Delete image from hostel
export async function deleteHostelImage(imageId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('hostel_images')
    .delete()
    .eq('id', imageId);

  if (error) {
    console.error('Error deleting hostel image:', error);
    return false;
  }

  return true;
}
