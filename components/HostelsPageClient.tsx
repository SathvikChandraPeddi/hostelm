'use client';

import { useState, useMemo } from 'react';
import { HostelCard } from '@/components/HostelCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X, Building2, IndianRupee, MapPin } from 'lucide-react';
import type { HostelWithImages } from '@/lib/types';

interface HostelsPageClientProps {
    initialHostels: HostelWithImages[];
}

type SortOption = 'name' | 'price-low' | 'price-high' | 'availability';

export function HostelsPageClient({ initialHostels }: HostelsPageClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArea, setSelectedArea] = useState<string>('');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const [showFilters, setShowFilters] = useState(false);

    // Get unique areas for filter dropdown
    const uniqueAreas = useMemo(() => {
        const areas = new Set(initialHostels.map(h => h.area));
        return Array.from(areas).sort();
    }, [initialHostels]);

    // Get price range from data
    const [minPrice, maxPrice] = useMemo(() => {
        if (initialHostels.length === 0) return [0, 50000];
        const prices = initialHostels.map(h => h.price);
        return [Math.min(...prices), Math.max(...prices)];
    }, [initialHostels]);

    // Filter and sort hostels
    const filteredHostels = useMemo(() => {
        let result = initialHostels;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                h => h.name.toLowerCase().includes(query) || h.area.toLowerCase().includes(query)
            );
        }

        // Area filter
        if (selectedArea) {
            result = result.filter(h => h.area === selectedArea);
        }

        // Price filter
        result = result.filter(h => h.price >= priceRange[0] && h.price <= priceRange[1]);

        // Sort
        switch (sortBy) {
            case 'name':
                result = [...result].sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-low':
                result = [...result].sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result = [...result].sort((a, b) => b.price - a.price);
                break;
            case 'availability':
                result = [...result].sort((a, b) => {
                    return b.vacant_beds - a.vacant_beds;
                });
                break;
        }

        return result;
    }, [initialHostels, searchQuery, selectedArea, priceRange, sortBy]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedArea('');
        setPriceRange([minPrice, maxPrice]);
        setSortBy('name');
    };

    const hasActiveFilters = searchQuery || selectedArea || priceRange[0] !== minPrice || priceRange[1] !== maxPrice;

    if (initialHostels.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    No hostels found
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                    Check back later for new listings.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search by hostel name or area..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                    </div>

                    {/* Filter Toggle & Sort */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-12 gap-2 ${showFilters ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-400' : ''}`}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters
                            {hasActiveFilters && (
                                <span className="w-2 h-2 rounded-full bg-violet-500" />
                            )}
                        </Button>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                            <option value="name">Sort: A-Z</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="availability">Most Available</option>
                        </select>
                    </div>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Area Filter */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Area
                                </label>
                                <select
                                    value={selectedArea}
                                    onChange={(e) => setSelectedArea(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                >
                                    <option value="">All Areas</option>
                                    {uniqueAreas.map((area) => (
                                        <option key={area} value={area}>{area}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Min Price */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                    <IndianRupee className="w-4 h-4" />
                                    Min Price
                                </label>
                                <Input
                                    type="number"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                    min={minPrice}
                                    max={priceRange[1]}
                                    className="h-10 bg-slate-50 dark:bg-slate-800"
                                />
                            </div>

                            {/* Max Price */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                    <IndianRupee className="w-4 h-4" />
                                    Max Price
                                </label>
                                <Input
                                    type="number"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                    min={priceRange[0]}
                                    max={maxPrice}
                                    className="h-10 bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <div className="mt-4 flex justify-end">
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 hover:text-slate-700">
                                    <X className="w-4 h-4 mr-1" />
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredHostels.length}</span> of {initialHostels.length} hostels
                </p>
            </div>

            {/* Hostels Grid */}
            {filteredHostels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHostels.map((hostel) => (
                        <HostelCard key={hostel.id} hostel={hostel} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        No matching hostels
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Try adjusting your search or filters
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                        Clear all filters
                    </Button>
                </div>
            )}
        </div>
    );
}
