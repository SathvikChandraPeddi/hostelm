import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Building2, User, Phone, MapPin, Calendar, IndianRupee, Ticket, Megaphone,
    BedDouble, Layers, CheckCircle2, AlertCircle, ChevronRight, Sparkles
} from 'lucide-react';
import { requireStudentWithProfile } from '@/lib/auth-guard';

export const metadata = {
    title: 'Dashboard | HostelM Student',
    description: 'Your student dashboard',
};

export default async function StudentDashboardPage() {
    // SECURITY: Require student role and profile from database
    const { profileId, hostelId } = await requireStudentWithProfile('/student/dashboard');
    
    const supabase = await createClient();

    // Fetch full profile data
    const { data: profile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

    if (!profile) {
        const { redirect } = await import('next/navigation');
        redirect('/join-hostel');
    }

    // Fetch hostel details for the profile
    const { data: hostelDetails } = await supabase
        .from('hostels')
        .select('name, address, area, owner_phone, logo_url')
        .eq('id', hostelId)
        .single();

    // Fetch pending payments count
    const { count: dueCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('student_profile_id', profile.id)
        .eq('status', 'due');

    // Fetch open tickets count
    const { count: openTickets } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('student_profile_id', profile.id)
        .in('status', ['open', 'in_progress']);

    const hostel = hostelDetails as {
        name: string;
        address: string;
        area: string;
        owner_phone: string;
        logo_url?: string;
    };

    const monthlyRent = profile.monthly_rent || 5000;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Welcome Header */}
                <div className="animate-fade-in mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 overflow-hidden">
                                    {hostel.logo_url ? (
                                        <Image
                                            src={hostel.logo_url}
                                            alt={hostel.name}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Building2 className="w-8 h-8 text-white" />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                        Welcome back, {profile.name.split(' ')[0]}!
                                    </h1>
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                                    <Building2 className="w-4 h-4" />
                                    {hostel.name}
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="self-start sm:self-auto px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            Active Resident
                        </Badge>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800/60 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                                <BedDouble className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{profile.room_number || '-'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Room Number</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800/60 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{profile.floor_number || '-'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Floor</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800/60 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{monthlyRent.toLocaleString('en-IN')}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Rent</p>
                    </div>

                    <div className={`rounded-2xl p-5 shadow-sm border transition-shadow hover:shadow-md ${(dueCount || 0) > 0
                        ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50'
                        : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60'
                        }`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(dueCount || 0) > 0
                                ? 'bg-red-100 dark:bg-red-900/30'
                                : 'bg-slate-100 dark:bg-slate-800'
                                }`}>
                                {(dueCount || 0) > 0 ? (
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                )}
                            </div>
                        </div>
                        <p className={`text-2xl font-bold ${(dueCount || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                            {dueCount || 0}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Pending Dues</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8 animate-fade-in-up stagger-2">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link href="/student/payments" className="group">
                            <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-all group-hover:-translate-y-1">
                                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
                                    <IndianRupee className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Payments</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">View dues & history</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>

                        <Link href="/student/tickets" className="group">
                            <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-800 transition-all group-hover:-translate-y-1">
                                <div className="relative w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-shadow">
                                    <Ticket className="w-7 h-7 text-white" />
                                    {(openTickets || 0) > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                            {openTickets}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Tickets</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Raise issues</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>

                        <Link href="/student/updates" className="group">
                            <div className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group-hover:-translate-y-1">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
                                    <Megaphone className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Updates</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Announcements</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-5 gap-6 animate-fade-in-up stagger-3">
                    {/* Hostel Info Card */}
                    <Card className="lg:col-span-3 border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                        <div className="h-32 bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 relative">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-slate-900" />
                        </div>
                        <CardHeader className="relative pb-0 -mt-12">
                            <div className="flex items-end gap-4">
                                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-1 flex items-center justify-center border-4 border-white dark:border-slate-900 overflow-hidden">
                                    {hostel.logo_url ? (
                                        <Image
                                            src={hostel.logo_url}
                                            alt={hostel.name}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                    ) : (
                                        <Building2 className="w-8 h-8 text-violet-600" />
                                    )}
                                </div>
                                <div className="pb-1">
                                    <CardTitle className="text-xl">{hostel.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-3 h-3" />
                                        {hostel.area}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Owner Contact</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">{hostel.owner_phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined On</p>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {new Date(profile.joined_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {hostel.address}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Profile Card */}
                    <Card className="lg:col-span-2 border-0 shadow-lg bg-white dark:bg-slate-900">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                                    <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                <CardTitle className="text-lg">Your Profile</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</p>
                                <p className="font-semibold text-slate-900 dark:text-white">{profile.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone Number</p>
                                <p className="font-semibold text-slate-900 dark:text-white">{profile.phone_number}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Institution</p>
                                <p className="font-semibold text-slate-900 dark:text-white">{profile.college_or_workplace || 'Not specified'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Guardian Contact</p>
                                <p className="font-semibold text-slate-900 dark:text-white">{profile.parent_phone || 'Not specified'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
