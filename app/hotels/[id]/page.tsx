import { notFound } from 'next/navigation';
import { getHotelDetails } from '@/lib/hotels-data';
import { HotelDetailsClient } from '@/components/hotel/HotelDetailsClient';
import { BackToSearchButton } from '@/components/navigation/BackToSearchButton';

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
          <BackToSearchButton />
          <div className="text-white/70 text-sm">
            Powered by {hotel.supplierCode ?? 'Best Hotel Rates'} inventory
          </div>
        </div>

        <HotelDetailsClient hotel={hotel} />
      </div>
    </main>
  );
}

