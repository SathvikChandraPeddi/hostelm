import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getHostelStudents } from '@/lib/supabase/students';
import { getHostelById } from '@/lib/supabase/hostels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Phone, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { requireHostelOwner } from '@/lib/auth-guard';

export default async function HostelStudentsPage({ params }: { params: { hostelId: string } }) {
    const { hostelId } = await params;
    
    // SECURITY: Require owner role and verify hostel ownership
    await requireHostelOwner(hostelId, `/dashboard/owner/students/${hostelId}`);

    // Fetch hostel data (already verified ownership)
    const hostel = await getHostelById(hostelId);
    
    if (!hostel) {
        redirect('/dashboard/owner');
    }

    const students = await getHostelStudents(hostelId);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard/owner" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Hostels
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                {hostel.name} <span className="text-slate-400 font-light">|</span> Students
                            </h1>
                            <div className="flex items-center gap-4 mt-2 text-slate-600 dark:text-slate-400">
                                <span className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1 rounded-full text-sm border shadow-sm">
                                    <User className="w-4 h-4 text-violet-500" />
                                    {students.length} Students Joined
                                </span>
                                <span className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1 rounded-full text-sm border shadow-sm">
                                    <Building2 className="w-4 h-4 text-violet-500" />
                                    Code: <code className="font-mono font-semibold text-violet-700 dark:text-violet-400">{hostel.hostel_code || 'N/A'}</code>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                        <CardTitle>Registered Students</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {students.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                    <User className="w-6 h-6 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No students yet</h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Share your hostel code <span className="font-mono font-bold">{hostel.hostel_code}</span> with students to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Name</th>
                                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Room</th>
                                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Phone</th>
                                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Parent</th>
                                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {students.map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                    {student.name}
                                                    <div className="text-xs text-slate-500 font-normal mt-0.5">{student.college_or_workplace}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {student.room_number ? (
                                                        <Badge variant="secondary" className="font-mono">
                                                            {student.floor_number ? `${student.floor_number} - ` : ''}{student.room_number}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3 h-3 text-slate-400" />
                                                        {student.phone_number}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {student.parent_phone ? (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                            {student.parent_phone}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    {new Date(student.joined_at).toLocaleDateString()}
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
