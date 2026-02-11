'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HostelImage } from '@/lib/types';

interface ImageGalleryProps {
    images: HostelImage[];
    hostelName: string;
}

export function ImageGallery({ images, hostelName }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
    const hasMultipleImages = sortedImages.length > 1;

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
    };

    if (sortedImages.length === 0) {
        return (
            <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                <p className="text-slate-400">No images available</p>
            </div>
        );
    }

    return (
        <>
            {/* Main Gallery */}
            <div className="relative">
                {/* Main Image */}
                <div
                    className="relative aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
                    onClick={() => setIsFullscreen(true)}
                >
                    <Image
                        src={sortedImages[currentIndex].image_url}
                        alt={`${hostelName} - Image ${currentIndex + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 80vw"
                        priority
                    />

                    {/* Image Counter */}
                    {hasMultipleImages && (
                        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                            {currentIndex + 1} / {sortedImages.length}
                        </div>
                    )}
                </div>

                {/* Navigation Arrows */}
                {hasMultipleImages && (
                    <>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-lg hover:bg-white dark:hover:bg-slate-900"
                            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-lg hover:bg-white dark:hover:bg-slate-900"
                            onClick={(e) => { e.stopPropagation(); goToNext(); }}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </>
                )}

                {/* Thumbnail Strip */}
                {hasMultipleImages && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {sortedImages.map((image, index) => (
                            <button
                                key={image.id}
                                onClick={() => setCurrentIndex(index)}
                                className={`relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden transition-all ${index === currentIndex
                                        ? 'ring-2 ring-violet-500 ring-offset-2'
                                        : 'opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <Image
                                    src={image.image_url}
                                    alt={`Thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                    onClick={() => setIsFullscreen(false)}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white hover:bg-white/20"
                        onClick={() => setIsFullscreen(false)}
                    >
                        <X className="w-6 h-6" />
                    </Button>

                    <div className="relative w-full h-full max-w-6xl max-h-[90vh] m-4">
                        <Image
                            src={sortedImages[currentIndex].image_url}
                            alt={`${hostelName} - Image ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                            sizes="100vw"
                        />
                    </div>

                    {hasMultipleImages && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            >
                                <ChevronRight className="w-8 h-8" />
                            </Button>
                        </>
                    )}

                    {/* Fullscreen Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
                        {currentIndex + 1} / {sortedImages.length}
                    </div>
                </div>
            )}
        </>
    );
}
