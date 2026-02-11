import { getOwnerHostels } from '@/lib/supabase/hostels';
import { getHostelTickets } from '@/lib/ticket-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Ticket, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { OwnerTicketCard } from '@/components/OwnerTicketCard';
import { requireOwner } from '@/lib/auth-guard';

export const metadata = {
    title: 'Tickets | HostelM Owner',
};

export default async function OwnerTicketsPage({
    searchParams,
}: {
    searchParams: Promise<{ hostel?: string; status?: string }>;
}) {
    // SECURITY: Require owner role from database
    const authResult = await requireOwner('/dashboard/owner/tickets');

    const hostels = await getOwnerHostels(authResult.user.id);
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
    const selectedStatus = resolvedParams.status || 'all';
    const selectedHostelName = hostels.find(h => h.id === selectedHostelId)?.name || 'Hostel';

    const tickets = await getHostelTickets(selectedHostelId, selectedStatus);

    const openCount = tickets.filter(t => t.status === 'open').length;
    const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

    const statusFilters = [
        { key: 'all', label: 'All', count: tickets.length },
        { key: 'open', label: 'Open', count: openCount, color: 'text-amber-600' },
        { key: 'in_progress', label: 'In Progress', count: inProgressCount, color: 'text-blue-600' },
        { key: 'resolved', label: 'Resolved', count: resolvedCount, color: 'text-green-600' },
    ];

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
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tickets</h1>
                            <p className="text-slate-500 dark:text-slate-400">{selectedHostelName}</p>
                        </div>
                    </div>

                    {/* Hostel Selector */}
                    {hostels.length > 1 && (
                        <div className="flex gap-2 flex-wrap">
                            {hostels.map(h => (
                                <Link
                                    key={h.id}
                                    href={`/dashboard/owner/tickets?hostel=${h.id}&status=${selectedStatus}`}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedHostelId === h.id
                                        ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-300'
                                        }`}
                                >
                                    {h.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <span className="text-2xl font-bold text-amber-600">{openCount}</span>
                        </div>
                        <p className="text-xs text-amber-600/80 font-medium">Open</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="text-2xl font-bold text-blue-600">{inProgressCount}</span>
                        </div>
                        <p className="text-xs text-blue-600/80 font-medium">In Progress</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-2xl font-bold text-green-600">{resolvedCount}</span>
                        </div>
                        <p className="text-xs text-green-600/80 font-medium">Resolved</p>
                    </div>
                </div>

                {/* Status Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {statusFilters.map(f => (
                        <Link
                            key={f.key}
                            href={`/dashboard/owner/tickets?hostel=${selectedHostelId}&status=${f.key}`}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedStatus === f.key
                                ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-violet-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            {f.label} ({f.count})
                        </Link>
                    ))}
                </div>

                {/* Tickets Grid */}
                {tickets.length === 0 ? (
                    <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                        <CardContent className="py-16 text-center">
                            <Ticket className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-muted-foreground">No tickets found.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {tickets.map((ticket) => (
                            <OwnerTicketCard key={ticket.id} ticket={ticket} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
