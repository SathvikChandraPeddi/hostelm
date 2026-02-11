'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30 dark:from-slate-950 dark:via-red-950/10 dark:to-slate-900 flex items-center justify-center px-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 -left-20 w-72 h-72 bg-red-300/20 dark:bg-red-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-orange-300/20 dark:bg-orange-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative text-center max-w-lg mx-auto">
                {/* Icon */}
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/25 animate-pulse">
                    <AlertTriangle className="w-10 h-10 text-white" />
                </div>

                {/* Text */}
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                    Something went wrong
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg mb-4 max-w-md mx-auto">
                    We encountered an unexpected error. Don&apos;t worry, our team has been notified.
                </p>

                {/* Error digest for debugging */}
                {error.digest && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        size="lg"
                        onClick={reset}
                        className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                    <Link href="/">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 dark:border-slate-700">
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Button>
                    </Link>
                </div>

                {/* Help text */}
                <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
                    If the problem persists, please contact{' '}
                    <a href="mailto:support@hostelm.com" className="text-violet-600 dark:text-violet-400 hover:underline">
                        support@hostelm.com
                    </a>
                </p>
            </div>
        </div>
    );
}
