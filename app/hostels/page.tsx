import { Suspense } from 'react';
import { getHostels } from '@/lib/supabase/hostels';
import { HostelGridSkeleton } from '@/components/HostelCardSkeleton';
import { HostelsPageClient } from '@/components/HostelsPageClient';
import { Search } from 'lucide-react';

export const metadata = {
    title: 'Browse Hostels | HostelM',
    description: 'Discover and compare hostels near your college or university.',
};

async function HostelGrid() {
    const hostels = await getHostels();
    return <HostelsPageClient initialHostels={hostels} />;
}

export default function HostelsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Browse Hostels
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        Find your perfect hostel accommodation
                    </p>
                </div>

                {/* Hostels Grid with Search/Filter */}
                <Suspense fallback={<HostelGridSkeleton />}>
                    <HostelGrid />
                </Suspense>
            </div>
        </div>
    );
}
