import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getHostelById } from '@/lib/supabase/hostels';
import { ImageGallery } from '@/components/ImageGallery';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    MapPin,
    Bed,
    Phone,
    MessageCircle,
    IndianRupee,
    Building2
} from 'lucide-react';

interface HostelDetailPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: HostelDetailPageProps) {
    const { id } = await params;
    const hostel = await getHostelById(id);

    if (!hostel) {
        return { title: 'Hostel Not Found | HostelM' };
    }

    return {
        title: `${hostel.name} | HostelM`,
        description: hostel.description || `View details and contact ${hostel.name}`,
    };
}

export default async function HostelDetailPage({ params }: HostelDetailPageProps) {
    const { id } = await params;
    const hostel = await getHostelById(id);

    if (!hostel) {
        notFound();
    }

    const hasVacancy = hostel.vacant_beds > 0;
    const whatsappUrl = `https://wa.me/${hostel.owner_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in ${hostel.name}. Is there availability?`)}`;
    const callUrl = `tel:${hostel.owner_phone}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Back Button */}
                <Link
                    href="/hostels"
                    className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to listings
                </Link>

                {/* Image Gallery */}
                <div className="mb-8">
                    <ImageGallery images={hostel.hostel_images} hostelName={hostel.name} />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {hostel.name}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${hasVacancy
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {hasVacancy ? `${hostel.vacant_beds} beds available` : 'No vacancy'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <MapPin className="w-4 h-4" />
                                <span>{hostel.address}</span>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-900/80">
                                <CardContent className="p-4 text-center">
                                    <IndianRupee className="w-5 h-5 mx-auto text-violet-500 mb-1" />
                                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                                        ₹{hostel.price.toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-slate-500">per month</div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-900/80">
                                <CardContent className="p-4 text-center">
                                    <Bed className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
                                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                                        {hostel.total_beds}
                                    </div>
                                    <div className="text-xs text-slate-500">total beds</div>
                                </CardContent>
                            </Card>
                            <Card className="border-0 shadow-md bg-white/80 dark:bg-slate-900/80">
                                <CardContent className="p-4 text-center">
                                    <Building2 className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
                                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                                        {hostel.area}
                                    </div>
                                    <div className="text-xs text-slate-500">location</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Description */}
                        {hostel.description && (
                            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                        About this hostel
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                                        {hostel.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Contact Card */}
                    <div className="lg:col-span-1">
                        <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 sticky top-24">
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                    Contact Owner
                                </h2>

                                <div className="space-y-3">
                                    <a href={callUrl}>
                                        <Button
                                            className="w-full h-12 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
                                        >
                                            <Phone className="w-5 h-5 mr-2" />
                                            Call Now
                                        </Button>
                                    </a>

                                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                        <Button
                                            variant="outline"
                                            className="w-full h-12 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                        >
                                            <MessageCircle className="w-5 h-5 mr-2" />
                                            WhatsApp
                                        </Button>
                                    </a>
                                </div>

                                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                                    Mention you found them on HostelM
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
