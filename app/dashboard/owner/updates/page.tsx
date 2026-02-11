import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getOwnerHostels } from '@/lib/supabase/hostels';
import { getOwnerUpdates } from '@/lib/update-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Megaphone, Plus } from 'lucide-react';
import { CreateUpdateForm } from '@/components/CreateUpdateForm';
import { DeleteUpdateButton } from '@/components/DeleteUpdateButton';

export const metadata = {
    title: 'Updates | HostelM Owner',
};

export default async function OwnerUpdatesPage({
    searchParams,
}: {
    searchParams: Promise<{ hostel?: string }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
    if (profile?.role !== 'owner') redirect('/dashboard');

    const hostels = await getOwnerHostels(user.id);
    if (hostels.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                <div className="container mx-auto px-4 py-16 text-center">
                    <p className="text-slate-500">You need to add a hostel first.</p>
                    <Link href="/dashboard/add-hostel"><Button className="mt-4">Add Hostel</Button></Link>
                </div>
            </div>
        );
    }

    const resolvedParams = await searchParams;
    const selectedHostelId = resolvedParams.hostel || hostels[0].id;
    const selectedHostelName = hostels.find(h => h.id === selectedHostelId)?.name || 'Hostel';

    const updates = await getOwnerUpdates(selectedHostelId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/owner">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Updates</h1>
                            <p className="text-slate-500 dark:text-slate-400">{selectedHostelName}</p>
                        </div>
                    </div>

                    {hostels.length > 1 && (
                        <div className="flex gap-2 flex-wrap">
                            {hostels.map(h => (
                                <Link
                                    key={h.id}
                                    href={`/dashboard/owner/updates?hostel=${h.id}`}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedHostelId === h.id
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                                        }`}
                                >
                                    {h.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Create Form */}
                    <div className="lg:col-span-2">
                        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 sticky top-8">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-emerald-500" /> Post Update
                                </CardTitle>
                                <CardDescription>Share news with your students</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CreateUpdateForm
                                    hostelId={selectedHostelId}
                                    hostels={hostels.map(h => ({ id: h.id, name: h.name }))}
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
                                    <p className="text-muted-foreground">No updates posted yet.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            updates.map((update) => (
                                <Card key={update.id} className="border-0 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
                                    <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
                                    <CardContent className="pt-5">
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{update.title}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed mb-3">
                                            {update.content}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-400">
                                                {new Date(update.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
