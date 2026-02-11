'use server';

import { createClient } from '@/lib/supabase/server';
import {
    ticketSchema,
    ticketUpdateSchema,
    uuidSchema,
    validateInput,
    sanitizeText,
} from '@/lib/validation';
import {
    getAuthenticatedUser,
    requireRole,
    verifyStudentProfileOwnership,
    verifyHostelOwnership,
    verifyTicketAccess,
    checkRateLimit,
} from '@/lib/security';

// =============================================
// STUDENT ACTIONS
// =============================================

// Get all tickets for a student
export async function getStudentTickets(studentProfileId: string) {
    // SECURITY: Validate input
    const validation = validateInput(uuidSchema, studentProfileId);
    if (!validation.success) {
        console.error('Invalid student profile ID');
        return [];
    }

    // SECURITY: Verify authentication and authorization
    const authResult = await getAuthenticatedUser();
    if (!authResult.authorized || !authResult.user) {
        console.error('Unauthorized access attempt');
        return [];
    }

    // SECURITY: Verify ownership (student can only see their own tickets)
    const isOwner = await verifyStudentProfileOwnership(authResult.user.id, studentProfileId);
    if (!isOwner && authResult.user.role !== 'admin') {
        console.error('Security: User attempted to access another students tickets');
        return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('student_profile_id', studentProfileId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch Student Tickets Error:', error);
        return [];
    }
    return data;
}

// Create a new ticket
export async function createTicket(
    studentProfileId: string,
    hostelId: string,
    title: string,
    description: string
) {
    // SECURITY: Verify authentication
    const authResult = await getAuthenticatedUser();
    if (!authResult.authorized || !authResult.user) {
        return { success: false, error: 'Not authenticated' };
    }

    // SECURITY: Rate limiting
    if (!checkRateLimit(authResult.user.id, 'create-ticket', 10, 60000)) {
        return { success: false, error: 'Too many tickets. Please wait before creating more.' };
    }

    // SECURITY: Validate all inputs
    const validation = validateInput(ticketSchema, {
        studentProfileId,
        hostelId,
        title,
        description,
    });
    if (!validation.success || !validation.data) {
        return { success: false, error: validation.error || 'Invalid input' };
    }

    // SECURITY: Verify student profile ownership
    const isOwner = await verifyStudentProfileOwnership(authResult.user.id, studentProfileId);
    if (!isOwner) {
        console.error('Security: User attempted to create ticket for another student');
        return { success: false, error: 'Unauthorized operation' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('tickets')
        .insert({
            student_profile_id: validation.data.studentProfileId,
            hostel_id: validation.data.hostelId,
            title: validation.data.title,
            description: validation.data.description,
            status: 'open',
        });

    if (error) {
        console.error('Create Ticket Error:', error);
        return { success: false, error: 'Failed to create ticket: ' + error.message };
    }

    return { success: true };
}

// =============================================
// OWNER ACTIONS
// =============================================

// Get all tickets for a hostel (owner view)
export async function getHostelTickets(hostelId: string, statusFilter?: string) {
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
            console.error('Security: Owner attempted to access another hostels tickets');
            return [];
        }
    } else if (authResult.user.role !== 'admin') {
        return [];
    }

    const supabase = await createClient();

    let query = supabase
        .from('tickets')
        .select(`
            *,
            student_profiles (
                name,
                room_number,
                phone_number
            )
        `)
        .eq('hostel_id', hostelId);

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error('Fetch Hostel Tickets Error:', error);
        return [];
    }
    return data;
}

// Owner: update ticket status and reply
export async function updateTicketOwner(
    ticketId: string,
    status: 'open' | 'in_progress' | 'resolved',
    ownerReply?: string
) {
    // SECURITY: Verify authentication and role
    let user;
    try {
        user = await requireRole('owner');
    } catch {
        return { success: false, error: 'Unauthorized' };
    }

    // SECURITY: Validate inputs
    const idValidation = validateInput(uuidSchema, ticketId);
    if (!idValidation.success) {
        return { success: false, error: 'Invalid ticket ID' };
    }

    // SECURITY: Verify ticket access
    const hasAccess = await verifyTicketAccess(user.id, ticketId, 'owner');
    if (!hasAccess) {
        console.error('Security: Owner attempted to update ticket they dont own');
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
    };

    if (ownerReply !== undefined) {
        updateData.owner_reply = sanitizeText(ownerReply);
    }

    if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId);

    if (error) {
        console.error('Update Ticket Error:', error);
        return { success: false, error: 'Failed to update ticket: ' + error.message };
    }

    return { success: true };
}

// =============================================
// ADMIN ACTIONS
// =============================================

// Get all tickets (admin view)
export async function getAllTickets(statusFilter?: string, hostelFilter?: string) {
    // SECURITY: Require admin role
    try {
        await requireRole('admin');
    } catch {
        console.error('Unauthorized admin access attempt');
        return [];
    }

    const supabase = await createClient();

    let query = supabase
        .from('tickets')
        .select(`
            *,
            student_profiles (
                name,
                room_number,
                phone_number
            ),
            hostels (
                name,
                area
            )
        `);

    if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
    }

    if (hostelFilter && hostelFilter !== 'all') {
        query = query.eq('hostel_id', hostelFilter);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error('Fetch All Tickets Error:', error);
        return [];
    }
    return data;
}

// Admin: update ticket status and add notes
export async function updateTicketAdmin(
    ticketId: string,
    status: 'open' | 'in_progress' | 'resolved',
    adminNotes?: string
) {
    // SECURITY: Require admin role
    try {
        await requireRole('admin');
    } catch {
        return { success: false, error: 'Unauthorized' };
    }

    // SECURITY: Validate ticket ID
    const idValidation = validateInput(uuidSchema, ticketId);
    if (!idValidation.success) {
        return { success: false, error: 'Invalid ticket ID' };
    }

    const supabase = await createClient();

    const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
    };

    if (adminNotes !== undefined) {
        updateData.admin_notes = sanitizeText(adminNotes);
    }

    if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId);

    if (error) {
        console.error('Admin Update Ticket Error:', error);
        return { success: false, error: 'Failed to update ticket: ' + error.message };
    }

    return { success: true };
}
