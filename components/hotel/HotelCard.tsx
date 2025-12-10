'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface HotelCardProps {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  image: string;
  dates: string;
  roomType: string;
  isFavorite?: boolean;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  id,
  name,
  location,
  rating,
  price,
  image,
  dates,
  roomType,
  isFavorite = false,
}) => {
  const [favorite, setFavorite] = useState(isFavorite);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite(!favorite);
  };

  const handleCardClick = () => {
    console.log('Hotel clicked:', id);
  };

  return (
    <div className="glass-card p-0 cursor-pointer group overflow-hidden" onClick={handleCardClick}>
      {/* Image */}
      <div className="relative h-72 rounded-t-3xl overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Heart Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 hover:scale-110 transition-all z-10"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill={favorite ? '#ff385c' : 'none'}
            stroke={favorite ? '#ff385c' : 'white'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        {/* Guest Favorite Badge */}
        <div className="absolute top-3 left-3 bg-white/95 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800 shadow-lg">
          Guest favorite
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-semibold text-white leading-tight flex-1 line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center gap-1 text-white text-sm font-semibold shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD700">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            {rating.toFixed(2)}
          </div>
        </div>

        <p className="text-sm text-white/70 mb-2">
          {dates} · {roomType}
        </p>

        <p className="text-base text-white font-medium">
          <span className="font-bold">£{price}</span> per night
        </p>
      </div>
    </div>
  );
};

