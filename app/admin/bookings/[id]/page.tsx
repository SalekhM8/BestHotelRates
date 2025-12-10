'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingDetail();
  }, []);

  const fetchBookingDetail = async () => {
    try {
      const response = await fetch(`/api/admin/bookings/${params.id}`);
      
      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      const data = await response.json();
      setBooking(data.booking);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching booking:', error);
      setLoading(false);
    }
  };

  const runAction = async (action: string, body: Record<string, unknown> = {}) => {
    try {
      setActionLoading(true);
      setActionMessage(null);
      const response = await fetch(`/api/admin/bookings/${params.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      });

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply action');
      }

      setBooking(data.booking);
      setActionMessage('Action completed successfully.');
      setNote('');
    } catch (error: any) {
      console.error('Action error:', error);
      setActionMessage(error?.message || 'Failed to run action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = () => {
    const input = prompt(
      'Enter refund amount (leave empty for full amount):',
      booking?.totalAmount?.toString() ?? '0',
    );
    if (input === null) return;
    const amount = Number(input);
    runAction('ISSUE_REFUND', { refundAmount: Number.isFinite(amount) ? amount : booking.totalAmount });
  };

  if (loading || !booking) {
    return (
      <main className="relative min-h-screen pb-24 pt-24">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-white text-center">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen pb-24 pt-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="glass-card-small px-4 py-2 text-white font-semibold inline-flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Bookings
          </button>
          <p className="text-white/60 text-sm font-mono">{booking.bookingReference}</p>
        </div>

        <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-2xl">
          Booking Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard>
              <h2 className="text-2xl font-bold text-white mb-4">Booking Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Reference" value={booking.bookingReference} mono />
                <InfoItem label="Status" value={booking.status} badge />
                <InfoItem label="Payment Status" value={booking.paymentStatus} badge />
                <InfoItem label="Booking Date" value={formatDate(booking.createdAt)} />
                <InfoItem
                  label="Stripe Session"
                  value={booking.stripeSessionId || '—'}
                  mono
                />
                <InfoItem
                  label="Stripe Payment"
                  value={booking.stripePaymentId || '—'}
                  mono
                />
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-2xl font-bold text-white mb-4">Guest Information</h2>
              <div className="space-y-3">
                <InfoItem label="Name" value={booking.guestName} />
                <InfoItem label="Email" value={booking.guestEmail} />
                <InfoItem label="Phone" value={booking.guestPhone} />
                {booking.specialRequests && (
                  <InfoItem label="Special Requests" value={booking.specialRequests} />
                )}
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-2xl font-bold text-white mb-4">Hotel Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-white/60 text-sm mb-1">Hotel Name</p>
                  <p className="text-white font-medium">{booking.hotelName}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Location</p>
                  <p className="text-white">{booking.hotelLocation}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-sm mb-1">Check-in</p>
                    <p className="text-white font-medium">{formatDate(booking.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Check-out</p>
                    <p className="text-white font-medium">{formatDate(booking.checkOut)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Room Type</p>
                  <p className="text-white">{booking.roomType}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-white/60 text-sm mb-1">Rooms</p>
                    <p className="text-white">{booking.numberOfRooms}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Adults</p>
                    <p className="text-white">{booking.adults}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Children</p>
                    <p className="text-white">{booking.children}</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-2xl font-bold text-white mb-4">Line Items</h2>
              {booking.rooms?.length ? (
                <div className="space-y-4">
                  {booking.rooms.map((room: any) => (
                    <div key={room.id} className="border border-white/10 rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase text-white/60 tracking-[0.4em] mb-1">
                            {room.ratePlan?.boardType || 'Room'}
                          </p>
                          <p className="text-white font-semibold">{room.ratePlanName}</p>
                          <p className="text-white/60 text-sm">{room.roomTypeName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-lg font-bold">{formatCurrency(room.totalAmount)}</p>
                          <p className="text-white/60 text-xs">
                            {room.nights} nights · {room.roomsRequested} room(s)
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-white/70">
                        <InfoItem label="Adults" value={room.occupancyAdults} />
                        <InfoItem label="Children" value={room.occupancyChildren} />
                        <InfoItem label="Check-in" value={formatDate(room.checkIn)} />
                        <InfoItem label="Check-out" value={formatDate(room.checkOut)} />
                      </div>
                      {room.addOns?.length ? (
                        <div className="mt-3">
                          <p className="text-white/60 text-xs uppercase tracking-[0.4em] mb-2">
                            Add-ons
                          </p>
                          <ul className="space-y-1">
                            {room.addOns.map((addon: any) => (
                              <li key={addon.id} className="flex items-center justify-between text-sm text-white/80">
                                <span>{addon.name}</span>
                                <span>{formatCurrency(addon.price)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/70 text-sm">No room line items recorded.</p>
              )}
            </GlassCard>

            <GlassCard>
              <h2 className="text-2xl font-bold text-white mb-4">Activity Log</h2>
              {booking.activities?.length ? (
                <ul className="space-y-3">
                  {booking.activities.map((activity: any) => (
                    <li key={activity.id} className="border border-white/10 rounded-2xl p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium">{activity.message}</p>
                        <span className="text-white/50 text-xs">{formatDateTime(activity.createdAt)}</span>
                      </div>
                      <p className="text-white/50 text-xs">
                        {activity.actor ?? 'System'} · {activity.type.replace('_', ' ')}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white/60 text-sm">No activity recorded yet.</p>
              )}

              <div className="mt-4">
                <label className="text-white/60 text-xs uppercase tracking-[0.4em] mb-2 block">
                  Add admin note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Internal notes visible to admins only..."
                  className="glass-input w-full px-3 py-2 min-h-[90px]"
                />
                <Button
                  onClick={() => runAction('ADD_NOTE', { note })}
                  disabled={!note.trim() || actionLoading}
                  className="mt-3"
                >
                  Save Note
                </Button>
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard>
              <h3 className="text-xl font-bold text-white mb-4">Payment Summary</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-white/80">
                  <span>Room Rate</span>
                  <span>{formatCurrency(booking.roomRate)}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Taxes</span>
                  <span>{formatCurrency(booking.taxes)}</span>
                </div>
                <hr className="border-white/20" />
                <div className="flex justify-between text-white text-xl font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(booking.totalAmount)}</span>
                </div>
              </div>
              <div className="text-white/60 text-sm">
                Currency: {booking.currency}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => runAction('CONFIRM')}
                  fullWidth
                  disabled={booking.status === 'CONFIRMED' || actionLoading}
                >
                  Mark Confirmed
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  disabled={booking.status === 'CANCELLED' || actionLoading}
                  onClick={() => runAction('CANCEL')}
                >
                  Cancel Booking
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  disabled={booking.status === 'COMPLETED' || actionLoading}
                  onClick={() => runAction('MARK_COMPLETED')}
                >
                  Mark Completed
                </Button>
                <Button variant="secondary" fullWidth onClick={handleRefund} disabled={actionLoading}>
                  Issue Refund (stub)
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => runAction('RESEND_EMAIL')}
                  disabled={actionLoading}
                >
                  Resend Email
                </Button>
                {actionMessage && (
                  <p className="text-white/60 text-xs text-center">{actionMessage}</p>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}

const InfoItem = ({
  label,
  value,
  mono,
  badge,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  badge?: boolean;
}) => (
  <div>
    <p className="text-white/60 text-xs uppercase tracking-[0.3em] mb-1">{label}</p>
    {badge ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/15 border border-white/20 text-white">
        {value}
      </span>
    ) : (
      <p className={`text-white ${mono ? 'font-mono text-sm' : 'font-medium'}`}>{value || '—'}</p>
    )}
  </div>
);

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

