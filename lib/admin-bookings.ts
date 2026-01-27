import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const adminBookingDetailInclude = {
  user: {
    select: {
      name: true,
      email: true,
      phone: true,
    },
  },
  rooms: {
    orderBy: { createdAt: 'asc' },
    include: {
      roomType: {
        select: {
          name: true,
          sizeSqm: true,
          view: true,
        },
      },
      ratePlan: {
        select: {
          name: true,
          boardType: true,
          rateType: true,
          paymentType: true,
          includeBreakfast: true,
        },
      },
      addOns: {
        include: {
          addOn: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      },
    },
  },
  activities: {
    orderBy: { createdAt: 'desc' },
  },
} satisfies Prisma.BookingInclude;

export async function getAdminBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: adminBookingDetailInclude,
  });
}




