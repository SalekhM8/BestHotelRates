'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { HotelCard } from '@/components/hotel/HotelCard';

interface WishlistItem {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelLocation: string;
  hotelImage: string | null;
  hotelStarRating: number | null;
  createdAt: Date;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to login page, not homepage
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchWishlist();
    }
  }, [status, router]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist');
      const data = await response.json();
      
      if (response.ok) {
        setWishlistItems(data.wishlist);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <main className="relative min-h-screen pb-24 pt-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center text-white">Loading...</div>
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="relative min-h-screen pb-24 pt-32">
      <div className="max-w-[1600px] mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-lg">
          My Wishlist
        </h1>

        {wishlistItems.length === 0 ? (
          <GlassCard>
            <div className="text-center py-12">
              <svg
                className="w-20 h-20 mx-auto mb-4 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-white/70 mb-6">
                Start adding hotels to your wishlist by clicking the heart icon
              </p>
              <button
                onClick={() => router.push('/')}
                className="glass-card-small px-6 py-3 text-white font-semibold"
              >
                Browse Hotels
              </button>
            </div>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <HotelCard
                key={item.id}
                id={item.hotelId}
                name={item.hotelName}
                location={item.hotelLocation}
                rating={item.hotelStarRating || 4.5}
                price={150}
                image={item.hotelImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop'}
                dates="Flexible"
                roomType="Various"
                isFavorite={true}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

