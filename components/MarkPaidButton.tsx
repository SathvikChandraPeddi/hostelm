'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { markPaymentAsPaid } from '@/lib/payment-actions';
import { useRouter } from 'next/navigation';

interface MarkPaidButtonProps {
    paymentId: string;
    studentName: string;
}

export function MarkPaidButton({ paymentId, studentName }: MarkPaidButtonProps) {
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const router = useRouter();

    const handleMarkPaid = async () => {
        if (!confirmed) {
            setConfirmed(true);
            return;
        }

        setLoading(true);
        try {
            const result = await markPaymentAsPaid(paymentId, `Cash payment confirmed for ${studentName}`);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || 'Failed to mark as paid');
            }
        } catch {
            alert('Something went wrong');
        } finally {
            setLoading(false);
            setConfirmed(false);
        }
    };

    if (loading) {
        return (
            <Button size="sm" disabled className="min-w-[120px]">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Saving...
            </Button>
        );
    }

    if (confirmed) {
        return (
            <div className="flex gap-1">
                <Button
                    size="sm"
                    onClick={handleMarkPaid}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs"
                >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Confirm
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmed(false)}
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
            variant="outline"
            onClick={handleMarkPaid}
            className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 min-w-[120px]"
        >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Mark Paid
        </Button>
    );
}
