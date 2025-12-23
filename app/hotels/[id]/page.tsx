import { notFound } from 'next/navigation';
import { getHotelDetails } from '@/lib/hotels-data';
import { HotelDetailsClient } from '@/components/hotel/HotelDetailsClient';
import { BackToSearchButton } from '@/components/navigation/BackToSearchButton';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function HotelDetailsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const hotel = await getHotelDetails(id);

  if (!hotel) {
    notFound();
  }

  // Extract search context from URL params
  const initialCheckIn = resolvedSearchParams.checkIn;
  const initialCheckOut = resolvedSearchParams.checkOut;
  const initialGuests = resolvedSearchParams.guests ? parseInt(resolvedSearchParams.guests, 10) : undefined;
  const initialRooms = resolvedSearchParams.rooms ? parseInt(resolvedSearchParams.rooms, 10) : undefined;

  return (
    <main className="relative min-h-screen pb-32 md:pb-24 pt-24">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <BackToSearchButton />
          <div className="text-white/70 text-sm">
            Powered by {hotel.supplierCode ?? 'Best Hotel Rates'} inventory
          </div>
        </div>

        <HotelDetailsClient 
          hotel={hotel}
          initialCheckIn={initialCheckIn}
          initialCheckOut={initialCheckOut}
          initialGuests={initialGuests}
          initialRooms={initialRooms}
        />
      </div>
    </main>
  );
}

