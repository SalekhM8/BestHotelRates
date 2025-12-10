import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getHotelDetails } from '@/lib/hotels-data';
import { HotelDetailsClient } from '@/components/hotel/HotelDetailsClient';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function HotelDetailsPage({ params }: Props) {
  const { id } = await params;
  const hotel = await getHotelDetails(id);

  if (!hotel) {
    notFound();
  }

  return (
    <main className="relative min-h-screen pb-32 md:pb-24 pt-24">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/search"
            className="glass-card-small px-4 py-2.5 text-white font-semibold inline-flex items-center gap-2 text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to search
          </Link>
          <div className="text-white/70 text-sm">
            Powered by {hotel.supplierCode ?? 'Best Hotel Rates'} inventory
          </div>
        </div>

        <HotelDetailsClient hotel={hotel} />
      </div>
    </main>
  );
}

