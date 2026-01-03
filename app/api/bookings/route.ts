import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch user's bookings
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // DEBUG: Log session info
    console.log('🔍 BOOKINGS DEBUG:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });

    if (!session?.user?.id) {
      console.log('❌ BOOKINGS: No user ID in session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, upcoming, past

    const now = new Date();
    let whereClause: any = { userId: session.user.id };

    // DEBUG: Also fetch ALL bookings to compare
    const allBookings = await prisma.booking.findMany({
      select: { id: true, userId: true, guestEmail: true, bookingReference: true },
      take: 10,
    });
    console.log('🔍 ALL BOOKINGS IN DB:', allBookings);
    console.log('🔍 LOOKING FOR userId:', session.user.id);

    if (filter === 'upcoming') {
      whereClause.checkIn = { gte: now };
    } else if (filter === 'past') {
      whereClause.checkOut = { lt: now };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('🔍 MATCHED BOOKINGS:', bookings.length);

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

