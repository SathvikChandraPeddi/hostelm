import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getStudentProfile } from '@/lib/supabase/students';
import { getStudentUpdates } from '@/lib/update-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Megaphone, Globe, Building2, Bell, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const metadata = {
    title: 'Updates | HostelM Student',
};

export default async function StudentUpdatesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const profile = await getStudentProfile(user.id);
    if (!profile) redirect('/join-hostel');

    const updates = await getStudentUpdates(profile.hostel_id);
    const globalCount = updates.filter((u: { is_global: boolean }) => u.is_global).length;
    const hostelCount = updates.filter((u: { is_global: boolean }) => !u.is_global).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 animate-fade-in">
                    <Link href="/student/dashboard">
                        <Button variant="outline" size="icon" className="rounded-xl h-11 w-11">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Updates</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Announcements from your hostel & admin</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <Megaphone className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Stats */}
                {updates.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in-up">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-800/60">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{globalCount}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Global Updates</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-800/60">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{hostelCount}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Hostel Updates</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Updates List */}
                {updates.length === 0 ? (
                    <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 animate-fade-in-up">
                        <CardContent className="py-20 text-center">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No updates yet</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
                                When your hostel or admin posts announcements, they&apos;ll appear here.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4 animate-fade-in-up">
                        {updates.map((update: { id: string; is_global: boolean; title: string; content: string; users?: { name: string }; hostels?: { name: string }; created_at: string }, index: number) => (
                            <Card
                                key={update.id}
                                className="border-0 shadow-sm hover:shadow-md bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className={`h-1 ${update.is_global ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gradient-to-r from-violet-400 to-indigo-400'}`} />
                                <CardContent className="pt-5 pb-5">
                                    <div className="flex justify-between items-start gap-3 mb-3">
                                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white leading-snug">{update.title}</h3>
                                        <Badge variant="outline" className={`shrink-0 ${update.is_global
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                            : 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800'
                                            }`}>
                                            {update.is_global ? (
                                                <><Globe className="w-3 h-3" /> Global</>
                                            ) : (
                                                <><Building2 className="w-3 h-3" /> Hostel</>
                                            )}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed mb-4">
                                        {update.content}
                                    </p>
                                    <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            Posted by <span className="font-medium text-slate-700 dark:text-slate-300">{update.users?.name || 'Admin'}</span>
                                            {update.hostels?.name && <span className="text-slate-400"> · {update.hostels.name}</span>}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(update.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
