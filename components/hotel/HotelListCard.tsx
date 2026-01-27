'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SupplierHotelSummary } from '@/lib/suppliers/types';

type Props = {
  hotel: SupplierHotelSummary;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
};

function formatCurrency(amount: number | null | undefined, currency: string = 'GBP') {
  if (!amount) return null;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(Math.floor(stars))].map((_, i) => (
        <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function HotelListCard({ hotel, checkIn, checkOut, guests }: Props) {
  const imageUrl = hotel.primaryImage || hotel.heroImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
  const price = formatCurrency(hotel.startingRate, hotel.currency);
  const originalPrice = hotel.startingRate ? formatCurrency(hotel.startingRate * 1.2, hotel.currency) : null;
  
  // Build URL with search params
  const hotelUrl = `/hotels/${hotel.slug || hotel.id}${checkIn ? `?checkIn=${checkIn}` : ''}${checkOut ? `&checkOut=${checkOut}` : ''}${guests ? `&guests=${guests}` : ''}`;

  return (
    <div className="hotel-card-horizontal mb-4 fade-in">
      {/* Image Section */}
      <div className="relative w-full md:w-56 lg:w-64 flex-shrink-0">
        <div className="aspect-[4/3] md:aspect-square relative">
          <Image
            src={imageUrl}
            alt={hotel.name}
            fill
            className="object-cover"
          />
          {/* Wishlist Button */}
          <button 
            className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to wishlist
            }}
          >
            <svg className="w-5 h-5 text-gray-500 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col md:flex-row flex-1 p-4">
        {/* Left: Details */}
        <div className="flex-1 min-w-0">
          {/* Name & Stars */}
          <div className="flex items-start gap-2 mb-1">
            <Link href={hotelUrl} className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#5DADE2] hover:underline line-clamp-1">
                {hotel.name}
              </h3>
            </Link>
            {hotel.rating > 0 && (
              <StarRating stars={hotel.rating} />
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 mb-2">
            <a href="#" className="text-[#5DADE2] text-sm hover:underline">
              {hotel.location}
            </a>
            <span className="text-gray-400">·</span>
            <a href="#" className="text-[#5DADE2] text-sm hover:underline">
              Show on map
            </a>
            <span className="text-sm text-gray-500">2.5 km from centre</span>
          </div>

          {/* Deal Badge */}
          <div className="mb-2">
            <span className="badge badge-deal">Limited-time Deal</span>
          </div>

          {/* Room Info */}
          <div className="mb-2">
            <p className="font-semibold text-sm text-gray-900">Standard Double Room</p>
            <p className="text-sm text-gray-600">1 double bed · Free cancellation</p>
          </div>

          {/* Urgency */}
          <p className="urgency-text">Only 3 rooms left at this price!</p>
        </div>

        {/* Right: Price & CTA */}
        <div className="flex flex-col items-end justify-between mt-4 md:mt-0 md:ml-4 md:min-w-[160px]">
          {/* Rating Badge */}
          {hotel.rating > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="text-right">
                <p className="font-semibold text-sm text-gray-900">
                  {hotel.rating >= 4.5 ? 'Fabulous' : hotel.rating >= 4 ? 'Very Good' : hotel.rating >= 3.5 ? 'Good' : 'Pleasant'}
                </p>
                <p className="text-xs text-gray-500">{Math.floor(Math.random() * 500) + 100} reviews</p>
              </div>
              <div className="rating-badge">
                {hotel.rating.toFixed(1)}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="text-right mb-3">
            <p className="text-xs text-gray-500">1 night, 2 adults</p>
            {originalPrice && (
              <p className="price-original">{originalPrice}</p>
            )}
            {price && (
              <p className="price-current">{price}</p>
            )}
            <p className="text-xs text-gray-500">Includes taxes and charges</p>
          </div>

          {/* CTA */}
          <Link
            href={hotelUrl}
            className="w-full md:w-auto px-6 py-2.5 bg-[#5DADE2] hover:bg-[#3498DB] text-white font-semibold rounded text-center transition-colors"
          >
            See availability
          </Link>
        </div>
      </div>
    </div>
  );
}

