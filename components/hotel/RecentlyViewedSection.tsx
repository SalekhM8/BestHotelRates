'use client';

import React from 'react';
import { useRecentlyViewed } from '@/lib/hooks/useRecentlyViewed';
import { HotelCardDynamic } from './HotelCardDynamic';

export function RecentlyViewedSection() {
  const { recentlyViewed, isLoaded, clearRecentlyViewed } = useRecentlyViewed();

  // Don't render if not loaded or empty
  if (!isLoaded || recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Recently Viewed
            </h2>
            <p className="text-white/60 mt-1">
              Pick up where you left off
            </p>
          </div>
          <button
            onClick={clearRecentlyViewed}
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentlyViewed.slice(0, 4).map((hotel) => (
            <HotelCardDynamic
              key={hotel.id}
              id={hotel.id}
              slug={hotel.slug}
              name={hotel.name}
              location={hotel.location}
              rating={hotel.rating}
              startingRate={hotel.startingRate}
              currency={hotel.currency}
              image={hotel.image}
              badge="Recently viewed"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

