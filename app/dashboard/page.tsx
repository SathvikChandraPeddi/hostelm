import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, User, Search, ArrowRight, Plus } from 'lucide-react';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    // Get role from profile first, then from auth metadata as fallback
    const displayName = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
    const userRole = profile?.role || user.user_metadata?.role || 'student';

    // Redirect admin to admin dashboard
    if (userRole === 'admin') {
        redirect('/dashboard/admin');
    }


    // Verify student profile
    let studentProfile = null;
    if (userRole === 'student') {
        const { data } = await supabase
            .from('student_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();
        studentProfile = data;

        if (studentProfile) {
            redirect('/student/dashboard');
        } else {
            redirect('/join-hostel');
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Welcome back, {displayName}! 👋
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Manage your hostel listings
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Owner Actions */}
                    <Link href="/dashboard/owner" className="block">
                        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 hover:shadow-xl transition-shadow cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">My Hostels</CardTitle>
                                    <CardDescription>View and manage listings</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/dashboard/add-hostel" className="block">
                        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 hover:shadow-xl transition-shadow cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Add Hostel</CardTitle>
                                    <CardDescription>Create new listing</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 h-full">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <CardTitle className="text-lg capitalize">{userRole}</CardTitle>
                                <CardDescription>{user.email}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* CTA Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-violet-500 to-indigo-600 text-white">
                    <CardHeader>
                        <CardTitle className="text-xl">
                            Grow Your Business
                        </CardTitle>
                        <CardDescription className="text-violet-100">
                            Add your hostels and reach thousands of students looking for accommodation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/owner">
                            <Button variant="secondary" className="bg-white text-violet-600 hover:bg-violet-50">
                                Manage Hostels
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
