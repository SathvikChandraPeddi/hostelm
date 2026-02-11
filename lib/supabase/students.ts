import { createClient } from './server';
import type { StudentProfile, HostelWithImages } from '@/lib/types';

// Get student profile by user ID
export async function getStudentProfile(userId: string): Promise<StudentProfile | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "Row not found"
            console.error('Error fetching student profile:', error);
        }
        return null;
    }

    return data as StudentProfile;
}

// Get hostel by unique code (for joining)
export async function getHostelByCode(code: string): Promise<HostelWithImages | null> {
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
        .eq('hostel_code', code)
        .eq('is_approved', true) // Only approved hostels can be joined
        .single();

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Error fetching hostel by code:', error);
        }
        return null;
    }

    return data as HostelWithImages;
}

// Join a hostel (create student profile)
export interface CreateStudentProfileData {
    user_id: string;
    hostel_id: string;
    name: string;
    phone_number: string;
    parent_phone?: string;
    college_or_workplace?: string;
    floor_number?: string;
    room_number?: string;
}

export async function createStudentProfile(data: CreateStudentProfileData): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Double check if already exists
    const existing = await getStudentProfile(data.user_id);
    if (existing) {
        return { success: false, error: 'You have already joined a hostel.' };
    }

    const { error } = await supabase
        .from('student_profiles')
        .insert(data);

    if (error) {
        console.error('Error creating student profile:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Get all students for a specific hostel (Owner view)
export async function getHostelStudents(hostelId: string): Promise<StudentProfile[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('hostel_id', hostelId)
        .order('joined_at', { ascending: false });

    if (error) {
        console.error('Error fetching hostel students:', error);
        return [];
    }

    return data as StudentProfile[];
}
