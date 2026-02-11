'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, Trash2, Building2, Search, MapPin, IndianRupee } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { HostelWithOwner } from '@/lib/supabase/admin';

interface HostelsTableProps {
    hostels: HostelWithOwner[];
}

export function HostelsTable({ hostels }: HostelsTableProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const filteredHostels = hostels.filter(hostel =>
        hostel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hostel.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hostel.owner_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleApproval = async (hostelId: string, currentlyApproved: boolean) => {
        setLoading(hostelId);

        const { error } = await supabase
            .from('hostels')
            .update({ is_approved: !currentlyApproved })
            .eq('id', hostelId);

        if (error) {
            alert('Failed to update hostel');
        }

        setLoading(null);
        router.refresh();
    };

    const handleDelete = async (hostelId: string) => {
        if (!confirm('Are you sure you want to delete this hostel?')) return;

        setLoading(hostelId);

        const { error } = await supabase
            .from('hostels')
            .delete()
            .eq('id', hostelId);

        if (error) {
            alert('Failed to delete hostel');
        }

        setLoading(null);
        router.refresh();
    };

    return (
        <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Hostels Management</CardTitle>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{hostels.length} total hostels</p>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search hostels..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full sm:w-64"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full table-modern">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                                <th className="text-left py-4 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hostel</th>
                                <th className="text-left py-4 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Owner</th>
                                <th className="text-left py-4 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                                <th className="text-left py-4 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Occupancy</th>
                                <th className="text-left py-4 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="text-right py-4 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredHostels.map((hostel) => {
                                const occupancyRate = Math.round(((hostel.total_beds - hostel.vacant_beds) / hostel.total_beds) * 100);
                                return (
                                    <tr key={hostel.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                                    <Building2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-slate-900 dark:text-white block">
                                                        {hostel.name}
                                                    </span>
                                                    <span className="text-sm text-slate-500 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {hostel.area}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div>
                                                <span className="text-slate-900 dark:text-white block font-medium">
                                                    {hostel.owner_name || 'Unknown'}
                                                </span>
                                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                                    {hostel.owner_email || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-1.5">
                                                <IndianRupee className="w-4 h-4 text-slate-400" />
                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    {hostel.price.toLocaleString('en-IN')}
                                                </span>
                                                <span className="text-slate-500 text-sm">/mo</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-600 dark:text-slate-400">
                                                        {hostel.total_beds - hostel.vacant_beds}/{hostel.total_beds} beds
                                                    </span>
                                                    <span className={`font-medium ${occupancyRate > 80 ? 'text-emerald-600' : occupancyRate > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                                        {occupancyRate}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all ${occupancyRate > 80 ? 'bg-emerald-500' : occupancyRate > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${occupancyRate}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <Badge variant={hostel.is_approved ? 'success' : 'warning'} className="text-xs">
                                                {hostel.is_approved ? 'Approved' : 'Pending'}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex items-center justify-end gap-2">
                                                {loading === hostel.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                                ) : (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleToggleApproval(hostel.id, hostel.is_approved)}
                                                            className={`h-8 w-8 p-0 ${hostel.is_approved 
                                                                ? 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-950' 
                                                                : 'border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900 dark:hover:bg-green-950'}`}
                                                            title={hostel.is_approved ? 'Revoke approval' : 'Approve hostel'}
                                                        >
                                                            {hostel.is_approved ? (
                                                                <XCircle className="w-4 h-4" />
                                                            ) : (
                                                                <CheckCircle className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDelete(hostel.id)}
                                                            className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                                                            title="Delete hostel"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredHostels.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                                <Building2 className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400">
                                {searchQuery ? 'No hostels match your search' : 'No hostels found'}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
