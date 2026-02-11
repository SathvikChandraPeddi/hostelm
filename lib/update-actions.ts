'use server';

import { createClient } from '@/lib/supabase/server';
import {
    uuidSchema,
    updateSchema,
    validateInput,
    sanitizeText,
} from '@/lib/validation';
import {
    getAuthenticatedUser,
    requireRole,
    verifyHostelOwnership,
    getStudentHostelId,
    checkRateLimit,
} from '@/lib/security';

// =============================================
// STUDENT: Get updates (global + hostel-specific)
// =============================================
export async function getStudentUpdates(hostelId: string) {
    // SECURITY: Validate input
    const validation = validateInput(uuidSchema, hostelId);
    if (!validation.success) {
        console.error('Invalid hostel ID');
        return [];
    }

    // SECURITY: Verify authentication
    const authResult = await getAuthenticatedUser();
    if (!authResult.authorized || !authResult.user) {
        console.error('Unauthorized access attempt');
        return [];
    }

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
    // SECURITY: Validate input
    const validation = validateInput(uuidSchema, hostelId);
    if (!validation.success) {
        console.error('Invalid hostel ID');
        return [];
    }

    // SECURITY: Verify authentication and role
    const authResult = await getAuthenticatedUser();
    if (!authResult.authorized || !authResult.user) {
        console.error('Unauthorized access attempt');
        return [];
    }

    // SECURITY: Verify hostel ownership (or admin)
    if (authResult.user.role === 'owner') {
        const isOwner = await verifyHostelOwnership(authResult.user.id, hostelId);
        if (!isOwner) {
            console.error('Security: Owner attempted to access another hostels updates');
            return [];
        }
    } else if (authResult.user.role !== 'admin') {
        return [];
    }

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
    // SECURITY: Require owner role
    let user;
    try {
        user = await requireRole('owner');
    } catch {
        return { success: false, error: 'Unauthorized' };
    }

    // SECURITY: Rate limiting
    if (!checkRateLimit(user.id, 'create-update', 10, 60000)) {
        return { success: false, error: 'Too many updates. Please wait.' };
    }

    // SECURITY: Validate inputs
    const validation = validateInput(updateSchema, {
        title,
        content,
        hostelId,
        isGlobal: false,
    });
    if (!validation.success || !validation.data) {
        return { success: false, error: validation.error || 'Invalid input' };
    }

    // SECURITY: Verify hostel ownership
    const isOwner = await verifyHostelOwnership(user.id, hostelId);
    if (!isOwner) {
        console.error('Security: Owner attempted to create update for another hostel');
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    const { error } = await supabase.from('updates').insert({
        hostel_id: hostelId,
        title: validation.data.title,
        content: validation.data.content,
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
    // SECURITY: Require admin role
    try {
        await requireRole('admin');
    } catch {
        console.error('Unauthorized admin access attempt');
        return [];
    }

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
    // SECURITY: Require admin role
    let user;
    try {
        user = await requireRole('admin');
    } catch {
        return { success: false, error: 'Unauthorized' };
    }

    // SECURITY: Rate limiting
    if (!checkRateLimit(user.id, 'create-update', 20, 60000)) {
        return { success: false, error: 'Too many updates. Please wait.' };
    }

    // SECURITY: Validate inputs
    const validation = validateInput(updateSchema, {
        title,
        content,
        hostelId: isGlobal ? null : hostelId,
        isGlobal,
    });
    if (!validation.success || !validation.data) {
        return { success: false, error: validation.error || 'Invalid input' };
    }

    if (!isGlobal && !hostelId) {
        return { success: false, error: 'Select a hostel or make it global' };
    }

    const supabase = await createClient();

    const { error } = await supabase.from('updates').insert({
        hostel_id: isGlobal ? null : hostelId,
        title: validation.data.title,
        content: validation.data.content,
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
    // SECURITY: Verify authentication
    const authResult = await getAuthenticatedUser();
    if (!authResult.authorized || !authResult.user) {
        return { success: false, error: 'Not authenticated' };
    }

    // SECURITY: Validate update ID
    const validation = validateInput(uuidSchema, updateId);
    if (!validation.success) {
        return { success: false, error: 'Invalid update ID' };
    }

    const supabase = await createClient();

    // SECURITY: Check ownership before delete
    // Get the update to verify ownership
    const { data: update, error: fetchError } = await supabase
        .from('updates')
        .select('created_by, hostel_id')
        .eq('id', updateId)
        .single();

    if (fetchError || !update) {
        return { success: false, error: 'Update not found' };
    }

    // Allow deletion if:
    // 1. User is admin
    // 2. User created the update AND owns the hostel (for owners)
    if (authResult.user.role === 'admin') {
        // Admin can delete any update
    } else if (authResult.user.role === 'owner') {
        // Owner must have created it AND own the hostel
        if (update.created_by !== authResult.user.id) {
            return { success: false, error: 'Unauthorized' };
        }
        if (update.hostel_id) {
            const isOwner = await verifyHostelOwnership(authResult.user.id, update.hostel_id);
            if (!isOwner) {
                return { success: false, error: 'Unauthorized' };
            }
        }
    } else {
        return { success: false, error: 'Unauthorized' };
    }

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
