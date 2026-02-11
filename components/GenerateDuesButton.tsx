'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { generateMonthlyDues } from '@/lib/payment-actions';
import { useRouter } from 'next/navigation';

interface GenerateDuesButtonProps {
    hostelId: string;
    month: string;
}

export function GenerateDuesButton({ hostelId, month }: GenerateDuesButtonProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const router = useRouter();

    const handleGenerate = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await generateMonthlyDues(hostelId, month);
            if (res.success) {
                setResult(res.message || 'Done');
                router.refresh();
            } else {
                setResult(res.error || 'Failed');
            }
        } catch {
            setResult('Something went wrong');
        } finally {
            setLoading(false);
            // Clear result message after 3 seconds
            setTimeout(() => setResult(null), 3000);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <Button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Generate Dues for {month}
                    </>
                )}
            </Button>
            {result && (
                <span className="text-sm text-emerald-600 flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    {result}
                </span>
            )}
        </div>
    );
}
