'use server';

import { createClient } from '@/lib/supabase/server';

// =============================================
// STUDENT ACTIONS
// =============================================

// Get all tickets for a student
export async function getStudentTickets(studentProfileId: string) {
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    if (!title.trim() || !description.trim()) {
        return { success: false, error: 'Title and description are required' };
    }

    const { error } = await supabase
        .from('tickets')
        .insert({
            student_profile_id: studentProfileId,
            hostel_id: hostelId,
            title: title.trim(),
            description: description.trim(),
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
    };

    if (ownerReply !== undefined) {
        updateData.owner_reply = ownerReply;
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
    };

    if (adminNotes !== undefined) {
        updateData.admin_notes = adminNotes;
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
