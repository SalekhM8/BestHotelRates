/**
 * Verify Stripe Session & Fetch Booking
 * 
 * Returns booking info for a completed Stripe checkout session
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Find booking by Stripe session ID
    const booking = await prisma.booking.findFirst({
      where: {
        stripeSessionId: sessionId,
      },
      select: {
        id: true,
        bookingReference: true,
        hotelName: true,
        hotelLocation: true,
        checkIn: true,
        checkOut: true,
        status: true,
        totalAmount: true,
        currency: true,
      },
    });

    if (!booking) {
      // Session exists but booking not yet created (webhook pending)
      return NextResponse.json({
        status: session.payment_status,
        booking: null,
        message: 'Booking is being processed',
      });
    }

    return NextResponse.json({
      status: session.payment_status,
      booking: {
        id: booking.id,
        bookingReference: booking.bookingReference,
        hotelName: booking.hotelName,
        hotelLocation: booking.hotelLocation,
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        status: booking.status,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
      },
    });

  } catch (error: any) {
    console.error('Verify session error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify session' },
      { status: 500 }
    );
  }
}


