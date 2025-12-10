import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth';
import { getAdminBookingById } from '@/lib/admin-bookings';

type ActionPayload = {
  action: 'CONFIRM' | 'CANCEL' | 'MARK_COMPLETED' | 'ADD_NOTE' | 'RESEND_EMAIL' | 'ISSUE_REFUND';
  note?: string;
  refundAmount?: number;
  reason?: string;
};

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const { action, note, refundAmount, reason }: ActionPayload = await request.json();
    const booking = await prisma.booking.findUnique({ where: { id: params.id } });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    switch (action) {
      case 'CONFIRM':
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'CONFIRMED' },
        });
        await logActivity(booking.id, 'STATUS_UPDATE', 'Booking confirmed', admin?.email);
        break;
      case 'CANCEL':
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' },
        });
        await logActivity(
          booking.id,
          'STATUS_UPDATE',
          'Booking manually cancelled by admin',
          admin?.email,
        );
        break;
      case 'MARK_COMPLETED':
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'COMPLETED' },
        });
        await logActivity(booking.id, 'STATUS_UPDATE', 'Booking marked as completed', admin?.email);
        break;
      case 'ADD_NOTE':
        if (!note?.trim()) {
          return NextResponse.json({ error: 'Note is required' }, { status: 400 });
        }
        await logActivity(booking.id, 'NOTE', note.trim(), admin?.email);
        break;
      case 'RESEND_EMAIL':
        await logActivity(
          booking.id,
          'EMAIL',
          'Triggered resend of booking confirmation email',
          admin?.email,
        );
        break;
      case 'ISSUE_REFUND':
        await prisma.booking.update({
          where: { id: booking.id },
          data: { paymentStatus: 'REFUNDED' },
        });
        await logActivity(
          booking.id,
          'REFUND',
          `Refund issued (${formatCurrency(refundAmount ?? booking.totalAmount)})${
            reason ? ` - ${reason}` : ''
          }`,
          admin?.email,
          {
            refundAmount: refundAmount ?? booking.totalAmount,
            reason,
          },
        );
        break;
      default:
        return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    const refreshed = await getAdminBookingById(booking.id);
    return NextResponse.json({ booking: refreshed });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin booking action error:', error);
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
  }
}

async function logActivity(
  bookingId: string,
  type:
    | 'STATUS_UPDATE'
    | 'PAYMENT_UPDATE'
    | 'NOTE'
    | 'EMAIL'
    | 'REFUND'
    | 'SUPPLIER_EVENT',
  message: string,
  actor?: string,
  metadata?: Record<string, unknown>,
) {
  await prisma.bookingActivity.create({
    data: {
      bookingId,
      type,
      message,
      actor,
      actorRole: 'ADMIN',
      metadata,
    },
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}



