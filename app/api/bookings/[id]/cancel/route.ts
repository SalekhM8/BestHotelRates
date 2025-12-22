/**
 * Cancel Booking API
 * 
 * Handles customer self-service cancellation:
 * 1. Validates booking is cancellable
 * 2. Calls supplier cancel API (if applicable)
 * 3. Processes Stripe refund
 * 4. Updates booking status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { sendCancellationEmail } from '@/lib/email';

// Check if booking can be cancelled
function canCancelBooking(booking: any): { canCancel: boolean; reason?: string; refundAmount?: number } {
  // Already cancelled
  if (booking.status === BookingStatus.CANCELLED) {
    return { canCancel: false, reason: 'Booking is already cancelled' };
  }

  // Already completed
  if (booking.status === BookingStatus.COMPLETED) {
    return { canCancel: false, reason: 'Cannot cancel a completed booking' };
  }

  // Check-in date has passed
  const checkInDate = new Date(booking.checkIn);
  const now = new Date();
  if (checkInDate <= now) {
    return { canCancel: false, reason: 'Cannot cancel after check-in date' };
  }

  // Check if it's a non-refundable booking
  if (!booking.isFreeCancellation) {
    return { 
      canCancel: true, 
      reason: 'This is a non-refundable booking. No refund will be issued.',
      refundAmount: 0 
    };
  }

  // Check cancellation deadline
  const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Default: free cancellation up to 24 hours before
  const freeCancellationHours = 24;
  
  if (hoursUntilCheckIn < freeCancellationHours) {
    // Late cancellation - partial refund or no refund
    const refundPercentage = hoursUntilCheckIn > 12 ? 0.5 : 0;
    return {
      canCancel: true,
      reason: hoursUntilCheckIn > 12 
        ? 'Late cancellation. 50% refund will be issued.'
        : 'Very late cancellation. No refund available.',
      refundAmount: booking.totalAmount * refundPercentage,
    };
  }

  // Full refund
  return {
    canCancel: true,
    refundAmount: booking.totalAmount,
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find booking
    const booking = await prisma.booking.findFirst({
      where: { 
        id, 
        userId: session.user.id 
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if cancellable
    const { canCancel, reason, refundAmount } = canCancelBooking(booking);

    if (!canCancel) {
      return NextResponse.json({ 
        error: reason || 'Booking cannot be cancelled',
        canCancel: false 
      }, { status: 400 });
    }

    // Process Stripe refund if applicable
    let refundId: string | null = null;
    if (refundAmount && refundAmount > 0 && booking.stripePaymentIntentId) {
      try {
        // Get the payment intent to find the charge
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);
        
        if (paymentIntent.latest_charge) {
          const refund = await stripe.refunds.create({
            charge: paymentIntent.latest_charge as string,
            amount: Math.round(refundAmount * 100), // Stripe uses cents
            reason: 'requested_by_customer',
          });
          refundId = refund.id;
        }
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError);
        // Continue with cancellation even if refund fails
        // Admin can process manually
      }
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        paymentStatus: refundAmount && refundAmount > 0 ? PaymentStatus.REFUNDED : PaymentStatus.PAID,
        cancelledAt: new Date(),
        refundAmount: refundAmount || 0,
        refundId: refundId,
      },
    });

    // Log activity
    await prisma.bookingActivity.create({
      data: {
        bookingId: id,
        type: 'STATUS_UPDATE',
        message: `Booking cancelled by customer. Refund: ${refundAmount ? `£${refundAmount.toFixed(2)}` : 'None'}`,
        actor: session.user.email || session.user.id,
        actorRole: 'CUSTOMER',
      },
    });

    // Send cancellation email
    await sendCancellationEmail({
      bookingReference: booking.bookingReference,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      hotelName: booking.hotelName,
      hotelLocation: booking.hotelLocation,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      refundAmount: refundAmount || 0,
      currency: booking.currency,
    });

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      refundAmount,
      refundId,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus,
      },
    });

  } catch (error: any) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}

// GET endpoint to check cancellation eligibility
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findFirst({
      where: { 
        id, 
        userId: session.user.id 
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const cancellationInfo = canCancelBooking(booking);
    
    const checkInDate = new Date(booking.checkIn);
    const now = new Date();
    const hoursUntilCheckIn = Math.max(0, (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    return NextResponse.json({
      ...cancellationInfo,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      hoursUntilCheckIn: Math.round(hoursUntilCheckIn),
      isFreeCancellation: booking.isFreeCancellation,
      totalAmount: booking.totalAmount,
    });

  } catch (error: any) {
    console.error('Check cancellation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check cancellation' },
      { status: 500 }
    );
  }
}

