'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MessageSquare, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { updateTicketOwner } from '@/lib/ticket-actions';
import { useRouter } from 'next/navigation';

interface OwnerTicketCardProps {
    ticket: {
        id: string;
        title: string;
        description: string;
        status: string;
        owner_reply: string | null;
        created_at: string;
        updated_at: string;
        student_profiles: {
            name: string;
            room_number: string | null;
            phone_number: string;
        };
    };
}

const statusConfig = {
    open: { label: 'Open', color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertCircle },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
};

export function OwnerTicketCard({ ticket }: OwnerTicketCardProps) {
    const [reply, setReply] = useState(ticket.owner_reply || '');
    const [status, setStatus] = useState(ticket.status);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const router = useRouter();

    const config = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
    const StatusIcon = config.icon;

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const result = await updateTicketOwner(
                ticket.id,
                status as 'open' | 'in_progress' | 'resolved',
                reply
            );
            if (result.success) {
                router.refresh();
                setExpanded(false);
            } else {
                alert(result.error || 'Failed to update');
            }
        } catch {
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={`border-0 shadow-md bg-white dark:bg-slate-900 overflow-hidden transition-all ${ticket.status === 'open' ? 'ring-1 ring-amber-200 dark:ring-amber-800' : ''}`}>
            <div className={`h-1 ${ticket.status === 'open' ? 'bg-amber-400' : ticket.status === 'in_progress' ? 'bg-blue-400' : 'bg-green-400'}`} />
            <CardContent className="pt-5">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">{ticket.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            <span className="font-medium">{ticket.student_profiles.name}</span> · Room {ticket.student_profiles.room_number || 'N/A'} · {ticket.student_profiles.phone_number}
                        </p>
                    </div>
                    <Badge variant="outline" className={config.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                    </Badge>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{ticket.description}</p>

                {ticket.owner_reply && !expanded && (
                    <div className="bg-violet-50 dark:bg-violet-900/20 p-3 rounded-lg text-sm mb-3 border border-violet-100 dark:border-violet-800">
                        <p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> Your Reply
                        </p>
                        <p className="text-slate-700 dark:text-slate-300">{ticket.owner_reply}</p>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">
                        {new Date(ticket.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="text-violet-600 hover:text-violet-700 text-xs"
                    >
                        {expanded ? 'Close' : 'Reply / Update'}
                    </Button>
                </div>

                {expanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in slide-in-from-top-2">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                            >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Reply to Student</label>
                            <textarea
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="Type your reply..."
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none"
                            />
                        </div>
                        <Button
                            onClick={handleUpdate}
                            disabled={loading}
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700 text-white w-full"
                        >
                            {loading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving...</> : 'Save Changes'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
