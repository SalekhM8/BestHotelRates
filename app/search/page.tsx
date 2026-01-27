'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HotelListCard } from '@/components/hotel/HotelListCard';
import { FilterPanel } from '@/components/search/FilterPanel';
import { SortDropdown } from '@/components/search/SortDropdown';
import { SearchBarCompact } from '@/components/hotel/SearchBarCompact';
import { SupplierHotelSummary } from '@/lib/suppliers/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const destination = searchParams.get('destination') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const adults = parseInt(searchParams.get('adults') || '2');
  const children = parseInt(searchParams.get('children') || '0');
  const rooms = parseInt(searchParams.get('rooms') || '1');

  const [hotels, setHotels] = useState<SupplierHotelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState('recommended');
  
  // Filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [starRatings, setStarRatings] = useState<number[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Fetch hotels
  useEffect(() => {
    async function fetchHotels() {
      if (!destination) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set('destination', destination);
        if (checkIn) params.set('checkIn', checkIn);
        if (checkOut) params.set('checkOut', checkOut);
        params.set('adults', adults.toString());
        params.set('rooms', rooms.toString());

        const res = await fetch(`/api/hotels/search?${params.toString()}`);
        
        // Handle empty or error responses
        const text = await res.text();
        if (!text) {
          setHotels([]);
          return;
        }

        const data = JSON.parse(text);

        if (!res.ok) {
          throw new Error(data.error || 'Failed to search hotels');
        }

        setHotels(data.hotels || []);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Failed to search hotels');
      } finally {
        setLoading(false);
      }
    }

    fetchHotels();
  }, [destination, checkIn, checkOut, adults, rooms]);

  // Filter and sort hotels
  const filteredHotels = useMemo(() => {
    let result = [...hotels];

    // Apply price filter
    result = result.filter(h => {
      const price = h.startingRate || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply star rating filter
    if (starRatings.length > 0) {
      result = result.filter(h => starRatings.includes(Math.floor(h.rating || 0)));
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.startingRate || 0) - (b.startingRate || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.startingRate || 0) - (a.startingRate || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // Keep recommended order
        break;
    }

    return result;
  }, [hotels, priceRange, starRatings, sortBy]);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Search Bar Header */}
      <div className="bg-[#5DADE2] py-4">
        <div className="max-w-7xl mx-auto px-4">
          <SearchBarCompact
            initialDestination={destination}
            initialCheckIn={checkIn}
            initialCheckOut={checkOut}
            initialAdults={adults}
            initialChildren={children}
            initialRooms={rooms}
          />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <Link href="#">United Kingdom</Link>
          <span>›</span>
          <span className="text-gray-500">{destination || 'Search results'}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            {/* Map Preview */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
              <div className="aspect-[4/3] bg-gray-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-sm text-gray-500">Map view</p>
                  </div>
                </div>
              </div>
              <button className="w-full py-3 bg-[#5DADE2] text-white font-semibold hover:bg-[#3498DB] transition-colors flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Show on map
              </button>
            </div>

            {/* Filters */}
            <FilterPanel
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              starRatings={starRatings}
              onStarRatingsChange={setStarRatings}
              selectedFilters={selectedFilters}
              onFiltersChange={setSelectedFilters}
            />
          </aside>

          {/* Right Content - Results */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {destination}: {filteredHotels.length} properties found
                </h1>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <SortDropdown value={sortBy} onChange={setSortBy} />

                {/* View Toggle */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    Grid
                  </button>
                </div>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-600">
                Prices shown include all taxes and fees. <a href="#" className="text-[#5DADE2] hover:underline">Find out more.</a>
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-56 aspect-square bg-gray-200 rounded" />
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-2/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-10 bg-gray-200 rounded w-32 ml-auto mt-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredHotels.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-[#5DADE2] text-white font-semibold rounded-lg hover:bg-[#3498DB]"
                >
                  Search again
                </Link>
              </div>
            )}

            {/* Results */}
            {!loading && !error && filteredHotels.length > 0 && (
              <div>
                {filteredHotels.map((hotel) => (
                  <HotelListCard
                    key={hotel.id}
                    hotel={hotel}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    guests={adults + children}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
