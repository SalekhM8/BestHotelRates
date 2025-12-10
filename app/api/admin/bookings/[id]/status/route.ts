import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const admin = await requireAdmin();

    const { status } = await request.json();

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update booking status
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    await prisma.bookingActivity.create({
      data: {
        bookingId: id,
        type: 'STATUS_UPDATE',
        message: `Status changed to ${status}`,
        actor: admin?.email ?? 'admin',
        actorRole: 'ADMIN',
      },
    });

    return NextResponse.json({ booking });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Update booking status error:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}

