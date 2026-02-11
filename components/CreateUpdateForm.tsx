'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { createOwnerUpdate, createAdminUpdate } from '@/lib/update-actions';
import { useRouter } from 'next/navigation';

interface CreateUpdateFormProps {
    hostelId?: string;
    hostels?: { id: string; name: string }[];
    isAdmin?: boolean;
}

export function CreateUpdateForm({ hostelId, hostels, isAdmin }: CreateUpdateFormProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isGlobal, setIsGlobal] = useState(false);
    const [selectedHostel, setSelectedHostel] = useState(hostelId || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!title.trim() || !content.trim()) {
            setError('Title and content are required.');
            return;
        }

        setLoading(true);
        try {
            let result;
            if (isAdmin) {
                result = await createAdminUpdate(title, content, isGlobal, isGlobal ? undefined : selectedHostel);
            } else {
                result = await createOwnerUpdate(selectedHostel || hostelId!, title, content);
            }

            if (result.success) {
                setSuccess(true);
                setTitle('');
                setContent('');
                router.refresh();
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setError(result.error || 'Failed to post update');
            }
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Admin: Global toggle */}
            {isAdmin && (
                <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isGlobal}
                            onChange={(e) => setIsGlobal(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {isGlobal ? '🌍 Global Update' : '🏠 Hostel-Specific'}
                    </span>
                </div>
            )}

            {/* Hostel selector (admin non-global or owner with multiple hostels) */}
            {(isAdmin && !isGlobal && hostels && hostels.length > 0) && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Hostel</label>
                    <select
                        value={selectedHostel}
                        onChange={(e) => setSelectedHostel(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                        <option value="">Choose a hostel...</option>
                        {hostels.map(h => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Owner hostel selector */}
            {!isAdmin && hostels && hostels.length > 1 && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Select Hostel</label>
                    <select
                        value={selectedHostel}
                        onChange={(e) => setSelectedHostel(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                        {hostels.map(h => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Water maintenance scheduled"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    maxLength={120}
                    disabled={loading}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Content</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write the update details..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                    maxLength={1000}
                    disabled={loading}
                />
                <p className="text-xs text-slate-400 mt-1">{content.length}/1000</p>
            </div>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}
            {success && (
                <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    ✅ Update posted successfully!
                </div>
            )}

            <Button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
                {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...</>
                ) : (
                    <><Send className="w-4 h-4 mr-2" /> Post Update</>
                )}
            </Button>
        </form>
    );
}
