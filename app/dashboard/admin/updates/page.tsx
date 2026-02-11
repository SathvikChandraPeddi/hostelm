import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAllUpdates } from '@/lib/update-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Megaphone, Plus, Globe, Building2 } from 'lucide-react';
import { CreateUpdateForm } from '@/components/CreateUpdateForm';
import { DeleteUpdateButton } from '@/components/DeleteUpdateButton';

export const metadata = {
    title: 'Updates | HostelM Admin',
};

export default async function AdminUpdatesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
    if (profile?.role !== 'admin') redirect('/dashboard');

    const updates = await getAllUpdates();

    // Get all hostels for the hostel selector
    const { data: allHostels } = await supabase
        .from('hostels')
        .select('id, name')
        .eq('is_approved', true)
        .order('name');

    const globalCount = updates.filter(u => u.is_global).length;
    const hostelCount = updates.filter(u => !u.is_global).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/dashboard/admin">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Updates</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage all announcements</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{updates.length}</p>
                        <p className="text-xs text-emerald-600/80 font-medium">Total</p>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-teal-600">{globalCount}</p>
                        <p className="text-xs text-teal-600/80 font-medium">Global</p>
                    </div>
                    <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-violet-600">{hostelCount}</p>
                        <p className="text-xs text-violet-600/80 font-medium">Hostel</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Create Form */}
                    <div className="lg:col-span-2">
                        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 sticky top-8">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-emerald-500" /> Post Update
                                </CardTitle>
                                <CardDescription>Global or hostel-specific announcements</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CreateUpdateForm
                                    isAdmin
                                    hostels={(allHostels || []).map(h => ({ id: h.id, name: h.name }))}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Updates List */}
                    <div className="lg:col-span-3 space-y-4">
                        {updates.length === 0 ? (
                            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                                <CardContent className="py-16 text-center">
                                    <Megaphone className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p className="text-muted-foreground">No updates yet.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            updates.map((update) => (
                                <Card key={update.id} className="border-0 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
                                    <div className={`h-1 ${update.is_global
                                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                                        : 'bg-gradient-to-r from-violet-400 to-indigo-400'
                                        }`} />
                                    <CardContent className="pt-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">{update.title}</h3>
                                            <Badge variant="outline" className={update.is_global
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400'
                                            }>
                                                {update.is_global ? (
                                                    <><Globe className="w-3 h-3 mr-1" /> Global</>
                                                ) : (
                                                    <><Building2 className="w-3 h-3 mr-1" /> {update.hostels?.name || 'Hostel'}</>
                                                )}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed mb-3">
                                            {update.content}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-400">
                                                By {update.users?.name || 'Admin'} · {new Date(update.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <DeleteUpdateButton updateId={update.id} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
