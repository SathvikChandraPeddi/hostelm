import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function HostelNotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4">
            <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <Building2 className="w-10 h-10 text-slate-400" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Hostel Not Found
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    The hostel you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <Link href="/hostels">
                    <Button className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Hostels
                    </Button>
                </Link>
            </div>
        </div>
    );
}
