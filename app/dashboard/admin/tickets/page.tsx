import { getAllTickets } from '@/lib/ticket-actions';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Ticket, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { AdminTicketCard } from '@/components/AdminTicketCard';
import { requireAdmin } from '@/lib/auth-guard';

export const metadata = {
    title: 'All Tickets | HostelM Admin',
};

export default async function AdminTicketsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string; hostel?: string }>;
}) {
    // SECURITY: Require admin role from database
    await requireAdmin('/dashboard/admin/tickets');

    const supabase = await createClient();
    const resolvedParams = await searchParams;
    const selectedStatus = resolvedParams.status || 'all';
    const selectedHostel = resolvedParams.hostel || 'all';

    const tickets = await getAllTickets(selectedStatus, selectedHostel);

    // Get unique hostels from tickets for filter
    const hostelMap = new Map<string, string>();
    tickets.forEach((t: { hostel_id: string; hostels: { name: string } }) => {
        if (!hostelMap.has(t.hostel_id)) {
            hostelMap.set(t.hostel_id, t.hostels.name);
        }
    });

    // Also fetch all hostels for filter when "all" status shows 0 tickets from some hostels
    const { data: allHostels } = await supabase
        .from('hostels')
        .select('id, name')
        .eq('is_approved', true)
        .order('name');

    const openCount = tickets.filter((t: { status: string }) => t.status === 'open').length;
    const inProgressCount = tickets.filter((t: { status: string }) => t.status === 'in_progress').length;
    const resolvedCount = tickets.filter((t: { status: string }) => t.status === 'resolved').length;

    const statusFilters = [
        { key: 'all', label: 'All', count: tickets.length },
        { key: 'open', label: 'Open', count: openCount },
        { key: 'in_progress', label: 'In Progress', count: inProgressCount },
        { key: 'resolved', label: 'Resolved', count: resolvedCount },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/dashboard/admin">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">All Tickets</h1>
                        <p className="text-slate-500 dark:text-slate-400">Monitor issues across all hostels</p>
                    </div>
                </div>

                {/* Stats */}
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

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {/* Status Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
                        {statusFilters.map(f => (
                            <Link
                                key={f.key}
                                href={`/dashboard/admin/tickets?status=${f.key}&hostel=${selectedHostel}`}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedStatus === f.key
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50'
                                    }`}
                            >
                                {f.label} ({f.count})
                            </Link>
                        ))}
                    </div>

                    {/* Hostel Filter */}
                    <div className="flex-shrink-0">
                        <select
                            value={selectedHostel}
                            onChange={(e) => {
                                // Client-side navigation workaround — will fallback to link
                            }}
                            className="hidden"
                        />
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            <Link
                                href={`/dashboard/admin/tickets?status=${selectedStatus}&hostel=all`}
                                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${selectedHostel === 'all'
                                    ? 'bg-slate-800 text-white border-slate-800'
                                    : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                All Hostels
                            </Link>
                            {(allHostels || []).map((h) => (
                                <Link
                                    key={h.id}
                                    href={`/dashboard/admin/tickets?status=${selectedStatus}&hostel=${h.id}`}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${selectedHostel === h.id
                                        ? 'bg-slate-800 text-white border-slate-800'
                                        : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                                        }`}
                                >
                                    {h.name}
                                </Link>
                            ))}
                        </div>
                    </div>
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
                            <AdminTicketCard key={ticket.id} ticket={ticket} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
