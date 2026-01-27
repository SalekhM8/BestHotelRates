import { prisma } from '@/lib/prisma';
import { addDays, startOfDay } from 'date-fns';

export async function getHotelAdminStats() {
  const today = startOfDay(new Date());
  const upcomingThreshold = addDays(today, 30);

  const [total, upcoming, active, completed, cancelled, unpaid, freeCancellation, autoCancellation] =
    await Promise.all([
      prisma.booking.count({ where: { serviceType: 'HOTEL' } }),
      prisma.booking.count({
        where: {
          serviceType: 'HOTEL',
          checkIn: { gte: today, lte: upcomingThreshold },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      }),
      prisma.booking.count({
        where: {
          serviceType: 'HOTEL',
          status: { in: ['PENDING', 'CONFIRMED'] },
          checkIn: { lte: addDays(today, 1) },
          checkOut: { gte: today },
        },
      }),
      prisma.booking.count({
        where: {
          serviceType: 'HOTEL',
          status: 'COMPLETED',
        },
      }),
      prisma.booking.count({
        where: {
          serviceType: 'HOTEL',
          status: 'CANCELLED',
        },
      }),
      prisma.booking.count({
        where: {
          serviceType: 'HOTEL',
          isUnpaid: true,
        },
      }),
      prisma.booking.count({
        where: {
          serviceType: 'HOTEL',
          isFreeCancellation: true,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      }),
      prisma.booking.count({
        where: {
          serviceType: 'HOTEL',
          automaticCancelAt: { gte: today },
          status: { in: ['PENDING'] },
        },
      }),
    ]);

  return {
    total,
    upcoming,
    active,
    completed,
    cancelled,
    unpaid,
    freeCancellation,
    automaticCancellation: autoCancellation,
  };
}

export async function getTransferAdminStats() {
  const today = startOfDay(new Date());
  const upcomingThreshold = addDays(today, 30);

  const [total, upcoming, completed, cancelled, unpaid] = await Promise.all([
    prisma.booking.count({ where: { serviceType: 'TRANSFER' } }),
    prisma.booking.count({
      where: {
        serviceType: 'TRANSFER',
        checkIn: { gte: today, lte: upcomingThreshold },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    }),
    prisma.booking.count({
      where: {
        serviceType: 'TRANSFER',
        status: 'COMPLETED',
      },
    }),
    prisma.booking.count({
      where: {
        serviceType: 'TRANSFER',
        status: 'CANCELLED',
      },
    }),
    prisma.booking.count({
      where: {
        serviceType: 'TRANSFER',
        isUnpaid: true,
      },
    }),
  ]);

  return {
    total,
    upcoming,
    completed,
    cancelled,
    unpaid,
  };
}




