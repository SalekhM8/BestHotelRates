'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface HotelCardDynamicProps {
  id: string;
  slug?: string;
  name: string;
  location: string;
  rating: number;
  startingRate?: number | null;
  currency?: string;
  image?: string | null;
  highlight?: string;
  badge?: string;
  tags?: string[];
  isFavorite?: boolean;
  onFavoriteToggle?: (hotelId: string, isFavorite: boolean) => void;
  layout?: 'vertical' | 'horizontal';
}

export const HotelCardDynamic: React.FC<HotelCardDynamicProps> = ({
  id,
  name,
  slug,
  location,
  rating,
  startingRate,
  currency = 'GBP',
  image,
  highlight,
  badge,
  tags,
  isFavorite = false,
  onFavoriteToggle,
  layout = 'vertical',
}) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const fallbackImage =
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop';
  const displayImage = image || fallbackImage;
  const priceLabel =
    startingRate && startingRate > 0
      ? new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency,
          maximumFractionDigits: 0,
        }).format(startingRate)
      : 'See packages';

  // Check if hotel is in wishlist on mount
  useEffect(() => {
    if (session) {
      checkIfFavorite();
    }
  }, [session, id]);

  const checkIfFavorite = async () => {
    try {
      const response = await fetch('/api/wishlist');
      const data = await response.json();
      if (response.ok && data.wishlist) {
        const isFav = data.wishlist.some((item: any) => item.hotelId === id);
        setFavorite(isFav);
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // CRITICAL: Must be logged in to use wishlist
    if (!session) {
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      if (favorite) {
        // Remove from wishlist - need to find the wishlist item by hotelId
        const response = await fetch('/api/wishlist');
        const data = await response.json();
        const wishlistItem = data.wishlist?.find((item: any) => item.hotelId === id);
        
        if (wishlistItem) {
          const deleteResponse = await fetch(`/api/wishlist/${wishlistItem.id}`, {
            method: 'DELETE',
          });

          if (deleteResponse.ok) {
            setFavorite(false);
            onFavoriteToggle?.(id, false);
          }
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hotelId: id,
            hotelName: name,
            hotelLocation: location,
            hotelImage: displayImage,
            hotelStarRating: Math.round(rating),
          }),
        });

        if (response.ok) {
          setFavorite(true);
          onFavoriteToggle?.(id, true);
        } else {
          // If unauthorized or error, redirect to login
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/hotels/${slug ?? id}`);
  };

  // Horizontal layout for list view
  if (layout === 'horizontal') {
    return (
      <div className="glass-card p-0 cursor-pointer group overflow-hidden" onClick={handleCardClick}>
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-72 h-48 sm:h-auto sm:min-h-[200px] flex-shrink-0">
            <Image
              src={displayImage}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 288px"
            />
            
            {/* Heart Button */}
            <button
              onClick={handleFavoriteClick}
              disabled={loading}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 hover:scale-110 transition-all z-10 ${
                loading ? 'opacity-50' : ''
              }`}
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

            {/* Badge */}
            <div className="absolute top-3 left-3 bg-white/95 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-800 shadow-lg">
              {badge ?? 'Guest favorite'}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white leading-tight flex-1">
                  {name}
                </h3>
                <div className="flex items-center gap-1 text-white text-sm font-semibold shrink-0 bg-blue-500/30 px-2 py-1 rounded-lg">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD700">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  {rating.toFixed(1)}
                </div>
              </div>

              <p className="text-sm text-white/70 mb-3">
                📍 {location}
              </p>

              <p className="text-sm text-white/60 mb-3">
                {highlight ?? 'Multiple room options available'}
              </p>

              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-end justify-between pt-3 border-t border-white/10">
              <div className="text-white/60 text-sm">
                From
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {priceLabel}
                </div>
                {startingRate && <span className="text-xs text-white/60">per night</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default vertical layout
  return (
    <div className="glass-card p-0 cursor-pointer group overflow-hidden" onClick={handleCardClick}>
      {/* Image */}
      <div className="relative h-56 sm:h-64 md:h-72 rounded-t-2xl md:rounded-t-3xl overflow-hidden">
        <Image
          src={displayImage}
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        
        {/* Heart Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={loading}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 hover:scale-110 transition-all z-10 ${
            loading ? 'opacity-50' : ''
          }`}
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
          {badge ?? 'Guest favorite'}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm sm:text-base font-semibold text-white leading-tight flex-1 line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center gap-1 text-white text-xs sm:text-sm font-semibold shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#FFD700">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            {rating.toFixed(2)}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-white/70 mb-1.5 line-clamp-2">
          {location}
        </p>

        <div className="flex items-baseline justify-between gap-2">
          <div className="text-xs sm:text-sm text-white/60 line-clamp-1">
            {highlight ?? 'Multiple collections'}
          </div>
          <div className="text-sm sm:text-base text-white font-semibold">
            {priceLabel}
            {startingRate && <span className="text-xs text-white/60 ml-1">per night</span>}
          </div>
        </div>

        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] uppercase tracking-wide text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

