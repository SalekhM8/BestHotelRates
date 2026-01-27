import { notFound } from 'next/navigation';
import { getHotelDetails } from '@/lib/hotels-data';
import { HotelDetailsClient } from '@/components/hotel/HotelDetailsClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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

  const initialCheckIn = resolvedSearchParams.checkIn;
  const initialCheckOut = resolvedSearchParams.checkOut;
  const initialAdults = resolvedSearchParams.adults ? parseInt(resolvedSearchParams.adults, 10) : undefined;
  const initialChildren = resolvedSearchParams.children ? parseInt(resolvedSearchParams.children, 10) : undefined;
  const initialRooms = resolvedSearchParams.rooms ? parseInt(resolvedSearchParams.rooms, 10) : undefined;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <Link href="#">United Kingdom</Link>
            <span>›</span>
            <Link href={`/search?destination=${hotel.location}`}>{hotel.location}</Link>
            <span>›</span>
            <span className="text-gray-500">{hotel.name}</span>
          </nav>
        </div>
      </div>

      <HotelDetailsClient 
        hotel={hotel}
        initialCheckIn={initialCheckIn}
        initialCheckOut={initialCheckOut}
        initialAdults={initialAdults}
        initialChildren={initialChildren}
        initialRooms={initialRooms}
      />
    </div>
  );
}
