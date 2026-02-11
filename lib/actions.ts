'use server';

import { createClient } from '@/lib/supabase/server';
import { getStudentProfile } from '@/lib/supabase/students';
import type { HostelWithImages } from '@/lib/types';
import type { CreateStudentProfileData } from '@/lib/supabase/students';
import { 
    hostelCodeSchema, 
    studentProfileSchema, 
    validateInput,
    sanitizeText 
} from '@/lib/validation';
import { 
    getAuthenticatedUser, 
    requireRole,
    checkRateLimit 
} from '@/lib/security';

// Verify hostel code
export async function verifyHostelCode(code: string): Promise<HostelWithImages | null> {
    // Validate and sanitize hostel code
    const validation = validateInput(hostelCodeSchema, code);
    if (!validation.success || !validation.data) {
        console.error('Invalid hostel code format');
        return null;
    }

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
        .eq('hostel_code', validation.data)
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
    // SECURITY: Verify user is authenticated and is a student
    const authResult = await getAuthenticatedUser();
    if (!authResult.authorized || !authResult.user) {
        return { success: false, error: authResult.error || 'Not authenticated' };
    }

    // SECURITY: Rate limiting
    if (!checkRateLimit(authResult.user.id, 'join-hostel', 5, 60000)) {
        return { success: false, error: 'Too many attempts. Please try again later.' };
    }

    // SECURITY: Validate input data
    const validation = validateInput(studentProfileSchema, data);
    if (!validation.success || !validation.data) {
        return { success: false, error: validation.error || 'Invalid input data' };
    }

    // SECURITY: Ensure user can only create profile for themselves
    if (validation.data.user_id !== authResult.user.id) {
        console.error('Security: User attempted to create profile for another user');
        return { success: false, error: 'Unauthorized operation' };
    }

    // SECURITY: Verify role is student
    if (authResult.user.role !== 'student') {
        return { success: false, error: 'Only students can join hostels.' };
    }

    const supabase = await createClient();

    console.log('Attempting to join hostel with data:', validation.data);

    try {
        // Double check if already exists using server-side fetching
        const existing = await getStudentProfile(validation.data.user_id);
        if (existing) {
            console.log('User already has a profile');
            return { success: false, error: 'You have already joined a hostel.' };
        }

        // Verify hostel approval
        const { data: hostelData, error: hostelError } = await supabase
            .from('hostels')
            .select('is_approved')
            .eq('id', validation.data.hostel_id)
            .single();
            
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
            .insert(validation.data);

        if (error) {
            console.error('Error creating student profile:', error);
            return { success: false, error: error.message || 'Database error during insert' };
        }

        console.log('Successfully joined hostel');
        return { success: true };
    } catch (err) {
        console.error('Unexpected error in joinHostelAction:', err);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
