/**
 * Centralized Role Guard for Server Components
 * Use this in ALL page components for consistent role-based access control
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cache } from 'react';

export type UserRole = 'student' | 'owner' | 'admin';

export interface AuthGuardResult {
    user: {
        id: string;
        email: string;
    };
    role: UserRole;
    isBlocked: boolean;
}

/**
 * Cached auth fetch - prevents multiple DB calls per request
 * React's cache() deduplicates calls within the same request
 */
const getAuthData = cache(async () => {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        return { user: null, profile: null };
    }
    
    // Fetch role from database
    const { data: profile } = await supabase
        .from('users')
        .select('role, is_blocked')
        .eq('id', user.id)
        .single();
    
    return { user, profile };
});

/**
 * Route Configuration
 * Defines which roles can access which routes
 */
export const ROUTE_PERMISSIONS = {
    // Admin-only routes
    '/dashboard/admin': ['admin'],
    '/dashboard/admin/payments': ['admin'],
    '/dashboard/admin/tickets': ['admin'],
    '/dashboard/admin/updates': ['admin'],
    
    // Owner-only routes (admin can also access)
    '/dashboard/owner': ['owner', 'admin'],
    '/dashboard/owner/payments': ['owner', 'admin'],
    '/dashboard/owner/tickets': ['owner', 'admin'],
    '/dashboard/owner/updates': ['owner', 'admin'],
    '/dashboard/owner/students': ['owner', 'admin'],
    '/dashboard/add-hostel': ['owner', 'admin'],
    '/dashboard/edit-hostel': ['owner', 'admin'],
    
    // Student-only routes
    '/student/dashboard': ['student'],
    '/student/payments': ['student'],
    '/student/tickets': ['student'],
    '/student/updates': ['student'],
    
    // Generic dashboard (redirects based on role)
    '/dashboard': ['student', 'owner', 'admin'],
    
    // Join hostel (students without profile)
    '/join-hostel': ['student'],
} as const;

/**
 * Get role-specific dashboard URL
 */
export function getRoleDashboard(role: UserRole): string {
    switch (role) {
        case 'admin':
            return '/dashboard/admin';
        case 'owner':
            return '/dashboard/owner';
        case 'student':
            return '/student/dashboard';
        default:
            return '/dashboard';
    }
}

/**
 * Require authentication only - returns user info
 * Use when you need auth but will handle role checks manually
 */
export async function requireAuth(redirectTo?: string): Promise<AuthGuardResult> {
    const { user, profile } = await getAuthData();
    
    if (!user) {
        const loginUrl = redirectTo 
            ? `/login?redirect=${encodeURIComponent(redirectTo)}`
            : '/login';
        redirect(loginUrl);
    }
    
    if (!profile) {
        // User exists in auth but not in users table - serious issue
        console.error('Auth guard: User profile not found', user.id);
        redirect('/login?error=profile_not_found');
    }
    
    // Block access for blocked users
    if (profile.is_blocked) {
        redirect('/login?error=account_blocked');
    }
    
    return {
        user: {
            id: user.id,
            email: user.email || '',
        },
        role: profile.role as UserRole,
        isBlocked: profile.is_blocked,
    };
}

/**
 * Require specific role(s) - use this in page components
 * Throws redirect if user doesn't have required role
 */
export async function requireRole(
    allowedRoles: UserRole | UserRole[],
    redirectTo?: string
): Promise<AuthGuardResult> {
    const auth = await requireAuth(redirectTo);
    
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(auth.role)) {
        // Redirect to appropriate dashboard based on actual role
        redirect(getRoleDashboard(auth.role));
    }
    
    return auth;
}

/**
 * Require admin role specifically
 */
export async function requireAdmin(redirectTo?: string): Promise<AuthGuardResult> {
    return requireRole('admin', redirectTo);
}

/**
 * Require owner role (or admin)
 */
export async function requireOwner(redirectTo?: string): Promise<AuthGuardResult> {
    return requireRole(['owner', 'admin'], redirectTo);
}

/**
 * Require student role specifically
 */
export async function requireStudent(redirectTo?: string): Promise<AuthGuardResult> {
    return requireRole('student', redirectTo);
}

/**
 * Require student with active hostel profile
 * Returns the student profile along with auth result
 */
export async function requireStudentWithProfile(redirectTo?: string): Promise<{
    auth: AuthGuardResult;
    profileId: string;
    hostelId: string;
}> {
    const auth = await requireRole('student', redirectTo);
    
    const supabase = await createClient();
    
    const { data: profile, error } = await supabase
        .from('student_profiles')
        .select('id, hostel_id')
        .eq('user_id', auth.user.id)
        .single();
    
    if (error || !profile) {
        // Student without profile - redirect to join hostel
        redirect('/join-hostel');
    }
    
    return {
        auth,
        profileId: profile.id,
        hostelId: profile.hostel_id,
    };
}

/**
 * Verify owner has access to specific hostel
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
 * Require owner with access to specific hostel
 * Returns the hostel data if authorized
 */
export async function requireHostelOwner(
    hostelId: string,
    redirectTo?: string
): Promise<{
    auth: AuthGuardResult;
    hostelId: string;
}> {
    const auth = await requireRole(['owner', 'admin'], redirectTo);
    
    // Admins can access any hostel
    if (auth.role === 'admin') {
        return { auth, hostelId };
    }
    
    // Owners must own the hostel
    const isOwner = await verifyHostelOwnership(auth.user.id, hostelId);
    
    if (!isOwner) {
        redirect('/dashboard/owner');
    }
    
    return { auth, hostelId };
}
