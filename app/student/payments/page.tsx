import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStudentPayments } from '@/lib/payment-actions';
import { requireStudentWithProfile } from '@/lib/auth-guard';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, ArrowLeft, IndianRupee, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'Payments | HostelM Student',
};

// Helper to get array of last 6 months
function getMonths() {
    const months = [];
    const date = new Date();
    for (let i = 0; i < 6; i++) {
        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
        months.push(d.toISOString().slice(0, 7)); // YYYY-MM
    }
    return months;
}

function formatMonth(monthStr: string) {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default async function StudentPaymentsPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string }>;
}) {
    // SECURITY: Require student role with active profile
    const { profileId } = await requireStudentWithProfile('/student/payments');

    // Fetch full profile data
    const supabase = await createClient();
    const { data: profile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

    // Get selected month or default to current
    const resolvedParams = await searchParams;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const selectedMonth = resolvedParams.month || currentMonth;

    // Fetch payments (backend already verifies ownership)
    const payments = await getStudentPayments(profileId);

    // Check if paid for selected month
    const paymentForMonth = payments.find(p => p.month === selectedMonth);
    const isPaidForMonth = paymentForMonth?.status === 'paid';

    // Get monthly rent from first payment or default
    const monthlyDues = paymentForMonth?.amount || 5000;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/student/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payments</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Track your monthly dues</p>
                        </div>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="flex gap-2 text-sm overflow-x-auto pb-4 mb-6 scrollbar-thin">
                    {getMonths().map(month => (
                        <Link
                            key={month}
                            href={`/student/payments?month=${month}`}
                            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${month === selectedMonth
                                ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            {formatMonth(month)}
                        </Link>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Current Month Status */}
                    <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                        <div className={`h-1.5 ${isPaidForMonth ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />
                        <CardHeader>
                            <CardTitle className="text-lg">Status for {formatMonth(selectedMonth)}</CardTitle>
                            <CardDescription>Monthly Rent</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-1 text-4xl font-bold mb-5 text-slate-900 dark:text-white">
                                <IndianRupee className="w-8 h-8" />
                                {monthlyDues.toLocaleString('en-IN')}
                            </div>

                            {isPaidForMonth ? (
                                <div className="flex items-center text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                    <CheckCircle2 className="w-6 h-6 mr-3 flex-shrink-0" />
                                    <div>
                                        <span className="font-semibold block">Paid</span>
                                        {paymentForMonth?.payment_date && (
                                            <span className="text-sm text-green-600 dark:text-green-500">
                                                on {new Date(paymentForMonth.payment_date).toLocaleDateString('en-IN')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 mb-4">
                                        <Clock className="w-6 h-6 mr-3 flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold block">Payment Due</span>
                                            <span className="text-sm text-amber-600 dark:text-amber-500">
                                                Contact your hostel owner
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>Pay your rent directly to the hostel owner. Once confirmed, the payment will be marked as paid here.</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle className="text-lg">Your Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-muted-foreground">Student Name</span>
                                <span className="font-medium">{profile.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-muted-foreground">Room Number</span>
                                <span className="font-medium">{profile.room_number || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-muted-foreground">Phone</span>
                                <span className="font-medium">{profile.phone_number}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Monthly Rent</span>
                                <span className="font-bold text-violet-600">₹{(profile.monthly_rent || 5000).toLocaleString('en-IN')}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payment History Table */}
                <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle className="text-lg">Payment History</CardTitle>
                        <CardDescription>Your complete payment record</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {payments.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <IndianRupee className="w-8 h-8 text-slate-400" />
                                </div>
                                <p className="text-muted-foreground">No payment records yet.</p>
                                <p className="text-sm text-slate-400 mt-1">Records will appear once your hostel owner generates monthly dues.</p>
                            </div>
                        ) : (
                            <div className="relative overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3">Month</th>
                                            <th className="px-4 py-3">Amount</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Paid On</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment) => (
                                            <tr key={payment.id} className={`border-b border-slate-100 dark:border-slate-800 ${payment.status === 'due' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                                <td className="px-4 py-3 font-medium">{formatMonth(payment.month)}</td>
                                                <td className="px-4 py-3">₹{payment.amount.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        className={payment.status === 'paid'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200'
                                                        }
                                                        variant="outline"
                                                    >
                                                        {payment.status === 'paid' ? (
                                                            <><CheckCircle2 className="w-3 h-3 mr-1" /> Paid</>
                                                        ) : (
                                                            <><Clock className="w-3 h-3 mr-1" /> Due</>
                                                        )}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {payment.payment_date
                                                        ? new Date(payment.payment_date).toLocaleDateString('en-IN')
                                                        : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
