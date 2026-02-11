'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { verifyHostelCode, joinHostelAction } from '@/lib/actions';
import { Building2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import type { HostelWithImages } from '@/lib/types';
import Link from 'next/link';

export default function JoinHostelPage() {
    const router = useRouter();
    const [step, setStep] = useState<'code' | 'details'>('code');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hostelCode, setHostelCode] = useState('');
    const [selectedHostel, setSelectedHostel] = useState<HostelWithImages | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        phone_number: '',
        parent_phone: '',
        college_or_workplace: '',
        floor_number: '',
        room_number: '',
    });

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const hostel = await verifyHostelCode(hostelCode.trim().toUpperCase());

            if (!hostel) {
                setError('Invalid hostel code. Please check and try again.');
                return;
            }

            setSelectedHostel(hostel);
            setStep('details');
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHostel) return;

        setError(null);
        setLoading(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            const result = await joinHostelAction({
                user_id: user.id,
                hostel_id: selectedHostel.id,
                name: formData.name,
                phone_number: formData.phone_number,
                parent_phone: formData.parent_phone,
                college_or_workplace: formData.college_or_workplace,
                floor_number: formData.floor_number,
                room_number: formData.room_number,
            });

            if (!result.success) {
                setError(result.error || 'Failed to join hostel');
                return;
            }

            // Success!
            router.push('/student/dashboard');
            router.refresh();
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Join Your Hostel
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Enter your hostel's unique code to get started
                    </p>
                </div>

                <Card className="border-0 shadow-xl bg-white dark:bg-slate-900">
                    <CardContent className="p-6 md:p-8">
                        {step === 'code' ? (
                            <form onSubmit={handleCodeSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Hostel Code</Label>
                                    <Input
                                        id="code"
                                        placeholder="Enter 6-digit code (e.g., A1B2C3)"
                                        value={hostelCode}
                                        onChange={(e) => setHostelCode(e.target.value.toUpperCase())}
                                        className="text-center text-2xl tracking-widest uppercase py-6"
                                        maxLength={6}
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-violet-600 hover:bg-violet-700 h-12 text-lg"
                                    disabled={loading || hostelCode.length < 6}
                                >
                                    {loading ? 'Verifying...' : 'Verify Hostel'}
                                </Button>

                                <div className="text-center text-sm text-slate-500">
                                    Don't have a code? Ask your hostel owner.
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleJoinSubmit} className="space-y-6">
                                {/* Selected Hostel Info */}
                                <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-xl flex items-center gap-4 mb-6 border border-violet-100 dark:border-violet-800">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                                        {selectedHostel?.logo_url ? (
                                            <img src={selectedHostel.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
                                        ) : (
                                            <Building2 className="w-6 h-6 text-violet-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {selectedHostel?.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {selectedHostel?.area}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-auto text-xs"
                                        onClick={() => setStep('code')}
                                        type="button"
                                    >
                                        Change
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="Your full name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                name="phone_number"
                                                placeholder="Mobile number"
                                                value={formData.phone_number}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="floor">Floor No.</Label>
                                            <Input
                                                id="floor"
                                                name="floor_number"
                                                placeholder="e.g. 2nd"
                                                value={formData.floor_number}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="room">Room No.</Label>
                                            <Input
                                                id="room"
                                                name="room_number"
                                                placeholder="e.g. 204"
                                                value={formData.room_number}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="college">College / Work</Label>
                                            <Input
                                                id="college"
                                                name="college_or_workplace"
                                                placeholder="Institution name"
                                                value={formData.college_or_workplace}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-violet-600 hover:bg-violet-700 h-12"
                                    disabled={loading}
                                >
                                    {loading ? 'Joining Hostel...' : 'Confirm & Join'}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
