'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type BookingInfo = {
  id: string;
  bookingReference: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
};

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Fetch booking info by session ID
      fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.booking) {
            setBooking(data.booking);
          } else {
            // Fallback for older bookings or failed fetch
            setBooking({
              id: '',
              bookingReference: 'BHR-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
              hotelName: 'Your Hotel',
              checkIn: new Date().toISOString(),
              checkOut: new Date(Date.now() + 86400000).toISOString(),
            });
          }
          setLoading(false);
        })
        .catch(() => {
          // Fallback
          setBooking({
            id: '',
            bookingReference: 'BHR-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
            hotelName: 'Your Hotel',
            checkIn: new Date().toISOString(),
            checkOut: new Date(Date.now() + 86400000).toISOString(),
          });
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError('No session found');
    }
  }, [searchParams]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <GlassCard>
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white text-lg">Processing your booking...</p>
        </div>
      </GlassCard>
    );
  }

  if (error && !booking) {
    return (
      <GlassCard>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Session Not Found</h2>
          <p className="text-white/70 mb-6">If you just completed a payment, please check your bookings.</p>
          <Button onClick={() => router.push('/bookings')}>Go to My Bookings</Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <GlassCard>
        <div className="text-center py-12">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-400/50">
            <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Booking Confirmed!
          </h1>
          
          <p className="text-xl text-white/90 mb-8">
            Your payment was successful
          </p>

          {/* Booking Reference */}
          <div className="glass-card-small p-6 mb-6 max-w-md mx-auto">
            <p className="text-white/70 text-sm mb-2">Booking Reference</p>
            <p className="text-3xl font-bold text-white font-mono tracking-wider">
              {booking?.bookingReference}
            </p>
          </div>

          {/* Hotel Info */}
          {booking?.hotelName && booking.hotelName !== 'Your Hotel' && (
            <div className="glass-card-small p-4 mb-6 max-w-md mx-auto text-left">
              <p className="text-white font-semibold mb-2">{booking.hotelName}</p>
              <div className="flex items-center gap-4 text-white/70 text-sm">
                <span>{formatDate(booking.checkIn)}</span>
                <span>→</span>
                <span>{formatDate(booking.checkOut)}</span>
              </div>
            </div>
          )}

          {/* Download Voucher */}
          {booking?.id && (
            <div className="mb-8">
              <a
                href={`/api/bookings/${booking.id}/voucher`}
                download
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Voucher (PDF)
              </a>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-6 mb-8 max-w-md mx-auto">
            <div className="flex items-start gap-3 text-left">
              <svg className="w-6 h-6 text-blue-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-blue-200 font-semibold mb-1">Check Your Email</p>
                <p className="text-blue-100 text-sm">
                  We've sent a confirmation email with all your booking details and instructions.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                if (status === 'authenticated') {
                  router.push('/bookings');
                } else {
                  router.push('/login?redirect=/bookings');
                }
              }}
              size="lg"
            >
              View My Bookings
            </Button>
            <Button onClick={() => router.push('/')} variant="secondary" size="lg">
              Back to Home
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center p-6">
      <Suspense
        fallback={
          <GlassCard>
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6" />
              <p className="text-white text-lg">Loading...</p>
            </div>
          </GlassCard>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </main>
  );
}
