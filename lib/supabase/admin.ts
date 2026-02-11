import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/security';
import { uuidSchema, userRoleSchema, validateInput } from '@/lib/validation';

export interface AdminStats {
    totalUsers: number;
    totalHostels: number;
    approvedHostels: number;
    totalVacantBeds: number;
}

export interface UserWithDetails {
    id: string;
    name: string;
    email: string;
    role: string;
    is_blocked: boolean;
    created_at: string;
}

export interface HostelWithOwner {
    id: string;
    name: string;
    area: string;
    price: number;
    total_beds: number;
    vacant_beds: number;
    is_approved: boolean;
    created_at: string;
    owner_id: string;
    owner_name: string | null;
    owner_email: string | null;
}

// Get admin dashboard statistics
export async function getAdminStats(): Promise<AdminStats> {
    // SECURITY: Require admin role
    try {
        await requireRole('admin');
    } catch {
        console.error('Unauthorized admin stats access');
        return { totalUsers: 0, totalHostels: 0, approvedHostels: 0, totalVacantBeds: 0 };
    }

    const supabase = await createClient();

    const [usersResult, hostelsResult, approvedResult, bedsResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('hostels').select('id', { count: 'exact', head: true }),
        supabase.from('hostels').select('id', { count: 'exact', head: true }).eq('is_approved', true),
        supabase.from('hostels').select('vacant_beds'),
    ]);

    const totalVacantBeds = bedsResult.data?.reduce((sum, h) => sum + (h.vacant_beds || 0), 0) || 0;

    return {
        totalUsers: usersResult.count || 0,
        totalHostels: hostelsResult.count || 0,
        approvedHostels: approvedResult.count || 0,
        totalVacantBeds,
    };
}

// Get all users for admin
export async function getAllUsers(): Promise<UserWithDetails[]> {
    // SECURITY: Require admin role
    try {
        await requireRole('admin');
    } catch {
        console.error('Unauthorized user list access');
        return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, is_blocked, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }

    return data || [];
}

// Toggle user block status
export async function toggleUserBlock(userId: string, isBlocked: boolean): Promise<boolean> {
    // SECURITY: Require admin role
    try {
        await requireRole('admin');
    } catch {
        console.error('Unauthorized block attempt');
        return false;
    }

    // SECURITY: Validate user ID
    const validation = validateInput(uuidSchema, userId);
    if (!validation.success) {
        console.error('Invalid user ID');
        return false;
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('users')
        .update({ is_blocked: isBlocked })
        .eq('id', userId);

    if (error) {
        console.error('Error toggling user block:', error);
        return false;
    }

    return true;
}

// Update user role
export async function updateUserRole(userId: string, role: string): Promise<boolean> {
    // SECURITY: Require admin role
    try {
        await requireRole('admin');
    } catch {
        console.error('Unauthorized role update attempt');
        return false;
    }

    // SECURITY: Validate inputs
    const idValidation = validateInput(uuidSchema, userId);
    const roleValidation = validateInput(userRoleSchema, role);
    
    if (!idValidation.success || !roleValidation.success) {
        console.error('Invalid user ID or role');
        return false;
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('users')
        .update({ role: roleValidation.data })
        .eq('id', userId);

    if (error) {
        console.error('Error updating user role:', error);
        return false;
    }

    return true;
}

// Delete user
export async function deleteUser(userId: string): Promise<boolean> {
    // SECURITY: Require admin role
    try {
        await requireRole('admin');
    } catch {
        console.error('Unauthorized user delete attempt');
        return false;
    }

    // SECURITY: Validate user ID
    const validation = validateInput(uuidSchema, userId);
    if (!validation.success) {
        console.error('Invalid user ID');
        return false;
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

    if (error) {
        console.error('Error deleting user:', error);
        return false;
    }

    return true;
}

// Get all hostels with owner info for admin
export async function getAllHostelsAdmin(): Promise<HostelWithOwner[]> {
    // SECURITY: Require admin role
    try {
        await requireRole('admin');
    } catch {
        console.error('Unauthorized hostel list access');
        return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('hostels')
        .select(`
            id,
            name,
            area,
            price,
            total_beds,
            vacant_beds,
            is_approved,
            created_at,
            owner_id
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching hostels:', error);
        return [];
    }

    // Fetch owner details separately
    const hostelsWithOwners = await Promise.all(
        (data || []).map(async (hostel) => {
            let owner_name = null;
            let owner_email = null;

            if (hostel.owner_id) {
                const { data: owner } = await supabase
                    .from('users')
                    .select('name, email')
                    .eq('id', hostel.owner_id)
                    .single();

                if (owner) {
                    owner_name = owner.name;
                    owner_email = owner.email;
                }
            }

            return {
                ...hostel,
                owner_name,
                owner_email,
            };
        })
    );

    return hostelsWithOwners;
}

// Toggle hostel approval
export async function toggleHostelApproval(hostelId: string, isApproved: boolean): Promise<boolean> {
    // SECURITY: Require admin role
    try {
        await requireRole('admin');
    } catch {
        console.error('Unauthorized approval toggle attempt');
        return false;
    }

    // SECURITY: Validate hostel ID
    const validation = validateInput(uuidSchema, hostelId);
    if (!validation.success) {
        console.error('Invalid hostel ID');
        return false;
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('hostels')
        .update({ is_approved: isApproved })
        .eq('id', hostelId);

    if (error) {
        console.error('Error toggling hostel approval:', error);
        return false;
    }

    return true;
}

// Delete hostel (admin)
export async function deleteHostelAdmin(hostelId: string): Promise<boolean> {
    // SECURITY: Require admin role
    try {
        await requireRole('admin');
    } catch {
        console.error('Unauthorized hostel delete attempt');
        return false;
    }

    // SECURITY: Validate hostel ID
    const validation = validateInput(uuidSchema, hostelId);
    if (!validation.success) {
        console.error('Invalid hostel ID');
        return false;
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('hostels')
        .delete()
        .eq('id', hostelId);

    if (error) {
        console.error('Error deleting hostel:', error);
        return false;
    }

    return true;
}
