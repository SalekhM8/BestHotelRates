/**
 * Voucher PDF Generation API
 * 
 * Generates a downloadable PDF voucher for a booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { BookingVoucherPDF } from '@/components/pdf/BookingVoucherPDF';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Check for admin auth via cookie if no user session
    const isAdmin = request.cookies.get('admin_token')?.value;
    
    if (!session?.user?.id && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build query based on who's requesting
    const whereClause = isAdmin 
      ? { id }
      : { id, userId: session!.user.id };

    const booking = await prisma.booking.findFirst({
      where: whereClause,
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
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Calculate nights
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Prepare voucher data
    const voucherData = {
      bookingReference: booking.bookingReference,
      hotelName: booking.hotelName,
      hotelLocation: booking.hotelLocation,
      hotelStarRating: booking.hotelStarRating || 4,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      roomType: booking.rooms[0]?.roomTypeName || booking.roomType,
      ratePlan: booking.rooms[0]?.ratePlanName || 'Selected Rate',
      boardType: booking.rooms[0]?.boardType || 'ROOM_ONLY',
      adults: booking.adults,
      children: booking.children,
      numberOfRooms: booking.numberOfRooms,
      specialRequests: booking.specialRequests,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      status: booking.status,
      createdAt: booking.createdAt,
      addOns: booking.rooms.flatMap(r => 
        r.addOns.map(a => ({
          name: a.addOn?.name || a.name,
          price: a.price,
          quantity: a.quantity,
        }))
      ),
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <BookingVoucherPDF data={voucherData} />
    );

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="voucher-${booking.bookingReference}.pdf"`,
        'Cache-Control': 'private, max-age=0',
      },
    });

  } catch (error: any) {
    console.error('Voucher generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate voucher' },
      { status: 500 }
    );
  }
}

