import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { HostelForm } from '@/components/HostelForm';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    title: 'Add Hostel | HostelM',
    description: 'Add a new hostel listing',
};

export default async function AddHostelPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?redirect=/dashboard/add-hostel');
    }

    // Check if user is owner - try profile first, then auth metadata
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    const userRole = profile?.role || user.user_metadata?.role;

    if (userRole !== 'owner') {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Back Link */}
                <Link
                    href="/dashboard/owner"
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to My Hostels
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                        Add New Hostel
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Create a new listing for your hostel
                    </p>
                </div>

                {/* Form */}
                <HostelForm userId={user.id} mode="create" />
            </div>
        </div>
    );
}
