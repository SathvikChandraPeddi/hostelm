import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Bed, Users, Sparkles, ArrowUpRight } from 'lucide-react';
import type { HostelWithImages } from '@/lib/types';

interface HostelCardProps {
    hostel: HostelWithImages;
}

export function HostelCard({ hostel }: HostelCardProps) {
    const firstImage = hostel.hostel_images?.[0]?.image_url;
    const hasVacancy = hostel.vacant_beds > 0;
    const occupancyRate = Math.round(((hostel.total_beds - hostel.vacant_beds) / hostel.total_beds) * 100);

    return (
        <Link href={`/hostel/${hostel.id}`}>
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white dark:bg-slate-900/80 hover:-translate-y-2 backdrop-blur-sm">
                {/* Hover glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500" />
                
                {/* Card content wrapper */}
                <div className="relative">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700">
                        {firstImage ? (
                            <Image
                                src={firstImage}
                                alt={hostel.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl" />
                                    <Bed className="relative w-16 h-16 text-violet-300 dark:text-violet-600" />
                                </div>
                            </div>
                        )}

                        {/* Premium overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                        {/* Vacancy Badge - Glassmorphism style */}
                        <div className="absolute top-3 right-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md border ${hasVacancy
                                ? 'bg-emerald-500/80 border-emerald-400/30 text-white'
                                : 'bg-red-500/80 border-red-400/30 text-white'
                                }`}>
                                {hasVacancy && <Sparkles className="w-3 h-3" />}
                                {hasVacancy ? `${hostel.vacant_beds} beds` : 'Full'}
                            </span>
                        </div>
                        
                        {/* Price badge - shown on hover */}
                        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg text-slate-900 dark:text-white">
                                ₹{hostel.price.toLocaleString('en-IN')}
                                <span className="text-xs font-normal text-slate-500 ml-1">/mo</span>
                            </span>
                        </div>
                        
                        {/* Arrow indicator on hover */}
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg">
                                <ArrowUpRight className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                            </span>
                        </div>

                        {/* Occupancy indicator - more visual */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
                            <div
                                className={`h-full transition-all duration-700 ease-out ${occupancyRate > 80 ? 'bg-gradient-to-r from-red-400 to-red-500' : occupancyRate > 50 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
                                style={{ width: `${occupancyRate}%` }}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-5">
                        {/* Name with subtle animation */}
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300 line-clamp-1">
                            {hostel.name}
                        </h3>

                        {/* Area with icon */}
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm mb-4">
                            <MapPin className="w-4 h-4 text-violet-400 dark:text-violet-500" />
                            <span className="line-clamp-1">{hostel.area}</span>
                        </div>

                        {/* Stats Row - Enhanced */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                            {/* Price - shown on mobile, hidden on hover for desktop */}
                            <div className="group-hover:opacity-50 transition-opacity duration-300 md:group-hover:opacity-100">
                                <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    ₹{hostel.price.toLocaleString('en-IN')}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 text-sm">
                                    /mo
                                </span>
                            </div>

                            {/* Beds info with better styling */}
                            <div className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                                <Users className="w-4 h-4" />
                                <span className="font-medium">{hostel.total_beds} beds</span>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </Link>
    );
}
