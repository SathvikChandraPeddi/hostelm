'use server';

import { createClient } from '@/lib/supabase/server';
import {
    uuidSchema,
    monthSchema,
    validateInput,
    sanitizeText,
} from '@/lib/validation';
import {
    getAuthenticatedUser,
    requireRole,
    verifyStudentProfileOwnership,
    verifyHostelOwnership,
    verifyPaymentAccess,
    checkRateLimit,
} from '@/lib/security';

// =============================================
// FETCH FUNCTIONS
// =============================================

// Fetch Student Payments
export async function getStudentPayments(studentProfileId: string) {
    // SECURITY: Validate input
    const validation = validateInput(uuidSchema, studentProfileId);
    if (!validation.success) {
        console.error('Invalid student profile ID');
        return [];
    }

    // SECURITY: Verify authentication
    const authResult = await getAuthenticatedUser();
    if (!authResult.authorized || !authResult.user) {
        console.error('Unauthorized access attempt');
        return [];
    }

    // SECURITY: Verify ownership
    const isOwner = await verifyStudentProfileOwnership(authResult.user.id, studentProfileId);
    if (!isOwner && authResult.user.role !== 'admin') {
        console.error('Security: User attempted to access another students payments');
        return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_profile_id', studentProfileId)
        .order('month', { ascending: false });

    if (error) {
        console.error('Fetch Payments Error:', error);
        return [];
    }
    return data;
}

// Fetch Hostel Payments (for owner view)
export async function getHostelPayments(hostelId: string, month?: string) {
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
            console.error('Security: Owner attempted to access another hostels payments');
            return [];
        }
    } else if (authResult.user.role !== 'admin') {
        return [];
    }

    const supabase = await createClient();

    let query = supabase
        .from('payments')
        .select(`
            *,
            student_profiles (
                name,
                room_number,
                phone_number,
                floor_number
            )
        `)
        .eq('hostel_id', hostelId);

    if (month) {
        // Validate month format
        const monthValidation = validateInput(monthSchema, month);
        if (monthValidation.success && monthValidation.data) {
            query = query.eq('month', monthValidation.data);
        }
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
        console.error('Fetch Hostel Payments Error:', error);
        return [];
    }
    return data;
}

// Fetch admin payment overview (hostel-wise aggregation)
export async function getAdminPaymentOverview(month: string) {
    // SECURITY: Require admin role
    try {
        await requireRole('admin');
    } catch {
        console.error('Unauthorized admin access attempt');
        return [];
    }

    // SECURITY: Validate month format
    const monthValidation = validateInput(monthSchema, month);
    if (!monthValidation.success || !monthValidation.data) {
        console.error('Invalid month format');
        return [];
    }

    const supabase = await createClient();

    // Get all hostels with their payment stats for the given month
    const { data: hostels, error: hostelsError } = await supabase
        .from('hostels')
        .select('id, name, area, owner_id')
        .eq('is_approved', true)
        .order('name');

    if (hostelsError || !hostels) {
        console.error('Admin Overview Error:', hostelsError);
        return [];
    }

    // For each hostel, get payment counts
    const overview = await Promise.all(
        hostels.map(async (hostel) => {
            const { data: payments } = await supabase
                .from('payments')
                .select('status, amount')
                .eq('hostel_id', hostel.id)
                .eq('month', month);

            const allPayments = payments || [];
            const paidCount = allPayments.filter(p => p.status === 'paid').length;
            const dueCount = allPayments.filter(p => p.status === 'due').length;
            const totalCollected = allPayments
                .filter(p => p.status === 'paid')
                .reduce((sum, p) => sum + p.amount, 0);
            const totalDue = allPayments
                .filter(p => p.status === 'due')
                .reduce((sum, p) => sum + p.amount, 0);

            // Get owner name
            let ownerName = 'Unknown';
            if (hostel.owner_id) {
                const { data: owner } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', hostel.owner_id)
                    .single();
                ownerName = owner?.name || 'Unknown';
            }

            return {
                hostelId: hostel.id,
                hostelName: hostel.name,
                area: hostel.area,
                ownerName,
                totalStudents: paidCount + dueCount,
                paidCount,
                dueCount,
                totalCollected,
                totalDue,
            };
        })
    );

    // Only return hostels that have payment records
    return overview.filter(h => h.totalStudents > 0);
}

// =============================================
// ACTION FUNCTIONS
// =============================================

// Generate monthly dues for all students in a hostel
export async function generateMonthlyDues(hostelId: string, month: string) {
    // SECURITY: Verify authentication and role
    let user;
    try {
        user = await requireRole(['owner', 'admin']);
    } catch {
        return { success: false, error: 'Unauthorized' };
    }

    // SECURITY: Validate inputs
    const hostelValidation = validateInput(uuidSchema, hostelId);
    const monthValidation = validateInput(monthSchema, month);
    
    if (!hostelValidation.success || !monthValidation.success) {
        return { success: false, error: 'Invalid input' };
    }

    // SECURITY: Rate limiting
    if (!checkRateLimit(user.id, 'generate-dues', 5, 60000)) {
        return { success: false, error: 'Too many attempts. Please wait.' };
    }

    // SECURITY: Verify hostel ownership (if owner)
    if (user.role === 'owner') {
        const isOwner = await verifyHostelOwnership(user.id, hostelId);
        if (!isOwner) {
            console.error('Security: Owner attempted to generate dues for another hostel');
            return { success: false, error: 'Unauthorized' };
        }
    }

    const supabase = await createClient();

    // Get all students in this hostel
    const { data: students, error: studentsError } = await supabase
        .from('student_profiles')
        .select('id, monthly_rent')
        .eq('hostel_id', hostelId);

    if (studentsError || !students || students.length === 0) {
        return { success: false, error: 'No students found in this hostel' };
    }

    // Get existing payment records for this month
    const { data: existing } = await supabase
        .from('payments')
        .select('student_profile_id')
        .eq('hostel_id', hostelId)
        .eq('month', monthValidation.data);

    const existingIds = new Set((existing || []).map(p => p.student_profile_id));

    // Create "due" records for students who don't have one yet
    const newDues = students
        .filter(s => !existingIds.has(s.id))
        .map(s => ({
            student_profile_id: s.id,
            hostel_id: hostelId,
            month: monthValidation.data,
            amount: s.monthly_rent || 5000,
            status: 'due' as const,
        }));

    if (newDues.length === 0) {
        return { success: true, message: 'Dues already generated for all students this month', count: 0 };
    }

    const { error: insertError } = await supabase
        .from('payments')
        .insert(newDues);

    if (insertError) {
        console.error('Generate Dues Error:', insertError);
        return { success: false, error: 'Failed to generate dues: ' + insertError.message };
    }

    return { success: true, message: `Generated dues for ${newDues.length} student(s)`, count: newDues.length };
}

// Mark a payment as paid (owner or admin)
export async function markPaymentAsPaid(paymentId: string, notes?: string) {
    // SECURITY: Verify authentication and role
    let user;
    try {
        user = await requireRole(['owner', 'admin']);
    } catch {
        return { success: false, error: 'Unauthorized' };
    }

    // SECURITY: Validate payment ID
    const validation = validateInput(uuidSchema, paymentId);
    if (!validation.success) {
        return { success: false, error: 'Invalid payment ID' };
    }

    // SECURITY: Verify payment access
    const hasAccess = await verifyPaymentAccess(user.id, paymentId, user.role);
    if (!hasAccess) {
        console.error('Security: User attempted to update payment they dont have access to');
        return { success: false, error: 'Unauthorized' };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('payments')
        .update({
            status: 'paid',
            payment_date: new Date().toISOString(),
            marked_paid_by: user.id,
            marked_paid_at: new Date().toISOString(),
            notes: notes ? sanitizeText(notes) : 'Marked as paid manually',
        })
        .eq('id', paymentId)
        .eq('status', 'due'); // Only update if currently "due"

    if (error) {
        console.error('Mark Paid Error:', error);
        return { success: false, error: 'Failed to mark as paid: ' + error.message };
    }

    return { success: true };
}
