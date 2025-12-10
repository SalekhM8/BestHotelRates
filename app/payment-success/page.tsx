'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [bookingRef, setBookingRef] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // In a real app, you'd verify the session and get booking details
      // For now, simulate success
      setTimeout(() => {
        setLoading(false);
        setBookingRef('BHR-' + Math.random().toString(36).substr(2, 8).toUpperCase());
      }, 1500);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const content = () => {
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
            <div className="glass-card-small p-6 mb-8 max-w-md mx-auto">
              <p className="text-white/70 text-sm mb-2">Booking Reference</p>
              <p className="text-3xl font-bold text-white font-mono tracking-wider">
                {bookingRef}
              </p>
            </div>

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
  };

  return content();
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



