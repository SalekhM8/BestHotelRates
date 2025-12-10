'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Booking {
  id: string;
  bookingReference: string;
  hotelName: string;
  hotelLocation: string;
  checkIn: Date;
  checkOut: Date;
  roomType: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: Date;
}

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to login page
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?filter=${filter}`);
      const data = await response.json();
      
      if (response.ok) {
        setBookings(data.bookings);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  return (
    <main className="relative min-h-screen pb-24 pt-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            My Bookings
          </h1>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`glass-card-small px-4 py-2 text-sm font-semibold transition-all ${
                filter === 'all' ? 'bg-white/20' : ''
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`glass-card-small px-4 py-2 text-sm font-semibold transition-all ${
                filter === 'upcoming' ? 'bg-white/20' : ''
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`glass-card-small px-4 py-2 text-sm font-semibold transition-all ${
                filter === 'past' ? 'bg-white/20' : ''
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {bookings.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">
                No bookings yet
              </h3>
              <p className="text-white/70 mb-6">
                Start exploring and book your perfect stay
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
          <div className="space-y-4">
            {bookings.map((booking) => (
              <GlassCard key={booking.id} className="hover:scale-[1.01] transition-transform">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {booking.hotelName}
                        </h3>
                        <p className="text-white/70 text-sm">
                          {booking.hotelLocation}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-white/60 text-sm mb-1">Check-in</p>
                        <p className="text-white font-medium">
                          {formatDate(booking.checkIn)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-1">Check-out</p>
                        <p className="text-white font-medium">
                          {formatDate(booking.checkOut)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-white/70">
                      <span>Ref: {booking.bookingReference}</span>
                      <span>•</span>
                      <span>{booking.roomType}</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between md:items-end">
                    <div className="text-right mb-4">
                      <p className="text-white/60 text-sm mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(booking.totalAmount)}
                      </p>
                    </div>

                    <button className="glass-card-small px-6 py-2 text-sm font-semibold">
                      View Details
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

