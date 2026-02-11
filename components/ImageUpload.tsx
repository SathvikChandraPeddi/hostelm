'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { X, Loader2, ImagePlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ImageUploadProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    userId: string;
    maxImages?: number;
}

export function ImageUpload({ images, onImagesChange, userId, maxImages = 5 }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (images.length + files.length > maxImages) {
            alert(`Maximum ${maxImages} images allowed`);
            return;
        }

        setUploading(true);
        const supabase = createClient();
        const newImages: string[] = [];

        for (const file of Array.from(files)) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Only image files are allowed');
                continue;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB');
                continue;
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Upload to Supabase storage
            const { error } = await supabase.storage
                .from('hostel-images')
                .upload(fileName, file);

            if (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image. Please try again.');
                continue;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('hostel-images')
                .getPublicUrl(fileName);

            newImages.push(publicUrl);
        }

        onImagesChange([...images, ...newImages]);
        setUploading(false);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    return (
        <div className="space-y-4">
            {/* Upload Button */}
            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${images.length >= maxImages
                    ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
                    : 'border-violet-300 bg-violet-50/50 hover:border-violet-400 hover:bg-violet-50'
                    }`}
                onClick={() => images.length < maxImages && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={images.length >= maxImages || uploading}
                />

                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                        <p className="text-violet-600 font-medium">Uploading...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                            <ImagePlus className="w-6 h-6 text-violet-600" />
                        </div>
                        <p className="text-violet-600 font-medium">
                            {images.length >= maxImages ? 'Maximum images reached' : 'Click to upload images'}
                        </p>
                        <p className="text-sm text-slate-500">
                            {images.length}/{maxImages} images • Max 5MB each
                        </p>
                    </div>
                )}
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((url, index) => (
                        <div key={url} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 group">
                            <Image
                                src={url}
                                alt={`Upload ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 33vw"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            {index === 0 && (
                                <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                                    Primary
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
