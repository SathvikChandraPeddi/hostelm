import { getStudentTickets } from '@/lib/ticket-actions';
import { requireStudentWithProfile } from '@/lib/auth-guard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Ticket, CheckCircle2, Clock, AlertCircle, MessageSquare, Plus } from 'lucide-react';
import { CreateTicketForm } from '@/components/CreateTicketForm';

export const metadata = {
    title: 'My Tickets | HostelM Student',
};

const statusConfig = {
    open: { label: 'Open', color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertCircle },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
};

export default async function StudentTicketsPage() {
    // SECURITY: Require student role with active profile
    const { profileId, hostelId } = await requireStudentWithProfile('/student/tickets');

    // Backend already verifies ownership
    const tickets = await getStudentTickets(profileId);

    const openCount = tickets.filter(t => t.status === 'open').length;
    const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/student/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Tickets</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Raise issues and track their status</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-amber-600">{openCount}</p>
                        <p className="text-xs text-amber-600/80 font-medium">Open</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
                        <p className="text-xs text-blue-600/80 font-medium">In Progress</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
                        <p className="text-xs text-green-600/80 font-medium">Resolved</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Create Ticket Form */}
                    <div className="lg:col-span-2">
                        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 sticky top-8">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-violet-500" /> Raise a Ticket
                                </CardTitle>
                                <CardDescription>Describe your issue for the hostel owner</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CreateTicketForm studentProfileId={profileId} hostelId={hostelId} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tickets List */}
                    <div className="lg:col-span-3 space-y-4">
                        {tickets.length === 0 ? (
                            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                                <CardContent className="py-16 text-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Ticket className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-muted-foreground">No tickets yet.</p>
                                    <p className="text-sm text-slate-400 mt-1">Use the form to raise your first issue.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            tickets.map((ticket) => {
                                const cfg = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
                                const StatusIcon = cfg.icon;
                                return (
                                    <Card key={ticket.id} className={`border-0 shadow-md bg-white dark:bg-slate-900 overflow-hidden ${ticket.status === 'open' ? 'ring-1 ring-amber-200 dark:ring-amber-800' : ''}`}>
                                        <div className={`h-1 ${ticket.status === 'open' ? 'bg-amber-400' : ticket.status === 'in_progress' ? 'bg-blue-400' : 'bg-green-400'}`} />
                                        <CardContent className="pt-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-slate-900 dark:text-white">{ticket.title}</h3>
                                                <Badge variant="outline" className={cfg.color}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {cfg.label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{ticket.description}</p>

                                            {ticket.owner_reply && (
                                                <div className="bg-violet-50 dark:bg-violet-900/20 p-3 rounded-lg text-sm border border-violet-100 dark:border-violet-800 mb-3">
                                                    <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1 flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3" /> Owner&apos;s Reply
                                                    </p>
                                                    <p className="text-slate-700 dark:text-slate-300">{ticket.owner_reply}</p>
                                                </div>
                                            )}

                                            <p className="text-xs text-slate-400">
                                                Created {new Date(ticket.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                {ticket.resolved_at && (
                                                    <> · Resolved {new Date(ticket.resolved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                                                )}
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
