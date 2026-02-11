import Link from 'next/link';
import { getOwnerHostels } from '@/lib/supabase/hostels';
import { OwnerHostelCard } from '@/components/OwnerHostelCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Building2, User, IndianRupee, Ticket, Megaphone, Bed, TrendingUp, Users } from 'lucide-react';
import { requireOwner } from '@/lib/auth-guard';

export const metadata = {
    title: 'My Hostels | HostelM',
    description: 'Manage your hostel listings',
};

export default async function OwnerDashboardPage() {
    // SECURITY: Require owner role from database
    const authResult = await requireOwner('/dashboard/owner');

    const hostels = await getOwnerHostels(authResult.user.id);
    
    // Calculate stats
    const totalBeds = hostels.reduce((sum, h) => sum + h.total_beds, 0);
    const vacantBeds = hostels.reduce((sum, h) => sum + h.vacant_beds, 0);
    const occupiedBeds = totalBeds - vacantBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fadeIn">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                            Owner Dashboard
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Manage your hostel listings and tenants
                        </p>
                    </div>
                    <Link href="/dashboard/add-hostel">
                        <Button className="gap-2 shadow-lg shadow-violet-500/25">
                            <Plus className="w-4 h-4" />
                            Add Hostel
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-violet-100 text-sm font-medium">Total Hostels</p>
                                    <p className="text-3xl font-bold mt-1">{hostels.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Building2 className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">Total Beds</p>
                                    <p className="text-3xl font-bold mt-1">{totalBeds}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Bed className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Occupied</p>
                                    <p className="text-3xl font-bold mt-1">{occupiedBeds}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-100 text-sm font-medium">Occupancy</p>
                                    <p className="text-3xl font-bold mt-1">{occupancyRate}%</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Section Title */}
                <div className="flex items-center gap-3 mb-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Your Hostels</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Click on a hostel to manage</p>
                    </div>
                </div>

                {/* Hostels Grid */}
                {hostels.length === 0 ? (
                    <Card className="border-0 shadow-lg animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                        <CardContent className="py-16 text-center">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mb-6">
                                <Building2 className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                No hostels yet
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                                Start by adding your first hostel listing. You can manage students, payments, and more from here.
                            </p>
                            <Link href="/dashboard/add-hostel">
                                <Button className="gap-2 shadow-lg shadow-violet-500/25">
                                    <Plus className="w-4 h-4" />
                                    Add Your First Hostel
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {hostels.map((hostel, index) => (
                            <div 
                                key={hostel.id} 
                                className="group animate-fadeInUp"
                                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                            >
                                <OwnerHostelCard hostel={hostel} />
                                <div className="mt-3 grid grid-cols-4 gap-2">
                                    <Link href={`/dashboard/owner/students/${hostel.id}`}>
                                        <Button variant="outline" size="sm" className="w-full text-xs gap-1 h-9">
                                            <User className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Students</span>
                                        </Button>
                                    </Link>
                                    <Link href={`/dashboard/owner/payments?hostel=${hostel.id}`}>
                                        <Button variant="outline" size="sm" className="w-full border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300 dark:border-violet-900 dark:text-violet-400 dark:hover:bg-violet-950 text-xs gap-1 h-9">
                                            <IndianRupee className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Payments</span>
                                        </Button>
                                    </Link>
                                    <Link href={`/dashboard/owner/tickets?hostel=${hostel.id}`}>
                                        <Button variant="outline" size="sm" className="w-full border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950 text-xs gap-1 h-9">
                                            <Ticket className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Tickets</span>
                                        </Button>
                                    </Link>
                                    <Link href={`/dashboard/owner/updates?hostel=${hostel.id}`}>
                                        <Button variant="outline" size="sm" className="w-full border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950 text-xs gap-1 h-9">
                                            <Megaphone className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Updates</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
