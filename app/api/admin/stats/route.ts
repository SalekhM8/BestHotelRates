import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

export async function GET() {
  try {
    // Verify admin token
    const cookieStore = cookies();
    const token = cookieStore.get('admin-token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      verify(token.value, process.env.NEXTAUTH_SECRET || 'admin-secret');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get statistics
    const [
      totalBookings,
      totalUsers,
      paidBookings,
      pendingBookings,
      cancelledBookings,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.user.count(),
      prisma.booking.count({ where: { paymentStatus: 'PAID' } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
    ]);

    // Calculate revenue
    const revenue = await prisma.booking.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { totalAmount: true },
    });

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalBookings,
        totalUsers,
        totalRevenue: revenue._sum.totalAmount || 0,
        paidBookings,
        pendingBookings,
        cancelledBookings,
      },
      recentBookings,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

