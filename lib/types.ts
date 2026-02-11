// User roles
export type UserRole = 'student' | 'owner' | 'admin';

// User profile from database
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

// Auth user with profile
export interface AuthUser {
  id: string;
  email: string;
  profile?: User;
}

// Form states
export interface AuthFormState {
  error?: string;
  success?: boolean;
  loading?: boolean;
}

// Hostel image
export interface HostelImage {
  id: string;
  hostel_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

// Hostel listing
export interface Hostel {
  id: string;
  name: string;
  area: string;
  address: string;
  price: number;
  total_beds: number;
  vacant_beds: number;
  description: string | null;
  owner_phone: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}


// Hostel with images for listing/detail
export interface HostelWithImages extends Hostel {
  hostel_images: HostelImage[];
  hostel_code?: string; // Only visible to owner/admin or if specifically fetched
  logo_url?: string | null;
}

// Student profile extended
export interface StudentProfile {
  id: string;
  user_id: string;
  hostel_id: string;
  name: string;
  phone_number: string;
  parent_phone?: string;
  college_or_workplace?: string;
  floor_number?: string;
  room_number?: string;
  monthly_rent?: number; // Added in Phase 6
  joined_at: string;
}

// Payment record
export interface Payment {
  id: string;
  student_profile_id: string;
  hostel_id: string;
  month: string; // YYYY-MM
  amount: number;
  status: 'due' | 'paid';
  payment_date?: string;
  payment_method?: string;
  marked_paid_by?: string;
  marked_paid_at?: string;
  notes?: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  student_profile_id: string;
  hostel_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  owner_reply?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface HostelUpdate {
  id: string;
  hostel_id?: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  is_global: boolean;
}
