import { NextResponse } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth';
import { getAdminBookingById } from '@/lib/admin-bookings';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();

    const booking = await getAdminBookingById(params.id);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin booking detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

