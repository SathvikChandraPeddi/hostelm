import { redirect } from 'next/navigation';
import Link from 'next/link';
import { HostelForm } from '@/components/HostelForm';
import { ArrowLeft } from 'lucide-react';
import { requireOwner } from '@/lib/auth-guard';

export const metadata = {
    title: 'Add Hostel | HostelM',
    description: 'Add a new hostel listing',
};

export default async function AddHostelPage() {
    // SECURITY: Require owner role (or admin)
    const { user } = await requireOwner('/dashboard/add-hostel');

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
