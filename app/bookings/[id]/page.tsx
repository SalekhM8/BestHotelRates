import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { CancelBookingButton } from '@/components/booking/CancelBookingButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login?redirect=/bookings');
  }

  const booking = await prisma.booking.findFirst({
    where: { id, userId: session.user.id },
    include: {
      rooms: {
        include: {
          addOns: {
            include: {
              addOn: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    redirect('/bookings');
  }

  const primaryRoom = booking.rooms[0];
  const addOns = booking.rooms.flatMap((r) => r.addOns);
  const isCancelled = booking.status === 'CANCELLED';
  const isCompleted = booking.status === 'COMPLETED';
  const canModify = !isCancelled && !isCompleted;

  // Status badge styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <main className="relative min-h-screen pb-24 pt-28 px-4 md:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Link */}
        <Link 
          href="/bookings" 
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Bookings
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-sm text-white/60">Booking Reference</p>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusStyle(booking.status)}`}>
                {booking.status}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              {booking.bookingReference}
            </h1>
            <p className="text-white/70 mt-1">
              {booking.hotelName}
            </p>
            <p className="text-white/50 text-sm">
              {booking.hotelLocation}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-white/60 text-sm mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(booking.totalAmount)}
            </p>
            {booking.refundAmount && booking.refundAmount > 0 && (
              <p className="text-green-400 text-sm mt-1">
                Refunded: {formatCurrency(booking.refundAmount)}
              </p>
            )}
          </div>
        </div>

        {/* Cancelled Banner */}
        {isCancelled && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div>
                <p className="text-red-400 font-semibold">Booking Cancelled</p>
                {booking.cancelledAt && (
                  <p className="text-red-300/70 text-sm">
                    Cancelled on {formatDate(booking.cancelledAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stay Details */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Stay Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm mb-1">Check-in</p>
              <p className="text-white text-lg font-semibold">
                {formatDate(booking.checkIn)}
              </p>
              <p className="text-white/50 text-sm">From 3:00 PM</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Check-out</p>
              <p className="text-white text-lg font-semibold">
                {formatDate(booking.checkOut)}
              </p>
              <p className="text-white/50 text-sm">Until 11:00 AM</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Room Type</p>
              <p className="text-white text-lg font-semibold">
                {primaryRoom?.roomTypeName ?? booking.roomType}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Rate Plan</p>
              <p className="text-white text-lg font-semibold">
                {primaryRoom?.ratePlanName ?? 'Selected rate'}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Guests</p>
              <p className="text-white text-lg font-semibold">
                {booking.adults} adult{booking.adults > 1 ? 's' : ''}
                {booking.children > 0 && `, ${booking.children} child${booking.children > 1 ? 'ren' : ''}`}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Rooms</p>
              <p className="text-white text-lg font-semibold">
                {booking.numberOfRooms} room{booking.numberOfRooms > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Guest Info */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Guest Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm mb-1">Name</p>
              <p className="text-white font-medium">{booking.guestName}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Email</p>
              <p className="text-white font-medium">{booking.guestEmail}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Phone</p>
              <p className="text-white font-medium">{booking.guestPhone}</p>
            </div>
            {booking.specialRequests && (
              <div className="md:col-span-2">
                <p className="text-white/60 text-sm mb-1">Special Requests</p>
                <p className="text-white font-medium">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Add-ons */}
        {addOns.length > 0 && (
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Add-ons</h3>
            <ul className="space-y-3">
              {addOns.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">{item.addOn?.name ?? item.name}</span>
                  <span className="text-white font-medium">
                    {formatCurrency(item.price)} × {item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </GlassCard>
        )}

        {/* Price Breakdown */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-white mb-4">Price Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-white/70">
              <span>Room rate</span>
              <span>{formatCurrency(booking.roomRate)}</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Taxes & fees</span>
              <span>{formatCurrency(booking.taxes)}</span>
            </div>
            {addOns.length > 0 && (
              <div className="flex justify-between text-white/70">
                <span>Add-ons</span>
                <span>{formatCurrency(addOns.reduce((sum, a) => sum + (a.price * a.quantity), 0))}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-2 mt-2 flex justify-between text-white font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>
        </GlassCard>

        {/* Download Voucher */}
        {!isCancelled && (
          <GlassCard>
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-white mb-1">Booking Voucher</p>
                <p className="text-white/70 text-sm">Download your voucher to present at check-in.</p>
              </div>
              <a 
                href={`/api/bookings/${booking.id}/voucher`}
                download
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF Voucher
              </a>
            </div>
          </GlassCard>
        )}

        {/* Cancellation Policy */}
        {booking.isFreeCancellation && !isCancelled && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-green-400 font-semibold mb-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Free Cancellation
            </div>
            <p className="text-green-200/70 text-sm">
              Cancel for free up to 24 hours before check-in
            </p>
          </div>
        )}

        {/* Actions */}
        {canModify && (
          <GlassCard>
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="space-y-1 text-white/70 text-sm">
                <p className="font-semibold text-white">Manage Booking</p>
                <p>Need to make changes? You can cancel your booking below.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" disabled>
                  Modify dates
                </Button>
                <CancelBookingButton 
                  bookingId={booking.id}
                  bookingReference={booking.bookingReference}
                  hotelName={booking.hotelName}
                />
              </div>
            </div>
          </GlassCard>
        )}

        {/* Support */}
        <GlassCard>
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-white mb-1">Need Help?</p>
              <p className="text-white/70 text-sm">Contact our support team for assistance with your booking.</p>
            </div>
            <Link href="/help">
              <Button variant="secondary">
                Contact Support
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
