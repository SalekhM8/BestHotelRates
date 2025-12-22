import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { generateBookingReference } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import { sendBookingConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Create booking in database
      try {
        const metadata = session.metadata!;
        const bookingReference = generateBookingReference();

        const data: Prisma.BookingUncheckedCreateInput = {
          bookingReference,
          // Satisfy non-null string requirement; override below if real user
          userId: '',
          // Hotel info
          hotelId: metadata.hotelId,
          hotelName: metadata.hotelName,
          hotelLocation: metadata.hotelLocation,
          hotelStarRating: 4,
          hotelImage: session.line_items?.data[0]?.price?.product?.toString(),

          // Booking details
          checkIn: new Date(metadata.checkIn),
          checkOut: new Date(metadata.checkOut),
          roomType: metadata.roomType,
          numberOfRooms: parseInt(metadata.rooms),
          numberOfGuests: parseInt(metadata.adults) + parseInt(metadata.children),
          adults: parseInt(metadata.adults),
          children: parseInt(metadata.children),

          // Guest info
          guestName: metadata.guestName,
          guestEmail: metadata.guestEmail,
          guestPhone: metadata.guestPhone,
          specialRequests: metadata.specialRequests,

          // Pricing
          roomRate: parseFloat(metadata.roomRate),
          taxes: parseFloat(metadata.taxes),
          totalAmount: session.amount_total! / 100, // Convert from cents
          currency: session.currency?.toUpperCase() || 'GBP',

          // Payment
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          stripeSessionId: session.id,
          stripePaymentId: session.payment_intent as string,
        };

        if (metadata.userId && metadata.userId !== 'guest') {
          data.userId = metadata.userId as string;
        }

        const booking = await prisma.booking.create({ data });

        console.log('✅ Booking created:', bookingReference);

        // Send confirmation email to customer
        const emailData = {
          bookingId: booking.id,
          bookingReference,
          guestName: metadata.guestName,
          guestEmail: metadata.guestEmail,
          hotelName: metadata.hotelName,
          hotelLocation: metadata.hotelLocation,
          checkIn: new Date(metadata.checkIn),
          checkOut: new Date(metadata.checkOut),
          roomType: metadata.roomType,
          numberOfRooms: parseInt(metadata.rooms),
          numberOfGuests: parseInt(metadata.adults) + parseInt(metadata.children),
          totalAmount: session.amount_total! / 100,
          currency: session.currency?.toUpperCase() || 'GBP',
          isFreeCancellation: metadata.isFreeCancellation === 'true',
        };

        // Send emails in parallel (non-blocking)
        Promise.all([
          sendBookingConfirmationEmail(emailData),
          sendAdminNotificationEmail(emailData),
        ]).catch((err) => {
          console.error('Email sending failed:', err);
        });
        
      } catch (error) {
        console.error('Error creating booking:', error);
      }
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('✅ Payment succeeded:', paymentIntent.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('❌ Payment failed:', paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}



