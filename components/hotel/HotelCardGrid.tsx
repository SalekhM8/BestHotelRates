'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SupplierHotelSummary } from '@/lib/suppliers/types';

type Props = {
  hotels: SupplierHotelSummary[];
};

function formatCurrency(amount: number | null | undefined, currency: string = 'GBP') {
  if (!amount) return null;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function StarRating({ rating }: { rating: number }) {
  const stars = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(stars)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function HotelCardGrid({ hotels }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {hotels.map((hotel) => {
        const imageUrl = hotel.primaryImage || hotel.heroImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
        const price = formatCurrency(hotel.startingRate, hotel.currency);
        
        return (
          <Link
            key={hotel.id}
            href={`/hotels/${hotel.slug || hotel.id}`}
            className="group block"
          >
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#5DADE2] transition-all">
              {/* Image */}
              <div className="relative aspect-[4/3]">
                <Image
                  src={imageUrl}
                  alt={hotel.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Wishlist Button */}
                <button 
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Add to wishlist
                  }}
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-3">
                {/* Name & Stars */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-[#5DADE2] transition-colors">
                    {hotel.name}
                  </h3>
                  {hotel.rating > 0 && (
                    <div className="rating-badge-small flex-shrink-0">
                      {hotel.rating.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Location */}
                <p className="text-[#5DADE2] text-xs mb-2">{hotel.location}</p>

                {/* Star Rating */}
                {hotel.rating > 0 && (
                  <div className="mb-2">
                    <StarRating rating={hotel.rating} />
                  </div>
                )}

                {/* Price */}
                {price && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-gray-500">From</span>
                    <span className="font-bold text-gray-900">{price}</span>
                    <span className="text-xs text-gray-500">per night</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

