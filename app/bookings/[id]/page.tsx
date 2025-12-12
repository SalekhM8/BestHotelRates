import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

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

  return (
    <main className="relative min-h-screen pb-24 pt-28 px-4 md:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60 mb-1">Booking Reference</p>
            <h1 className="text-3xl font-bold text-white">
              {booking.bookingReference}
            </h1>
            <p className="text-white/70 mt-1">
              {booking.hotelName} — {booking.hotelLocation}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-sm mb-1">Total</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(booking.totalAmount)}
            </p>
            <p className="text-xs text-white/60 mt-1 uppercase tracking-wide">
              {booking.status}
            </p>
          </div>
        </div>

        <GlassCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm mb-1">Check-in</p>
              <p className="text-white text-lg font-semibold">
                {formatDate(booking.checkIn)}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Check-out</p>
              <p className="text-white text-lg font-semibold">
                {formatDate(booking.checkOut)}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Room</p>
              <p className="text-white text-lg font-semibold">
                {primaryRoom?.roomTypeName ?? booking.roomType}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Rate plan</p>
              <p className="text-white text-lg font-semibold">
                {primaryRoom?.ratePlanName ?? 'Selected rate'}
              </p>
            </div>
          </div>
        </GlassCard>

        {addOns.length > 0 && (
          <GlassCard>
            <h3 className="text-white font-semibold mb-3">Add-ons</h3>
            <ul className="space-y-2 text-white/80 text-sm">
              {addOns.map((item) => (
                <li key={item.id} className="flex items-center justify-between">
                  <span>{item.addOn?.name ?? 'Add-on'}</span>
                  <span>{item.addOn ? formatCurrency(item.addOn.price) : '—'}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        )}

        <GlassCard>
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="space-y-1 text-white/70 text-sm">
              <p className="font-semibold text-white">Manage booking</p>
              <p>Modify, add services, or cancel (coming soon).</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" disabled>
                Add services (coming soon)
              </Button>
              <Button variant="secondary" disabled>
                Modify dates (coming soon)
              </Button>
              <Button variant="secondary" disabled>
                Cancel booking (coming soon)
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}

