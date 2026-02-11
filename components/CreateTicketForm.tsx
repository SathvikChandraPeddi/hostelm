'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { createTicket } from '@/lib/ticket-actions';
import { useRouter } from 'next/navigation';

interface CreateTicketFormProps {
    studentProfileId: string;
    hostelId: string;
}

export function CreateTicketForm({ studentProfileId, hostelId }: CreateTicketFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!title.trim() || !description.trim()) {
            setError('Please fill in both title and description.');
            return;
        }

        setLoading(true);
        try {
            const result = await createTicket(studentProfileId, hostelId, title, description);
            if (result.success) {
                setSuccess(true);
                setTitle('');
                setDescription('');
                router.refresh();
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(result.error || 'Failed to create ticket');
            }
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="ticket-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Issue Title
                </label>
                <input
                    id="ticket-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Water heater not working"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    maxLength={100}
                    disabled={loading}
                />
            </div>
            <div>
                <label htmlFor="ticket-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Description
                </label>
                <textarea
                    id="ticket-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                    maxLength={500}
                    disabled={loading}
                />
                <p className="text-xs text-slate-400 mt-1">{description.length}/500</p>
            </div>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            {success && (
                <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    ✅ Ticket submitted successfully!
                </div>
            )}

            <Button
                type="submit"
                disabled={loading || !title.trim() || !description.trim()}
                className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
            >
                {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                    <><Send className="w-4 h-4 mr-2" /> Submit Ticket</>
                )}
            </Button>
        </form>
    );
}
