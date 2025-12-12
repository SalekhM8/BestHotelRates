'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookingSelectionPayload } from '@/lib/hotels-data';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const guestInfoSchema = z.object({
  guestName: z.string().min(2, 'Name is required'),
  guestEmail: z.string().email('Valid email is required'),
  guestPhone: z.string().min(10, 'Valid phone number is required'),
  specialRequests: z.string().optional(),
});

type GuestInfoForm = z.infer<typeof guestInfoSchema>;

type Props = {
  initialSelection: BookingSelectionPayload;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

export function BookingFlowClient({ initialSelection, user }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<'guest-info' | 'summary' | 'prebook' | 'payment'>('guest-info');
  const [bookingData, setBookingData] = useState<GuestInfoForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [prebookResult, setPrebookResult] = useState<{
    success: boolean;
    confirmedPrice?: number;
    priceChanged?: boolean;
    error?: string;
  } | null>(null);

  const form = useForm<GuestInfoForm>({
    resolver: zodResolver(guestInfoSchema),
    defaultValues: {
      guestName: user?.name || '',
      guestEmail: user?.email || '',
      guestPhone: '',
      specialRequests: '',
    },
  });

  const onSubmit = (data: GuestInfoForm) => {
    setBookingData(data);
    setStep('summary');
  };

  // Prebook step - validates rate availability before payment
  const handlePrebook = async () => {
    if (!user) {
      const proceed = window.confirm('Continue as guest? Your booking will not be saved to an account.');
      if (!proceed) return;
    }

    if (!bookingData) return;
    setStep('prebook');
    setLoading(true);
    setPrebookResult(null);

    try {
      const response = await fetch('/api/prebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierCode: initialSelection.hotel.supplierCode || 'LOCAL',
          ratePlanId: initialSelection.ratePlan.id,
          bookHash: initialSelection.ratePlan.id, // For RateHawk, this is the book_hash
          rateKey: initialSelection.ratePlan.id, // For HotelBeds, this is the rateKey
          totalAmount: initialSelection.pricing.total,
          currency: initialSelection.ratePlan.currency,
        }),
      });

      const result = await response.json();
      setPrebookResult(result);

      if (result.success) {
        // Rate confirmed, proceed to payment
        await handleProceedToPayment(result.confirmedPrice || initialSelection.pricing.total);
      } else {
        // Rate not available or price changed
        setLoading(false);
      }
    } catch (error) {
      console.error('Prebook error:', error);
      setPrebookResult({
        success: false,
        error: 'Failed to verify rate availability. Please try again.',
      });
      setLoading(false);
    }
  };

  const handleProceedToPayment = async (confirmedTotal?: number) => {
    if (!bookingData) return;
    setStep('payment');
    setLoading(true);

    const totalToCharge = confirmedTotal || initialSelection.pricing.total;

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: initialSelection.hotel.id,
          hotelName: initialSelection.hotel.name,
          hotelLocation: initialSelection.hotel.location,
          hotelImage: initialSelection.hotel.heroImage,
          roomType: initialSelection.roomType.name,
          ratePlanId: initialSelection.ratePlan.id,
          checkIn: initialSelection.dates.checkIn,
          checkOut: initialSelection.dates.checkOut,
          adults: initialSelection.guests.adults,
          children: initialSelection.guests.children,
          rooms: initialSelection.guests.rooms,
          guestName: bookingData.guestName,
          guestEmail: bookingData.guestEmail,
          guestPhone: bookingData.guestPhone,
          specialRequests: bookingData.specialRequests,
          roomRate: initialSelection.pricing.subtotal,
          taxes: initialSelection.pricing.taxes + initialSelection.pricing.fees,
          totalAmount: totalToCharge,
          currency: initialSelection.ratePlan.currency,
          addOns: initialSelection.addOns.selected,
          supplierCode: initialSelection.hotel.supplierCode,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Payment setup failed. Please try again.');
        setStep('summary');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment setup failed. Please try again.');
      setStep('summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pb-24 space-y-10">
      <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-2xl">
        Complete Your Booking
      </h1>

      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-4">
          <StepBadge label="Guest Info" index={1} active={step === 'guest-info'} />
          <div className="w-12 h-0.5 bg-white/20" />
          <StepBadge label="Summary" index={2} active={step === 'summary'} />
          <div className="w-12 h-0.5 bg-white/20" />
          <StepBadge label="Confirm" index={3} active={step === 'prebook'} />
          <div className="w-12 h-0.5 bg-white/20" />
          <StepBadge label="Payment" index={4} active={step === 'payment'} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {step === 'guest-info' && (
            <GlassCard>
              <h2 className="text-2xl font-bold text-white mb-6">Guest Information</h2>
              {!user && (
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-sm text-blue-100">
                  You are booking as a guest.{' '}
                  <button
                    onClick={() => router.push('/login')}
                    className="underline hover:text-white"
                  >
                    Login
                  </button>{' '}
                  to sync bookings and earn loyalty perks.
                </div>
              )}
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  {...form.register('guestName')}
                  error={form.formState.errors.guestName?.message}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  {...form.register('guestEmail')}
                  error={form.formState.errors.guestEmail?.message}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+44 7700 900000"
                  {...form.register('guestPhone')}
                  error={form.formState.errors.guestPhone?.message}
                />
                <div>
                  <label className="block text-xs font-semibold text-white uppercase tracking-wide mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    {...form.register('specialRequests')}
                    placeholder="Any special requirements..."
                    className="glass-input w-full px-4 py-3 min-h-[120px] resize-none"
                  />
                </div>
                <Button type="submit" fullWidth size="lg">
                  Continue to Summary
                </Button>
              </form>
            </GlassCard>
          )}

          {step === 'summary' && bookingData && (
            <GlassCard>
              <h2 className="text-2xl font-bold text-white mb-6">Booking Summary</h2>
              <div className="space-y-4 mb-6">
                <SummaryRow label="Guest Name" value={bookingData.guestName} />
                <SummaryRow label="Email" value={bookingData.guestEmail} />
                <SummaryRow label="Phone" value={bookingData.guestPhone} />
                {bookingData.specialRequests && (
                  <SummaryRow label="Special Requests" value={bookingData.specialRequests} />
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep('guest-info')} fullWidth>
                  Back
                </Button>
                <Button onClick={handlePrebook} fullWidth loading={loading}>
                  Confirm & Pay
                </Button>
              </div>
            </GlassCard>
          )}

          {step === 'prebook' && (
            <GlassCard className="py-12">
              {loading && !prebookResult && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Verifying Availability</h2>
                  <p className="text-white/70">Confirming your rate with the hotel...</p>
                </div>
              )}

              {prebookResult && !prebookResult.success && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Rate Unavailable</h2>
                  <p className="text-white/70 mb-6">
                    {prebookResult.error || 'This rate is no longer available. Please select another option.'}
                  </p>
                  {prebookResult.priceChanged && prebookResult.confirmedPrice && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
                      <p className="text-yellow-200">
                        New price: {formatCurrency(initialSelection.ratePlan.currency, prebookResult.confirmedPrice)}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3 justify-center">
                    <Button variant="secondary" onClick={() => router.back()}>
                      Choose Another Room
                    </Button>
                    <Button onClick={() => setStep('summary')}>
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </GlassCard>
          )}

          {step === 'payment' && (
            <GlassCard className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Redirecting to payment...</h2>
              <p className="text-white/70">Please wait while we secure your booking.</p>
            </GlassCard>
          )}
        </div>

        {/* Booking Details */}
        <div className="lg:col-span-1">
          <GlassCard className="sticky top-24 space-y-5">
            <div>
              <p className="text-xs uppercase text-white/60 tracking-[0.4em] mb-1">Hotel</p>
              <h3 className="text-xl font-bold text-white">{initialSelection.hotel.name}</h3>
              <p className="text-white/70 text-sm">{initialSelection.hotel.location}</p>
              <button
                className="text-sm text-blue-100 underline mt-1"
                onClick={() => router.back()}
                type="button"
              >
                Modify selection
              </button>
            </div>

            <div className="border border-white/10 rounded-2xl p-4 space-y-2 text-sm text-white/80">
              <div className="flex justify-between">
                <span>Room Type</span>
                <span>{initialSelection.roomType.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Package</span>
                <span>{initialSelection.ratePlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-in</span>
                <span>{formatDate(initialSelection.dates.checkIn)}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-out</span>
                <span>{formatDate(initialSelection.dates.checkOut)}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests</span>
                <span>
                  {initialSelection.guests.adults} adults · {initialSelection.guests.children} children
                </span>
              </div>
            </div>

            {initialSelection.addOns.selected.length > 0 && (
              <div>
                <p className="text-xs uppercase text-white/60 tracking-[0.4em] mb-2">Add-ons</p>
                <div className="space-y-2 text-sm text-white/80">
                  {initialSelection.addOns.selected.map((addOn) => (
                    <div key={addOn.id} className="flex justify-between">
                      <span>{addOn.name}</span>
                      <span>
                        {formatCurrency(initialSelection.ratePlan.currency, addOn.price)} ×{' '}
                        {addOn.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border border-white/10 rounded-2xl p-4 space-y-2 text-sm text-white/80">
              <div className="flex justify-between">
                <span>
                  {initialSelection.dates.nights} night{initialSelection.dates.nights > 1 ? 's' : ''}{' '}
                  × {initialSelection.guests.rooms} room{initialSelection.guests.rooms > 1 ? 's' : ''}
                </span>
                <span>
                  {formatCurrency(initialSelection.ratePlan.currency, initialSelection.pricing.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span>
                  {formatCurrency(
                    initialSelection.ratePlan.currency,
                    initialSelection.pricing.taxes + initialSelection.pricing.fees,
                  )}
                </span>
              </div>
              {initialSelection.pricing.addOns > 0 && (
                <div className="flex justify-between">
                  <span>Add-ons</span>
                  <span>
                    {formatCurrency(initialSelection.ratePlan.currency, initialSelection.pricing.addOns)}
                  </span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between text-white text-xl font-bold">
                <span>Total</span>
                <span>
                  {formatCurrency(initialSelection.ratePlan.currency, initialSelection.pricing.total)}
                </span>
              </div>
            </div>

            {/* Cancellation Policy */}
            {initialSelection.ratePlan.isRefundable && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-2 text-green-400 font-semibold mb-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Free Cancellation
                </div>
                <p className="text-sm text-green-200/70">
                  Cancel for free until {initialSelection.ratePlan.cancellationDeadline || '48 hours before check-in'}
                </p>
              </div>
            )}

            {!initialSelection.ratePlan.isRefundable && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Non-Refundable
                </div>
                <p className="text-sm text-yellow-200/70">
                  This rate cannot be cancelled or modified
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

const StepBadge = ({ label, index, active }: { label: string; index: number; active: boolean }) => (
  <div className={`flex items-center gap-2 ${active ? 'text-white' : 'text-white/50'}`}>
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center ${
        active ? 'bg-white/30' : 'bg-white/10'
      }`}
    >
      {index}
    </div>
    <span className="hidden md:inline font-semibold">{label}</span>
  </div>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-white/60 text-sm">{label}</p>
    <p className="text-white font-medium">{value}</p>
  </div>
);

const formatCurrency = (currency: string, amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );
