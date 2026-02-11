import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getHostelById } from '@/lib/supabase/hostels';
import { HostelForm } from '@/components/HostelForm';
import { ArrowLeft } from 'lucide-react';
import { requireHostelOwner } from '@/lib/auth-guard';

interface EditHostelPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditHostelPageProps) {
    const { id } = await params;
    const hostel = await getHostelById(id);

    return {
        title: hostel ? `Edit ${hostel.name} | HostelM` : 'Edit Hostel | HostelM',
    };
}

export default async function EditHostelPage({ params }: EditHostelPageProps) {
    const { id } = await params;
    
    // SECURITY: Require owner role and verify hostel ownership
    const { auth } = await requireHostelOwner(id, `/dashboard/edit-hostel/${id}`);

    const hostel = await getHostelById(id);

    if (!hostel) {
        notFound();
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
                        Edit Hostel
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Update your hostel listing details
                    </p>
                </div>

                {/* Form */}
                <HostelForm hostel={hostel} userId={auth.user.id} mode="edit" />
            </div>
        </div>
    );
}
