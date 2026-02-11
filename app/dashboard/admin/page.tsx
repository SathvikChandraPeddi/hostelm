import Link from 'next/link';
import { getAdminStats, getAllUsers, getAllHostelsAdmin } from '@/lib/supabase/admin';
import { AdminStatsCards } from '@/components/admin/AdminStatsCards';
import { UsersTable } from '@/components/admin/UsersTable';
import { HostelsTable } from '@/components/admin/HostelsTable';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, IndianRupee, Ticket, Megaphone, ChevronRight } from 'lucide-react';
import { requireAdmin } from '@/lib/auth-guard';

export const metadata = {
    title: 'Admin Dashboard | HostelM',
    description: 'Manage users and hostels',
};

export default async function AdminDashboardPage() {
    // SECURITY: Require admin role from database
    const authResult = await requireAdmin('/dashboard/admin');

    // Fetch admin data
    const [stats, users, hostels] = await Promise.all([
        getAdminStats(),
        getAllUsers(),
        getAllHostelsAdmin(),
    ]);

    const quickActions = [
        {
            href: '/dashboard/admin/payments',
            icon: IndianRupee,
            title: 'Payments & Dues',
            description: 'Hostel-wise payment overview',
            gradient: 'from-violet-500 to-indigo-600',
            shadowColor: 'shadow-violet-500/20',
        },
        {
            href: '/dashboard/admin/tickets',
            icon: Ticket,
            title: 'Tickets',
            description: 'Monitor student issues',
            gradient: 'from-amber-500 to-orange-600',
            shadowColor: 'shadow-amber-500/20',
        },
        {
            href: '/dashboard/admin/updates',
            icon: Megaphone,
            title: 'Updates',
            description: 'Post announcements',
            gradient: 'from-emerald-500 to-teal-600',
            shadowColor: 'shadow-emerald-500/20',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 animate-fadeIn">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Admin Dashboard
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Manage users, hostels, and platform settings
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <AdminStatsCards stats={stats} />
                </div>

                {/* Quick Actions */}
                <div className="mb-10 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {quickActions.map((action, index) => (
                            <Link key={action.href} href={action.href}>
                                <Card className={`group border-0 shadow-md hover:shadow-xl ${action.shadowColor} transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full`}>
                                    <CardContent className="p-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                                    <action.icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">{action.title}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{action.description}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Tables */}
                <div className="space-y-8">
                    <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                        <UsersTable users={users} currentUserId={authResult.user.id} />
                    </div>
                    <div className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                        <HostelsTable hostels={hostels} />
                    </div>
                </div>
            </div>
        </div>
    );
}
