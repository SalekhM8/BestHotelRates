import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { generateBookingReference } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const {
      hotelId,
      hotelName,
      hotelLocation,
      hotelImage,
      roomType,
      ratePlanId,
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
      roomRate,
      taxes,
      totalAmount,
      currency = 'GBP',
      addOns = [],
    } = body;

    // Validate required fields
    if (!hotelName || !guestEmail || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001');

    // DEBUG: Log session and user ID
    console.log('🔍 CHECKOUT DEBUG:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });

    const safeString = (val: any, fallback = '') =>
      val === null || val === undefined ? fallback : String(val);
    const safeNumberString = (val: any, fallback = '0') =>
      Number.isFinite(Number(val)) ? String(val) : fallback;
    const safeAddOns = Array.isArray(addOns) ? addOns : [];

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: formatAmountForStripe(totalAmount),
            product_data: {
              name: `${hotelName} - ${roomType}`,
              description: `${hotelLocation} | Check-in: ${checkIn} | Check-out: ${checkOut}`,
              images: hotelImage ? [hotelImage] : [],
            },
          },
          quantity: 1,
        },
      ],
      customer_email: guestEmail,
      metadata: {
        hotelId: hotelId || 'unknown',
        hotelName,
        hotelLocation,
        roomType,
        checkIn,
        checkOut,
        adults: safeNumberString(adults),
        children: safeNumberString(children),
        rooms: safeNumberString(rooms, '1'),
        ratePlanId: safeString(ratePlanId),
        guestName: safeString(guestName),
        guestEmail: safeString(guestEmail),
        guestPhone: safeString(guestPhone),
        specialRequests: safeString(specialRequests),
        roomRate: safeNumberString(roomRate),
        taxes: safeNumberString(taxes),
        currency: safeString(currency, 'GBP'),
        addOns: JSON.stringify(safeAddOns),
        userId: session?.user?.id || 'guest',
      },
      success_url: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment-cancelled`,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}



