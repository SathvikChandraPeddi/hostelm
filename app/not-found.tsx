'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-violet-950/20 dark:to-slate-900 flex items-center justify-center px-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-violet-300/20 dark:bg-violet-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative text-center max-w-lg mx-auto">
                {/* 404 Number */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="mb-6"
                >
                    <span className="text-[150px] md:text-[200px] font-bold leading-none bg-gradient-to-br from-violet-500 to-indigo-600 bg-clip-text text-transparent">
                        404
                    </span>
                </motion.div>

                {/* Icon */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mx-auto w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/25"
                >
                    <MapPin className="w-10 h-10 text-white" />
                </motion.div>

                {/* Text */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                        Page Not Found
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto">
                        Oops! The page you&apos;re looking for seems to have checked out. Let&apos;s get you back on track.
                    </p>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                    <Link href="/">
                        <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 shadow-lg shadow-violet-500/25">
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Button>
                    </Link>
                    <Link href="/hostels">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 dark:border-slate-700">
                            <Search className="w-4 h-4 mr-2" />
                            Browse Hostels
                        </Button>
                    </Link>
                </motion.div>

                {/* Back link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8"
                >
                    <button
                        onClick={() => window.history.back()}
                        className="text-sm text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-flex items-center gap-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go back to previous page
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
