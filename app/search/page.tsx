'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { HotelCardDynamic } from '@/components/hotel/HotelCardDynamic';
import { GlassCard } from '@/components/ui/GlassCard';
import { FilterPanel, SearchFilters } from '@/components/search/FilterPanel';
import { SortDropdown, SortOption } from '@/components/search/SortDropdown';
import { SupplierHotelSummary } from '@/lib/suppliers/types';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const toCardProps = (hotel: SupplierHotelSummary) => {
  const tags = Array.isArray(hotel.tags)
    ? hotel.tags.filter((tag): tag is string => typeof tag === 'string')
    : undefined;

  return {
    id: hotel.id,
    slug: hotel.slug,
    name: hotel.name,
    location: hotel.location,
    rating: hotel.rating,
    startingRate: hotel.startingRate,
    currency: hotel.currency,
    image: hotel.primaryImage ?? hotel.heroImage,
    highlight: hotel.minRatePlan?.name,
    badge: hotel.categories[0]?.replace(/-/g, ' '),
    tags,
  };
};

const DEFAULT_FILTERS: SearchFilters = {
  priceRange: [0, 2000],
  starRating: [],
  amenities: [],
  boardTypes: [],
  refundableOnly: false,
  payAtHotel: false,
};

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const destination = searchParams.get('destination') ?? '';
  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';

  const [hotels, setHotels] = useState<SupplierHotelSummary[]>([]);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Calculate price histogram from results
  const priceHistogram = useMemo(() => {
    if (hotels.length === 0) return [];
    const buckets = 20;
    const histogram = new Array(buckets).fill(0);
    const maxPrice = 2000;

    hotels.forEach((hotel) => {
      const price = hotel.startingRate ?? 0;
      const bucketIndex = Math.min(Math.floor((price / maxPrice) * buckets), buckets - 1);
      histogram[bucketIndex]++;
    });

    return histogram;
  }, [hotels]);

  // Filtered and sorted hotels
  const filteredHotels = useMemo(() => {
    let result = [...hotels];

    // Apply price filter
    result = result.filter((hotel) => {
      const price = hotel.startingRate ?? 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Apply star rating filter
    if (filters.starRating.length > 0) {
      result = result.filter((hotel) => filters.starRating.includes(hotel.rating ?? 0));
    }

    // Apply refundable filter (placeholder - requires supplier data enhancement)
    // TODO: Add isRefundable to minRatePlan in SupplierHotelSummary type
    if (filters.refundableOnly) {
      // For now, keep all hotels when refundable filter is on
      // This will be properly implemented when we have refundability data
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.startingRate ?? 0) - (b.startingRate ?? 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.startingRate ?? 0) - (a.startingRate ?? 0));
        break;
      case 'rating-desc':
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'recommended':
      default:
        // Keep original order (by relevance from API)
        break;
    }

    return result;
  }, [hotels, filters, sortBy]);

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destination || undefined,
          checkIn: checkIn || undefined,
          checkOut: checkOut || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }

      const data = await response.json();
      setHotels(data.hotels ?? []);
    } catch (err) {
      console.error(err);
      setError('Unable to load hotels. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  }, [destination, checkIn, checkOut]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <main className="relative min-h-screen pb-32 md:pb-24 pt-24">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-2xl">
            {destination ? `Hotels in ${destination}` : 'Search Results'}
          </h1>
          {checkIn && checkOut && (
            <p className="text-white/70">
              {new Date(checkIn).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short' 
              })} - {new Date(checkOut).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short',
                year: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
            </button>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-white/20' : ''}`}
                title="Grid view"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-white/20' : ''}`}
                title="List view"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 ${viewMode === 'map' ? 'bg-white/20' : ''}`}
                title="Map view"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sort Dropdown */}
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              priceHistogram={priceHistogram}
              resultsCount={filteredHotels.length}
              onClearAll={handleClearFilters}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white/10 rounded-2xl h-64" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <GlassCard>
                <div className="text-center py-12">
                  <p className="text-xl text-white mb-4">Something went wrong</p>
                  <p className="text-white/70 mb-6">{error}</p>
                  <button
                    onClick={fetchHotels}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </GlassCard>
            ) : filteredHotels.length === 0 ? (
              <GlassCard>
                <div className="text-center py-12">
                  <svg
                    className="w-20 h-20 mx-auto mb-4 text-white/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-xl text-white mb-4">No hotels found</p>
                  <p className="text-white/70 mb-6">
                    Try adjusting your filters or search for a different destination
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </GlassCard>
            ) : (
              <>
                {/* Results Count */}
                <p className="text-white/80 mb-4 lg:hidden">
                  <span className="font-bold text-white">{filteredHotels.length}</span> hotels found
                </p>

                {/* Hotel Grid */}
                <div
                  className={
                    viewMode === 'list'
                      ? 'space-y-4'
                      : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6'
                  }
                >
                  {filteredHotels.map((hotel) => (
                    <HotelCardDynamic
                      key={hotel.id}
                      {...toCardProps(hotel)}
                      layout={viewMode === 'list' ? 'horizontal' : 'vertical'}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-slate-900/95 backdrop-blur-md overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-4 bg-slate-900/95 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 text-white/70 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                priceHistogram={priceHistogram}
                resultsCount={filteredHotels.length}
                onClearAll={handleClearFilters}
              />
            </div>
            <div className="sticky bottom-0 p-4 bg-slate-900/95 border-t border-white/10">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
              >
                Show {filteredHotels.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen flex items-center justify-center pb-32 md:pb-24 pt-24">
          <div className="text-white/80 text-lg">Loading search…</div>
        </main>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
