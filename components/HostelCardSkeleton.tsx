import { Card, CardContent } from '@/components/ui/card';

export function HostelCardSkeleton() {
    return (
        <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-slate-900">
            {/* Image Skeleton */}
            <div className="relative aspect-[4/3] bg-slate-200 dark:bg-slate-800 animate-pulse" />

            {/* Content Skeleton */}
            <CardContent className="p-4">
                {/* Name */}
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2 w-3/4" />

                {/* Area */}
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3 w-1/2" />

                {/* Price */}
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/3" />
            </CardContent>
        </Card>
    );
}

export function HostelGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <HostelCardSkeleton key={i} />
            ))}
        </div>
    );
}
