'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Pencil, Trash2, Loader2, Users, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { HostelWithImages } from '@/lib/types';

interface OwnerHostelCardProps {
    hostel: HostelWithImages;
}

export function OwnerHostelCard({ hostel }: OwnerHostelCardProps) {
    const [deleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();
    const firstImage = hostel.hostel_images?.[0]?.image_url;
    const hasVacancy = hostel.vacant_beds > 0;
    const occupancyRate = Math.round(((hostel.total_beds - hostel.vacant_beds) / hostel.total_beds) * 100);

    const handleDelete = async () => {
        setDeleting(true);
        const supabase = createClient();

        const { error } = await supabase
            .from('hostels')
            .delete()
            .eq('id', hostel.id);

        if (error) {
            console.error('Error deleting hostel:', error);
            alert('Failed to delete hostel. Please try again.');
            setDeleting(false);
            setShowConfirm(false);
            return;
        }

        router.refresh();
    };

    return (
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl bg-white dark:bg-slate-900 transition-all duration-300">
            {/* Image */}
            <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                {firstImage ? (
                    <Image
                        src={firstImage}
                        alt={hostel.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Bed className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                    </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${hasVacancy
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                        }`}>
                        {hasVacancy ? `${hostel.vacant_beds} vacant` : 'Full'}
                    </span>
                </div>

                {/* Occupancy Bar */}
                <div className="absolute bottom-0 left-0 right-0">
                    <div className="h-1 bg-black/20">
                        <div
                            className={`h-full transition-all ${occupancyRate > 80 ? 'bg-emerald-400' : occupancyRate > 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${occupancyRate}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <CardContent className="p-5">
                {/* Name */}
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1">
                    {hostel.name}
                </h3>

                {/* Area */}
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{hostel.area}</span>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">₹{hostel.price.toLocaleString('en-IN')}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">/mo</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-900 dark:text-white">{hostel.total_beds - hostel.vacant_beds}</span>/{hostel.total_beds}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                {showConfirm ? (
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Confirm
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirm(false)}
                            disabled={deleting}
                        >
                            <XCircle className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Link href={`/dashboard/edit-hostel/${hostel.id}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                                <Pencil className="w-4 h-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:border-red-900 dark:hover:bg-red-950"
                            onClick={() => setShowConfirm(true)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
