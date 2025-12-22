'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

type CancellationInfo = {
  canCancel: boolean;
  reason?: string;
  refundAmount?: number;
  hoursUntilCheckIn?: number;
  isFreeCancellation?: boolean;
  totalAmount?: number;
};

type Props = {
  bookingId: string;
  bookingReference: string;
  hotelName: string;
};

export function CancelBookingButton({ bookingId, bookingReference, hotelName }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cancellationInfo, setCancellationInfo] = useState<CancellationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check cancellation eligibility when modal opens
  useEffect(() => {
    if (isOpen && !cancellationInfo) {
      checkCancellation();
    }
  }, [isOpen]);

  const checkCancellation = async () => {
    setChecking(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`);
      const data = await res.json();
      if (res.ok) {
        setCancellationInfo(data);
      } else {
        setError(data.error || 'Failed to check cancellation eligibility');
      }
    } catch (err) {
      setError('Failed to check cancellation eligibility');
    } finally {
      setChecking(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          router.refresh();
        }, 2000);
      } else {
        setError(data.error || 'Failed to cancel booking');
      }
    } catch (err) {
      setError('Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  return (
    <>
      <Button 
        variant="secondary" 
        onClick={() => setIsOpen(true)}
        className="text-red-400 border-red-400/30 hover:bg-red-500/10"
      >
        Cancel Booking
      </Button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !loading && setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-slate-900 border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {success ? (
              // Success State
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Booking Cancelled</h3>
                <p className="text-white/70">
                  {cancellationInfo?.refundAmount && cancellationInfo.refundAmount > 0
                    ? `A refund of ${formatCurrency(cancellationInfo.refundAmount)} will be processed.`
                    : 'Your booking has been cancelled.'}
                </p>
              </div>
            ) : checking ? (
              // Loading State
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-4" />
                <p className="text-white/70">Checking cancellation policy...</p>
              </div>
            ) : (
              // Confirmation State
              <>
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Cancel Booking?</h3>
                    <p className="text-white/70 text-sm">
                      {bookingReference} · {hotelName}
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {cancellationInfo && (
                  <div className="mb-6 space-y-3">
                    {/* Refund Info */}
                    <div className="p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70">Booking Total</span>
                        <span className="text-white font-medium">
                          {formatCurrency(cancellationInfo.totalAmount || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Refund Amount</span>
                        <span className={`font-bold ${cancellationInfo.refundAmount && cancellationInfo.refundAmount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {cancellationInfo.refundAmount && cancellationInfo.refundAmount > 0
                            ? formatCurrency(cancellationInfo.refundAmount)
                            : 'No refund'}
                        </span>
                      </div>
                    </div>

                    {/* Policy Message */}
                    {cancellationInfo.reason && (
                      <div className={`p-3 rounded-lg text-sm ${
                        cancellationInfo.refundAmount === cancellationInfo.totalAmount
                          ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                          : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-300'
                      }`}>
                        {cancellationInfo.reason}
                      </div>
                    )}

                    {/* Hours until check-in */}
                    {cancellationInfo.hoursUntilCheckIn !== undefined && (
                      <p className="text-white/50 text-xs text-center">
                        {cancellationInfo.hoursUntilCheckIn} hours until check-in
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                    fullWidth
                  >
                    Keep Booking
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    loading={loading}
                    disabled={!cancellationInfo?.canCancel}
                    fullWidth
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {loading ? 'Cancelling...' : 'Yes, Cancel'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

