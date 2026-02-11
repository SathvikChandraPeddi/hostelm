import { getAdminPaymentOverview } from '@/lib/payment-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Building2, IndianRupee, AlertCircle, CheckCircle2 } from 'lucide-react';
import { requireAdmin } from '@/lib/auth-guard';

export const metadata = {
    title: 'Payment Overview | HostelM Admin',
};

function formatMonth(monthStr: string) {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default async function AdminPaymentsPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string }>;
}) {
    // SECURITY: Require admin role from database
    await requireAdmin('/dashboard/admin/payments');

    const resolvedParams = await searchParams;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const selectedMonth = resolvedParams.month || currentMonth;

    const overview = await getAdminPaymentOverview(selectedMonth);

    // Aggregates
    const totalCollected = overview.reduce((sum, h) => sum + h.totalCollected, 0);
    const totalDue = overview.reduce((sum, h) => sum + h.totalDue, 0);
    const totalPaid = overview.reduce((sum, h) => sum + h.paidCount, 0);
    const totalDueCount = overview.reduce((sum, h) => sum + h.dueCount, 0);

    // Month navigation
    const prevMonth = new Date(new Date(selectedMonth + '-01').setMonth(new Date(selectedMonth + '-01').getMonth() - 1)).toISOString().slice(0, 7);
    const nextMonth = new Date(new Date(selectedMonth + '-01').setMonth(new Date(selectedMonth + '-01').getMonth() + 1)).toISOString().slice(0, 7);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/admin">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payment Overview</h1>
                            <p className="text-slate-500 dark:text-slate-400">All hostels · {formatMonth(selectedMonth)}</p>
                        </div>
                    </div>

                    {/* Month Nav */}
                    <div className="flex gap-2">
                        <Link href={`/dashboard/admin/payments?month=${prevMonth}`}>
                            <Button variant="outline" size="sm">← Prev</Button>
                        </Link>
                        <Link href={`/dashboard/admin/payments?month=${currentMonth}`}>
                            <Button variant="outline" size="sm">Current</Button>
                        </Link>
                        <Link href={`/dashboard/admin/payments?month=${nextMonth}`}>
                            <Button variant="outline" size="sm">Next →</Button>
                        </Link>
                    </div>
                </div>

                {/* Aggregate Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                        <CardContent className="pt-6">
                            <p className="text-xs font-medium text-slate-500 uppercase mb-1">Total Collected</p>
                            <p className="text-2xl font-bold text-emerald-600">₹{totalCollected.toLocaleString('en-IN')}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                        <CardContent className="pt-6">
                            <p className="text-xs font-medium text-slate-500 uppercase mb-1">Total Pending</p>
                            <p className="text-2xl font-bold text-red-600">₹{totalDue.toLocaleString('en-IN')}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                        <CardContent className="pt-6">
                            <p className="text-xs font-medium text-slate-500 uppercase mb-1">Students Paid</p>
                            <p className="text-2xl font-bold text-green-600">{totalPaid}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md bg-white dark:bg-slate-900">
                        <CardContent className="pt-6">
                            <p className="text-xs font-medium text-slate-500 uppercase mb-1">Students Due</p>
                            <p className="text-2xl font-bold text-red-600">{totalDueCount}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Hostel-wise Table */}
                <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle className="text-lg">Hostel-wise Dues — {formatMonth(selectedMonth)}</CardTitle>
                        <CardDescription>Payment status across all hostels</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {overview.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p>No payment records found for this month.</p>
                                <p className="text-sm mt-1">Hostel owners need to generate dues first.</p>
                            </div>
                        ) : (
                            <div className="relative overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3">Hostel</th>
                                            <th className="px-4 py-3">Area</th>
                                            <th className="px-4 py-3">Owner</th>
                                            <th className="px-4 py-3">Students</th>
                                            <th className="px-4 py-3">Paid</th>
                                            <th className="px-4 py-3">Due</th>
                                            <th className="px-4 py-3">Collected</th>
                                            <th className="px-4 py-3">Pending</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {overview.map((hostel) => (
                                            <tr
                                                key={hostel.hostelId}
                                                className={`border-b border-slate-100 dark:border-slate-800 ${hostel.dueCount > 0 ? 'bg-red-50/40 dark:bg-red-900/10' : ''}`}
                                            >
                                                <td className="px-4 py-3 font-medium">{hostel.hostelName}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{hostel.area}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{hostel.ownerName}</td>
                                                <td className="px-4 py-3 font-semibold">{hostel.totalStudents}</td>
                                                <td className="px-4 py-3">
                                                    <Badge className="bg-green-100 text-green-700 border-green-200" variant="outline">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        {hostel.paidCount}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {hostel.dueCount > 0 ? (
                                                        <Badge className="bg-red-100 text-red-700 border-red-200" variant="outline">
                                                            <AlertCircle className="w-3 h-3 mr-1" />
                                                            {hostel.dueCount}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-slate-400">0</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-emerald-600">
                                                    ₹{hostel.totalCollected.toLocaleString('en-IN')}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-red-600">
                                                    {hostel.totalDue > 0 ? `₹${hostel.totalDue.toLocaleString('en-IN')}` : '-'}
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
