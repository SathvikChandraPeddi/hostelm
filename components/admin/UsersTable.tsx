'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Ban, CheckCircle, Trash2, Users, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import type { UserWithDetails } from '@/lib/supabase/admin';

interface UsersTableProps {
    users: UserWithDetails[];
    currentUserId: string;
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleBlock = async (userId: string, currentlyBlocked: boolean) => {
        setLoading(userId);

        const { error } = await supabase
            .from('users')
            .update({ is_blocked: !currentlyBlocked })
            .eq('id', userId);

        if (error) {
            alert('Failed to update user');
        }

        setLoading(null);
        router.refresh();
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        setLoading(userId);

        const { error } = await supabase
            .from('users')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            alert('Failed to update role');
        }

        setLoading(null);
        router.refresh();
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        setLoading(userId);

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) {
            alert('Failed to delete user');
        }

        setLoading(null);
        router.refresh();
    };

    const getRoleBadgeStyle = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'owner':
                return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400';
            default:
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    return (
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Users Management</CardTitle>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{users.length} total users</p>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full sm:w-64"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full table-modern">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="text-left py-4 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                                <th className="text-left py-4 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                                <th className="text-left py-4 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="text-left py-4 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="text-right py-4 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                    {user.name?.charAt(0).toUpperCase() || '?'}
                                                </span>
                                            </div>
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {user.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-5 text-slate-600 dark:text-slate-400 text-sm">
                                        {user.email}
                                    </td>
                                    <td className="py-4 px-5">
                                        <Select
                                            value={user.role}
                                            onValueChange={(value) => handleRoleChange(user.id, value)}
                                            disabled={user.id === currentUserId}
                                        >
                                            <SelectTrigger className="w-28 h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="student">Student</SelectItem>
                                                <SelectItem value="owner">Owner</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="py-4 px-5">
                                        <Badge variant={user.is_blocked ? 'destructive' : 'success'} className="text-xs">
                                            {user.is_blocked ? 'Blocked' : 'Active'}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-5">
                                        <div className="flex items-center justify-end gap-2">
                                            {loading === user.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                            ) : (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleToggleBlock(user.id, user.is_blocked)}
                                                        disabled={user.id === currentUserId}
                                                        className={`h-8 w-8 p-0 ${user.is_blocked 
                                                            ? 'border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900 dark:hover:bg-green-950' 
                                                            : 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-950'}`}
                                                        title={user.is_blocked ? 'Unblock user' : 'Block user'}
                                                    >
                                                        {user.is_blocked ? (
                                                            <CheckCircle className="w-4 h-4" />
                                                        ) : (
                                                            <Ban className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDelete(user.id)}
                                                        disabled={user.id === currentUserId}
                                                        className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                                <Users className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400">
                                {searchQuery ? 'No users match your search' : 'No users found'}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
