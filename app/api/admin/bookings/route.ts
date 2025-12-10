import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, AdminAuthError } from '@/lib/admin-auth';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const pageSize = Math.min(
      100,
      Math.max(5, Number(searchParams.get('pageSize') ?? '20')),
    );
    const skip = (page - 1) * pageSize;

    let where: any = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { bookingReference: { contains: search } },
        { guestName: { contains: search } },
        { guestEmail: { contains: search } },
        { hotelName: { contains: search } },
      ];
    }

    const [bookings, totalCount, pendingCount, confirmedCount, cancelledCount, completedCount] =
      await Promise.all([
        prisma.booking.findMany({
          where,
          include: {
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.booking.count({ where }),
        prisma.booking.count({ where: { ...where, status: 'PENDING' } }),
        prisma.booking.count({ where: { ...where, status: 'CONFIRMED' } }),
        prisma.booking.count({ where: { ...where, status: 'CANCELLED' } }),
        prisma.booking.count({ where: { ...where, status: 'COMPLETED' } }),
      ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalCount,
      },
      stats: {
        total: totalCount,
        pending: pendingCount,
        confirmed: confirmedCount,
        cancelled: cancelledCount,
        completed: completedCount,
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

