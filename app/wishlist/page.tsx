'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type WishlistItem = {
  id: string;
  hotelId: string;
  hotel: {
    name: string;
    location: string;
    rating: number;
    startingRate: number;
    currency: string;
    image: string;
  };
};

export default function WishlistPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  useEffect(() => {
    async function fetchWishlist() {
      if (authStatus !== 'authenticated') return;
      
      setLoading(true);
      try {
        const res = await fetch('/api/wishlist');
        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        console.error('Failed to fetch wishlist:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [authStatus]);

  const removeFromWishlist = async (id: string) => {
    try {
      await fetch(`/api/wishlist/${id}`, { method: 'DELETE' });
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5DADE2]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-[#5DADE2] py-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white">Saved</h1>
          <p className="text-white/80 mt-1">Your favourite properties</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5DADE2] mx-auto"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved properties</h3>
            <p className="text-gray-500 mb-6">
              Start saving your favourite hotels to view them here.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-[#5DADE2] text-white font-semibold rounded-lg hover:bg-[#3498DB] transition-colors"
            >
              Search hotels
            </Link>
          </div>
        )}

        {/* Wishlist Grid */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-[4/3]">
                  {item.hotel.image && (
                    <Image
                      src={item.hotel.image}
                      alt={item.hotel.name}
                      fill
                      className="object-cover"
                    />
                  )}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.hotel.name}</h3>
                  <p className="text-sm text-[#5DADE2] mb-2">{item.hotel.location}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {item.hotel.rating > 0 && (
                        <span className="rating-badge-small">{item.hotel.rating.toFixed(1)}</span>
                      )}
                    </div>
                    {item.hotel.startingRate > 0 && (
                      <div className="text-right">
                        <span className="text-xs text-gray-500">From </span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(item.hotel.startingRate, item.hotel.currency)}
                        </span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/hotels/${item.hotelId}`}
                    className="mt-4 block w-full py-2 text-center bg-[#5DADE2] text-white font-medium rounded-lg hover:bg-[#3498DB] transition-colors"
                  >
                    View property
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
