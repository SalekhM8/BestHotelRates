'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

export default function PaymentCancelledPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <GlassCard>
          <div className="text-center py-12">
            {/* Cancelled Icon */}
            <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-yellow-400/50">
              <svg className="w-12 h-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Payment Cancelled
            </h1>
            
            <p className="text-xl text-white/90 mb-8">
              Your booking was not completed
            </p>

            {/* Info */}
            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-2xl p-6 mb-8 max-w-md mx-auto">
              <p className="text-yellow-100 text-sm">
                No charges were made to your card. Your booking has not been confirmed.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.back()} size="lg">
                Try Again
              </Button>
              <Button onClick={() => router.push('/')} variant="secondary" size="lg">
                Back to Home
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}



