/**
 * Server-side Security Utilities
 * Authorization and role verification for server actions
 */

import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/validation';

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: UserRole;
}

export interface AuthorizationResult {
    authorized: boolean;
    user?: AuthenticatedUser;
    error?: string;
}

/**
 * Verify user is authenticated and get their role from the database
 * This is the ONLY reliable source of role information
 * Never trust client-provided role data
 */
export async function getAuthenticatedUser(): Promise<AuthorizationResult> {
    const supabase = await createClient();

    // Get authenticated user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { authorized: false, error: 'Not authenticated' };
    }

    // CRITICAL: Always fetch role from database, never trust metadata
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, is_blocked')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        return { authorized: false, error: 'User profile not found' };
    }

    // Check if user is blocked
    if (profile.is_blocked) {
        return { authorized: false, error: 'Account is blocked' };
    }

    return {
        authorized: true,
        user: {
            id: user.id,
            email: user.email || '',
            role: profile.role as UserRole,
        },
    };
}

/**
 * Require specific role(s) for an action
 * Returns the authenticated user if authorized, throws otherwise
 */
export async function requireRole(
    allowedRoles: UserRole | UserRole[]
): Promise<AuthenticatedUser> {
    const result = await getAuthenticatedUser();

    if (!result.authorized || !result.user) {
        throw new Error(result.error || 'Unauthorized');
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(result.user.role)) {
        throw new Error('Insufficient permissions');
    }

    return result.user;
}

/**
 * Verify user owns a specific hostel
 */
export async function verifyHostelOwnership(
    userId: string,
    hostelId: string
): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('hostels')
        .select('id')
        .eq('id', hostelId)
        .eq('owner_id', userId)
        .single();

    return !error && !!data;
}

/**
 * Verify student profile belongs to user
 */
export async function verifyStudentProfileOwnership(
    userId: string,
    studentProfileId: string
): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('id', studentProfileId)
        .eq('user_id', userId)
        .single();

    return !error && !!data;
}

/**
 * Get student's hostel ID for verification
 */
export async function getStudentHostelId(
    studentProfileId: string
): Promise<string | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('student_profiles')
        .select('hostel_id')
        .eq('id', studentProfileId)
        .single();

    return error ? null : data?.hostel_id;
}

/**
 * Verify ticket belongs to user's hostel (for owners)
 */
export async function verifyTicketAccess(
    userId: string,
    ticketId: string,
    role: UserRole
): Promise<boolean> {
    const supabase = await createClient();

    if (role === 'admin') {
        return true;
    }

    if (role === 'owner') {
        // Check if ticket belongs to owner's hostel
        const { data, error } = await supabase
            .from('tickets')
            .select(`
                hostel_id,
                hostels!inner (owner_id)
            `)
            .eq('id', ticketId)
            .single();

        if (error || !data) return false;
        
        // Cast to handle the join response type
        const hostelData = data as unknown as { hostel_id: string; hostels: { owner_id: string } };
        return hostelData.hostels?.owner_id === userId;
    }

    if (role === 'student') {
        // Check if ticket belongs to student
        const { data, error } = await supabase
            .from('tickets')
            .select(`
                student_profile_id,
                student_profiles!inner (user_id)
            `)
            .eq('id', ticketId)
            .single();

        if (error || !data) return false;
        
        const profileData = data as unknown as { student_profile_id: string; student_profiles: { user_id: string } };
        return profileData.student_profiles?.user_id === userId;
    }

    return false;
}

/**
 * Verify payment belongs to user's hostel (for owners)
 */
export async function verifyPaymentAccess(
    userId: string,
    paymentId: string,
    role: UserRole
): Promise<boolean> {
    const supabase = await createClient();

    if (role === 'admin') {
        return true;
    }

    if (role === 'owner') {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                hostel_id,
                hostels!inner (owner_id)
            `)
            .eq('id', paymentId)
            .single();

        if (error || !data) return false;
        
        const hostelData = data as unknown as { hostel_id: string; hostels: { owner_id: string } };
        return hostelData.hostels?.owner_id === userId;
    }

    return false;
}

/**
 * Rate limiting helper - tracks action counts
 * In production, use Redis or a proper rate limiting service
 */
const actionCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
    userId: string,
    action: string,
    maxAttempts: number = 10,
    windowMs: number = 60000
): boolean {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const record = actionCounts.get(key);

    if (!record || now > record.resetAt) {
        actionCounts.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (record.count >= maxAttempts) {
        return false;
    }

    record.count++;
    return true;
}
