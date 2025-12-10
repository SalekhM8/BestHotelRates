import { NextResponse } from 'next/server';
import { searchInventory } from '@/lib/hotels-data';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    const { allowed } = await enforceRateLimit(`search:${ip}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const {
      destination,
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      limit,
    } = body;

    const hotels = await searchInventory({
      destination,
      checkIn: checkIn ? new Date(checkIn) : undefined,
      checkOut: checkOut ? new Date(checkOut) : undefined,
      adults,
      children,
      rooms,
      minPrice,
      maxPrice,
      minRating,
      sortBy,
      limit,
    });

    return NextResponse.json({ hotels, count: hotels.length });
  } catch (error) {
    console.error('Hotel search error:', error);
    return NextResponse.json(
      { error: 'Failed to search hotels', hotels: [], count: 0 },
      { status: 500 },
    );
  }
}

