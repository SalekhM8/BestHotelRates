'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { HotelCardDynamic } from '@/components/hotel/HotelCardDynamic';
import { GlassCard } from '@/components/ui/GlassCard';
import { SupplierHotelSummary } from '@/lib/suppliers/types';

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

type SortOption = 'price-asc' | 'price-desc' | 'rating';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const destination = searchParams.get('destination') ?? '';

  const [hotels, setHotels] = useState<SupplierHotelSummary[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      destination: destination || undefined,
      maxPrice: priceRange[1],
      minRating: minRating || undefined,
      sortBy,
    }),
    [destination, priceRange, minRating, sortBy],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function fetchHotels() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/hotels/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: filters.destination,
            maxPrice: filters.maxPrice,
            minRating: filters.minRating,
            sortBy: filters.sortBy,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch hotels');
        }

        const data = await response.json();
        if (!controller.signal.aborted) {
          setHotels(data.hotels ?? []);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setError('Unable to load hotels. Please try again shortly.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchHotels();

    return () => controller.abort();
  }, [filters]);

  return (
    <main className="relative min-h-screen pb-32 md:pb-24 pt-24">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 drop-shadow-2xl">
          Search Results
          {searchParams.get('destination') && (
            <span className="text-2xl md:text-3xl text-white/80 ml-3">
              in {searchParams.get('destination')}
            </span>
          )}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <GlassCard>
              <h3 className="text-xl font-bold text-white mb-6">Filters</h3>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-white mb-3">
                  Price Range
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value, 10)])}
                    className="w-full"
                  />
                  <p className="text-white/70 text-sm">Up to £{priceRange[1]} per night</p>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-white mb-3">
                  Minimum Rating
                </label>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        minRating === rating
                          ? 'bg-white/20 border-2 border-white/50'
                          : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-white font-medium">{rating}+ Stars</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-bold text-white mb-3">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="glass-input w-full px-4 py-3 text-white font-medium"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </GlassCard>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-white/80">
                {loading ? (
                  'Searching inventory...'
                ) : (
                  <>
                    <span className="font-bold text-white">{hotels.length}</span> hotels found
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {hotels.map((hotel) => (
                <HotelCardDynamic key={hotel.id} {...toCardProps(hotel)} />
              ))}
            </div>

            {!loading && (error || hotels.length === 0) && (
              <GlassCard>
                <div className="text-center py-12">
                  <p className="text-xl text-white mb-4">
                    {error ? 'Something went wrong' : 'No hotels found'}
                  </p>
                  <p className="text-white/70">
                    {error ?? 'Try adjusting your filters to discover more stays.'}
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

