import { Card, CardContent } from '@/components/ui/card';
import { Users, Building2, CheckCircle, Bed } from 'lucide-react';
import type { AdminStats } from '@/lib/supabase/admin';

interface AdminStatsCardsProps {
    stats: AdminStats;
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
    const cards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
        },
        {
            title: 'Total Hostels',
            value: stats.totalHostels,
            icon: Building2,
            color: 'from-violet-500 to-violet-600',
        },
        {
            title: 'Approved Hostels',
            value: stats.approvedHostels,
            icon: CheckCircle,
            color: 'from-emerald-500 to-emerald-600',
        },
        {
            title: 'Vacant Beds',
            value: stats.totalVacantBeds,
            icon: Bed,
            color: 'from-amber-500 to-amber-600',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <Card key={card.title} className="border-0 shadow-lg bg-white dark:bg-slate-900">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                    {card.title}
                                </p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {card.value.toLocaleString()}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                                <card.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
