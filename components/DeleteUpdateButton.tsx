'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteUpdate } from '@/lib/update-actions';
import { useRouter } from 'next/navigation';

interface DeleteUpdateButtonProps {
    updateId: string;
}

export function DeleteUpdateButton({ updateId }: DeleteUpdateButtonProps) {
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setLoading(true);
        try {
            const result = await deleteUpdate(updateId);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || 'Failed to delete');
            }
        } catch {
            alert('Something went wrong');
        } finally {
            setLoading(false);
            setConfirming(false);
        }
    };

    if (confirming) {
        return (
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={loading}
                    className="text-xs"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirming(false)}
                    disabled={loading}
                    className="text-xs"
                >
                    Cancel
                </Button>
            </div>
        );
    }

    return (
        <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirming(true)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
        >
            <Trash2 className="w-3 h-3 mr-1" /> Delete
        </Button>
    );
}
