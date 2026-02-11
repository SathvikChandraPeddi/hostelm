'use server';

import { createClient } from '@/lib/supabase/server';
import { getStudentProfile } from '@/lib/supabase/students';
import type { HostelWithImages } from '@/lib/types';
import type { CreateStudentProfileData } from '@/lib/supabase/students';

// Verify hostel code
export async function verifyHostelCode(code: string): Promise<HostelWithImages | null> {
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
        .eq('is_approved', true)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Error fetching hostel by code:', error);
        }
        return null;
    }

    // Explicitly return data matching the interface
    return data as HostelWithImages;
}

// Join hostel action
export async function joinHostelAction(data: CreateStudentProfileData): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    console.log('Attempting to join hostel with data:', data);

    try {
        // Double check if already exists using server-side fetching
        const existing = await getStudentProfile(data.user_id);
        if (existing) {
            console.log('User already has a profile');
            return { success: false, error: 'You have already joined a hostel.' };
        }

        // Verify user role
        const { data: userData, error: userError } = await supabase.from('users').select('role').eq('id', data.user_id).single();
        if (userError || !userData) {
            console.error('Error fetching user role:', userError);
            return { success: false, error: 'Could not verify user role.' };
        }
        console.log('User role:', userData.role);

        if (userData.role !== 'student') {
            return { success: false, error: 'Only students can join hostels.' };
        }

        // Verify hostel approval
        const { data: hostelData, error: hostelError } = await supabase.from('hostels').select('is_approved').eq('id', data.hostel_id).single();
        if (hostelError || !hostelData) {
            console.error('Error fetching hostel status:', hostelError);
            return { success: false, error: 'Could not verify hostel status.' };
        }
        console.log('Hostel approval status:', hostelData.is_approved);

        if (!hostelData.is_approved) {
            return { success: false, error: 'This hostel is not yet approved.' };
        }

        const { error } = await supabase
            .from('student_profiles')
            .insert(data);

        if (error) {
            console.error('Error creating student profile:', error);
            // More detailed error for debugging
            return { success: false, error: error.message || 'Database error during insert' };
        }

        console.log('Successfully joined hostel');
        return { success: true };
    } catch (err) {
        console.error('Unexpected error in joinHostelAction:', err);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
