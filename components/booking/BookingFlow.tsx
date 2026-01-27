'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookingSelectionPayload } from '@/lib/hotels-data';
import Link from 'next/link';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<GuestInfoForm>({
    resolver: zodResolver(guestInfoSchema),
    defaultValues: {
      guestName: user?.name || '',
      guestEmail: user?.email || '',
      guestPhone: '',
      specialRequests: '',
    },
  });

  const onSubmit = async (data: GuestInfoForm) => {
    setLoading(true);
    setError(null);

    try {
      // Create Stripe checkout session
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
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          specialRequests: data.specialRequests,
          roomRate: initialSelection.pricing.subtotal,
          taxes: initialSelection.pricing.taxes + initialSelection.pricing.fees,
          totalAmount: initialSelection.pricing.total,
          currency: initialSelection.ratePlan.currency,
          addOns: initialSelection.addOns.selected,
          supplierCode: initialSelection.hotel.supplierCode,
        }),
      });

      const result = await response.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        setError('Payment setup failed. Please try again.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                {initialSelection.hotel.heroImage && (
                  <img
                    src={initialSelection.hotel.heroImage}
                    alt={initialSelection.hotel.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Hotel</p>
                <h2 className="font-bold text-gray-900 text-lg">{initialSelection.hotel.name}</h2>
                <p className="text-sm text-gray-600">{initialSelection.hotel.location}</p>
                <p className="text-sm text-green-600 mt-2">✓ Free cancellation · ✓ No prepayment needed</p>
              </div>
            </div>
          </div>

          {/* Your booking details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Your booking details</h3>
            
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Check-in</p>
                <p className="font-bold text-gray-900">{formatDate(initialSelection.dates.checkIn)}</p>
                <p className="text-sm text-gray-500">14:00 – 00:00</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Check-out</p>
                <p className="font-bold text-gray-900">{formatDate(initialSelection.dates.checkOut)}</p>
                <p className="text-sm text-gray-500">07:00 – 10:00</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500 mb-1">Total length of stay:</p>
              <p className="font-bold text-gray-900">{initialSelection.dates.nights} night{initialSelection.dates.nights > 1 ? 's' : ''}</p>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
              <p className="text-sm text-gray-500 mb-1">You selected</p>
              <p className="font-bold text-gray-900">{initialSelection.guests.rooms} room for {initialSelection.guests.adults} adults{initialSelection.guests.children > 0 ? ` and ${initialSelection.guests.children} children` : ''}</p>
              <button 
                onClick={() => router.back()} 
                className="text-sm text-[#5DADE2] hover:underline mt-1"
              >
                Change your selection
              </button>
            </div>
          </div>

          {/* Guest Information Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Enter your details</h3>
            
            {!user && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <Link href="/login" className="text-[#5DADE2] font-semibold hover:underline">Sign in</Link> to book faster and unlock Genius discounts!
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  {...form.register('guestName')}
                  className="input-field"
                  placeholder="First name and surname"
                />
                {form.formState.errors.guestName && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.guestName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  {...form.register('guestEmail')}
                  type="email"
                  className="input-field"
                  placeholder="email@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">Confirmation email goes to this address</p>
                {form.formState.errors.guestEmail && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.guestEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  {...form.register('guestPhone')}
                  type="tel"
                  className="input-field"
                  placeholder="+44 7700 900000"
                />
                <p className="text-xs text-gray-500 mt-1">Needed by the property to validate your booking</p>
                {form.formState.errors.guestPhone && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.guestPhone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special requests (optional)
                </label>
                <textarea
                  {...form.register('specialRequests')}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Special requests cannot be guaranteed – but the property will do its best to meet your needs."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#5DADE2] hover:bg-[#3498DB] text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Complete booking'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Your price summary</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Room × {initialSelection.dates.nights} nights</span>
                <span className="text-gray-900">{formatCurrency(initialSelection.ratePlan.currency, initialSelection.pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxes and fees</span>
                <span className="text-gray-900">{formatCurrency(initialSelection.ratePlan.currency, initialSelection.pricing.taxes + initialSelection.pricing.fees)}</span>
              </div>
              {initialSelection.pricing.addOns > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Add-ons</span>
                  <span className="text-gray-900">{formatCurrency(initialSelection.ratePlan.currency, initialSelection.pricing.addOns)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-gray-900 text-lg">Price</span>
                <div className="text-right">
                  <span className="font-bold text-2xl text-gray-900">{formatCurrency(initialSelection.ratePlan.currency, initialSelection.pricing.total)}</span>
                  <p className="text-xs text-gray-500">Includes taxes and charges</p>
                </div>
              </div>
            </div>

            {/* Price Match */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-700 font-medium">✓ We Price Match</p>
              <p className="text-xs text-green-600">Found it cheaper? We'll refund the difference</p>
            </div>

            {/* Cancellation info */}
            {initialSelection.ratePlan.isRefundable ? (
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-600">Free cancellation</p>
                <p className="text-xs text-gray-500">
                  Before {initialSelection.ratePlan.cancellationDeadline || '48 hours before check-in'}
                </p>
              </div>
            ) : (
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-700">Non-refundable rate</p>
                <p className="text-xs text-yellow-600">This booking cannot be cancelled</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const formatCurrency = (currency: string, amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );
