import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getOwnerHostels } from '@/lib/supabase/hostels';
import { getHostelStudents } from '@/lib/supabase/students';
import { getHostelPayments } from '@/lib/payment-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, ArrowLeft, IndianRupee, Users, TrendingUp } from 'lucide-react';
import { MarkPaidButton } from '@/components/MarkPaidButton';
import { GenerateDuesButton } from '@/components/GenerateDuesButton';

export const metadata = {
    title: 'Payments Overview | HostelM Owner',
};

function formatMonth(monthStr: string) {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default async function OwnerPaymentsPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string; hostel?: string }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Verify owner role
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'owner') redirect('/dashboard');

    const hostels = await getOwnerHostels(user.id);
    if (hostels.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                <div className="container mx-auto px-4 py-16 text-center">
                    <p className="text-slate-500">You need to add a hostel first.</p>
                    <Link href="/dashboard/add-hostel">
                        <Button className="mt-4">Add Hostel</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const resolvedParams = await searchParams;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const selectedMonth = resolvedParams.month || currentMonth;
    const selectedHostelId = resolvedParams.hostel || hostels[0].id;
    const selectedHostelName = hostels.find(h => h.id === selectedHostelId)?.name || 'Hostel';

    // Get all students
    const students = await getHostelStudents(selectedHostelId);

    // Get payments for this month
    const payments = await getHostelPayments(selectedHostelId, selectedMonth);

    // Merge data with student info
    const duesList = students.map(student => {
        const payment = payments.find(p => p.student_profile_id === student.id);
        return {
            ...student,
            isPaid: payment?.status === 'paid',
            paymentId: payment?.id || null,
            paymentDetails: payment,
            amount: student.monthly_rent || 5000
        };
    });

    const paidCount = duesList.filter(d => d.isPaid).length;
    const dueCount = duesList.filter(d => !d.isPaid && d.paymentId).length;
    const noRecordCount = duesList.filter(d => !d.paymentId).length;
    const totalCollection = duesList.reduce((acc, curr) => acc + (curr.isPaid ? curr.paymentDetails?.amount || 0 : 0), 0);
    const totalPending = duesList.reduce((acc, curr) => acc + (!curr.isPaid ? curr.amount : 0), 0);

    // Month navigation
    const prevMonth = new Date(new Date(selectedMonth + '-01').setMonth(new Date(selectedMonth + '-01').getMonth() - 1)).toISOString().slice(0, 7);
    const nextMonth = new Date(new Date(selectedMonth + '-01').setMonth(new Date(selectedMonth + '-01').getMonth() + 1)).toISOString().slice(0, 7);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/owner">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dues & Payments</h1>
                            <p className="text-slate-500 dark:text-slate-400">{selectedHostelName} · {formatMonth(selectedMonth)}</p>
                        </div>
                    </div>

                    {/* Hostel Selector */}
                    {hostels.length > 1 && (
                        <div className="flex gap-2 flex-wrap">
                            {hostels.map(h => (
                                <Link
                                    key={h.id}
                                    href={`/dashboard/owner/payments?hostel=${h.id}&month=${selectedMonth}`}
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

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <IndianRupee className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase">Collected</p>
                                    <p className="text-2xl font-bold text-emerald-600">₹{totalCollection.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase">Pending</p>
                                    <p className="text-2xl font-bold text-red-600">₹{totalPending.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase">Paid</p>
                                    <p className="text-2xl font-bold">{paidCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                    <Users className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase">Total</p>
                                    <p className="text-2xl font-bold">{students.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Generate Dues + Month Nav */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <GenerateDuesButton hostelId={selectedHostelId} month={selectedMonth} />

                    <div className="flex gap-2">
                        <Link href={`/dashboard/owner/payments?month=${prevMonth}&hostel=${selectedHostelId}`}>
                            <Button variant="outline" size="sm">← Prev</Button>
                        </Link>
                        <Link href={`/dashboard/owner/payments?month=${currentMonth}&hostel=${selectedHostelId}`}>
                            <Button variant="outline" size="sm">Current</Button>
                        </Link>
                        <Link href={`/dashboard/owner/payments?month=${nextMonth}&hostel=${selectedHostelId}`}>
                            <Button variant="outline" size="sm">Next →</Button>
                        </Link>
                    </div>
                </div>

                {/* Student List Table */}
                <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle className="text-lg">Student Dues — {formatMonth(selectedMonth)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {duesList.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>No students found in this hostel.</p>
                            </div>
                        ) : (
                            <div className="relative overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">Room</th>
                                            <th className="px-4 py-3">Student Name</th>
                                            <th className="px-4 py-3">Phone</th>
                                            <th className="px-4 py-3">Amount</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {duesList.map((item) => (
                                            <tr
                                                key={item.id}
                                                className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${!item.isPaid
                                                    ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100/70 dark:hover:bg-red-900/20'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                    }`}
                                            >
                                                <td className="px-4 py-3 font-mono text-sm">{item.room_number || 'N/A'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`font-medium ${!item.isPaid ? 'text-red-700 dark:text-red-400' : ''}`}>
                                                        {item.name}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{item.phone_number}</td>
                                                <td className="px-4 py-3 font-semibold">₹{item.amount.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3">
                                                    {item.isPaid ? (
                                                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200" variant="outline">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                                                        </Badge>
                                                    ) : item.paymentId ? (
                                                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200" variant="outline">
                                                            <AlertCircle className="w-3 h-3 mr-1" /> Due
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-slate-500 border-slate-300">
                                                            No Record
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {item.paymentId && !item.isPaid ? (
                                                        <MarkPaidButton paymentId={item.paymentId} studentName={item.name} />
                                                    ) : item.isPaid ? (
                                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Confirmed
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Generate dues first</span>
                                                    )}
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
