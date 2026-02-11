'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ImageUpload';
import { Loader2, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { HostelWithImages } from '@/lib/types';

interface HostelFormProps {
    hostel?: HostelWithImages;
    userId: string;
    mode: 'create' | 'edit';
}

export function HostelForm({ hostel, userId, mode }: HostelFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState(hostel?.name || '');
    const [area, setArea] = useState(hostel?.area || '');
    const [address, setAddress] = useState(hostel?.address || '');
    const [price, setPrice] = useState(hostel?.price?.toString() || '');
    const [totalBeds, setTotalBeds] = useState(hostel?.total_beds?.toString() || '');
    const [vacantBeds, setVacantBeds] = useState(hostel?.vacant_beds?.toString() || '');
    const [description, setDescription] = useState(hostel?.description || '');
    const [phone, setPhone] = useState(hostel?.owner_phone || '');
    const [images, setImages] = useState<string[]>(
        hostel?.hostel_images?.map(img => img.image_url) || []
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validation
        if (!name || !area || !address || !price || !totalBeds || !vacantBeds || !phone) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        if (parseInt(vacantBeds) > parseInt(totalBeds)) {
            setError('Vacant beds cannot exceed total beds');
            setLoading(false);
            return;
        }

        const supabase = createClient();

        try {
            if (mode === 'create') {
                // Create new hostel
                const { data: newHostel, error: createError } = await supabase
                    .from('hostels')
                    .insert({
                        name,
                        area,
                        address,
                        price: parseFloat(price),
                        total_beds: parseInt(totalBeds),
                        vacant_beds: parseInt(vacantBeds),
                        description: description || null,
                        owner_phone: phone,
                        owner_id: userId,
                        is_approved: true,
                    })
                    .select('id')
                    .single();

                if (createError) throw createError;

                // Add images
                if (images.length > 0 && newHostel) {
                    const imageInserts = images.map((url, index) => ({
                        hostel_id: newHostel.id,
                        image_url: url,
                        display_order: index,
                    }));

                    const { error: imageError } = await supabase
                        .from('hostel_images')
                        .insert(imageInserts);

                    if (imageError) console.error('Error adding images:', imageError);
                }
            } else if (hostel) {
                // Update existing hostel
                const { error: updateError } = await supabase
                    .from('hostels')
                    .update({
                        name,
                        area,
                        address,
                        price: parseFloat(price),
                        total_beds: parseInt(totalBeds),
                        vacant_beds: parseInt(vacantBeds),
                        description: description || null,
                        owner_phone: phone,
                    })
                    .eq('id', hostel.id);

                if (updateError) throw updateError;

                // Delete existing images and re-add
                await supabase
                    .from('hostel_images')
                    .delete()
                    .eq('hostel_id', hostel.id);

                if (images.length > 0) {
                    const imageInserts = images.map((url, index) => ({
                        hostel_id: hostel.id,
                        image_url: url,
                        display_order: index,
                    }));

                    const { error: imageError } = await supabase
                        .from('hostel_images')
                        .insert(imageInserts);

                    if (imageError) console.error('Error adding images:', imageError);
                }
            }

            router.push('/dashboard/owner');
            router.refresh();
        } catch (err: any) {
            console.error('Error saving hostel:', err);
            setError(err.message || 'Failed to save hostel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Basic Info */}
                <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Hostel Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Sunrise Student Hostel"
                                className="h-11"
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="area">Area/Locality *</Label>
                                <Input
                                    id="area"
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                    placeholder="e.g., Koramangala"
                                    className="h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Contact Phone *</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    className="h-11"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Full Address *</Label>
                            <Textarea
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Full address including city and pincode"
                                rows={2}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing & Capacity */}
                <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle>Pricing & Capacity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Monthly Price (₹) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="8500"
                                    className="h-11"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="totalBeds">Total Beds *</Label>
                                <Input
                                    id="totalBeds"
                                    type="number"
                                    value={totalBeds}
                                    onChange={(e) => setTotalBeds(e.target.value)}
                                    placeholder="50"
                                    className="h-11"
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vacantBeds">Vacant Beds *</Label>
                                <Input
                                    id="vacantBeds"
                                    type="number"
                                    value={vacantBeds}
                                    onChange={(e) => setVacantBeds(e.target.value)}
                                    placeholder="10"
                                    className="h-11"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Description */}
                <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your hostel, amenities, rules, nearby landmarks..."
                            rows={5}
                        />
                    </CardContent>
                </Card>

                {/* Images */}
                <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle>Photos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ImageUpload
                            images={images}
                            onImagesChange={setImages}
                            userId={userId}
                        />
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex-1 h-12"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 h-12 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {mode === 'create' ? 'Create Hostel' : 'Save Changes'}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </form>
    );
}
