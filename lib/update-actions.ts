'use server';

import { createClient } from '@/lib/supabase/server';

// =============================================
// STUDENT: Get updates (global + hostel-specific)
// =============================================
export async function getStudentUpdates(hostelId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('updates')
        .select(`
            *,
            users:created_by (
                name
            ),
            hostels (
                name
            )
        `)
        .or(`is_global.eq.true,hostel_id.eq.${hostelId}`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch Student Updates Error:', error);
        return [];
    }
    return data;
}

// =============================================
// OWNER: Get updates for a hostel
// =============================================
export async function getOwnerUpdates(hostelId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('updates')
        .select(`
            *,
            users:created_by (
                name
            )
        `)
        .eq('hostel_id', hostelId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch Owner Updates Error:', error);
        return [];
    }
    return data;
}

// =============================================
// OWNER: Create a hostel-specific update
// =============================================
export async function createOwnerUpdate(
    hostelId: string,
    title: string,
    content: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    if (!title.trim() || !content.trim()) {
        return { success: false, error: 'Title and content are required' };
    }

    const { error } = await supabase.from('updates').insert({
        hostel_id: hostelId,
        title: title.trim(),
        content: content.trim(),
        created_by: user.id,
        is_global: false,
    });

    if (error) {
        console.error('Create Owner Update Error:', error);
        return { success: false, error: 'Failed to create update: ' + error.message };
    }
    return { success: true };
}

// =============================================
// ADMIN: Get all updates
// =============================================
export async function getAllUpdates() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('updates')
        .select(`
            *,
            users:created_by (
                name
            ),
            hostels (
                name
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch All Updates Error:', error);
        return [];
    }
    return data;
}

// =============================================
// ADMIN: Create update (global or hostel-specific)
// =============================================
export async function createAdminUpdate(
    title: string,
    content: string,
    isGlobal: boolean,
    hostelId?: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    if (!title.trim() || !content.trim()) {
        return { success: false, error: 'Title and content are required' };
    }

    if (!isGlobal && !hostelId) {
        return { success: false, error: 'Select a hostel or make it global' };
    }

    const { error } = await supabase.from('updates').insert({
        hostel_id: isGlobal ? null : hostelId,
        title: title.trim(),
        content: content.trim(),
        created_by: user.id,
        is_global: isGlobal,
    });

    if (error) {
        console.error('Create Admin Update Error:', error);
        return { success: false, error: 'Failed to create update: ' + error.message };
    }
    return { success: true };
}

// =============================================
// DELETE update (owner or admin)
// =============================================
export async function deleteUpdate(updateId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
        .from('updates')
        .delete()
        .eq('id', updateId);

    if (error) {
        console.error('Delete Update Error:', error);
        return { success: false, error: 'Failed to delete update: ' + error.message };
    }
    return { success: true };
}
