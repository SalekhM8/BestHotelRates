import { prisma } from '@/lib/prisma';
import { getSupplierAdapter } from '@/lib/suppliers/registry';
import {
  SupplierHotelDetails,
  SupplierHotelSummary,
  SupplierSearchParams,
} from '@/lib/suppliers/types';

type QueryParams = Record<string, string | string[] | undefined>;

export async function getFeaturedHotelsByCity(city: string, limit = 4) {
  const adapter = getSupplierAdapter();
  return adapter.search({
    destination: city,
    limit,
    sortBy: 'rating',
  });
}

export async function searchInventory(params: SupplierSearchParams) {
  const adapter = getSupplierAdapter();
  return adapter.search(params);
}

export async function getHotelDetails(hotelId: string): Promise<SupplierHotelDetails | null> {
  const adapter = getSupplierAdapter();
  return adapter.getHotelDetails(hotelId);
}

export type BookingSelectionPayload = {
  hotel: {
    id: string;
    name: string;
    location: string;
    heroImage?: string | null;
    currency: string;
    supplierCode?: string | null;
  };
  roomType: {
    id: string;
    name: string;
    description?: string | null;
    maxAdults: number;
    maxChildren: number;
    maxOccupancy: number;
  };
  ratePlan: SupplierHotelDetails['roomTypes'][number]['ratePlans'][number] & {
    cancellationDeadline?: string | null;
  };
  dates: {
    checkIn: string;
    checkOut: string;
    nights: number;
  };
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  addOns: {
    available: SupplierHotelDetails['addOns'];
    selected: {
      id: string;
      name: string;
      price: number;
      currency: string;
      quantity: number;
      total: number;
    }[];
  };
  pricing: {
    nightlyRate: number;
    subtotal: number;
    taxes: number;
    fees: number;
    addOns: number;
    total: number;
  };
};

export async function getBookingSelectionPayload(
  query: QueryParams,
): Promise<BookingSelectionPayload | null> {
  const hotelId = getStringParam(query, 'hotelId');
  const ratePlanId = getStringParam(query, 'ratePlanId');
  const roomTypeId = getStringParam(query, 'roomTypeId');

  if (!hotelId || !ratePlanId) {
    return null;
  }

  const adapter = getSupplierAdapter();
  const hotel = await adapter.getHotelDetails(hotelId);
  if (!hotel) return null;

  const roomType =
    hotel.roomTypes.find((room) => room.id === roomTypeId) ??
    hotel.roomTypes.find((room) => room.ratePlans.some((plan) => plan.id === ratePlanId));
  if (!roomType) return null;

  const ratePlan =
    roomType.ratePlans.find((plan) => plan.id === ratePlanId) ??
    (await adapter.getRatePlan(ratePlanId));
  if (!ratePlan) return null;

  const checkIn = getDateParam(query, 'checkIn') ?? getDefaultCheckIn();
  const checkOut = getDateParam(query, 'checkOut') ?? addDays(checkIn, 2);
  const nights = Math.max(1, diffInNights(checkIn, checkOut));

  const adults = getNumberParam(query, 'adults', 2);
  const children = getNumberParam(query, 'children', 0);
  const rooms = getNumberParam(query, 'rooms', 1);

  const selectedAddOns = parseAddOns(getStringParam(query, 'addOns'));
  const addOnBreakdown = selectedAddOns
    .map((selection) => {
      const addOn = hotel.addOns.find((item) => item.id === selection.id);
      if (!addOn) return null;
      const total = addOn.price * selection.quantity;
      return {
        id: addOn.id,
        name: addOn.name,
        price: addOn.price,
        currency: addOn.currency,
        quantity: selection.quantity,
        total,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const nightlyRate = ratePlan.baseRate;
  const subtotal = nightlyRate * nights * rooms;
  const taxesTotal = ratePlan.taxes * nights * rooms;
  const feesTotal = ratePlan.fees * rooms;
  const addOnTotal = addOnBreakdown.reduce((sum, addOn) => sum + addOn.total, 0);
  const total = subtotal + taxesTotal + feesTotal + addOnTotal;

  // Calculate cancellation deadline from policy
  const cancellationDeadline = ratePlan.cancellationPolicy?.refundableUntilHours
    ? new Date(Date.now() + ratePlan.cancellationPolicy.refundableUntilHours * 60 * 60 * 1000).toISOString()
    : null;

  return {
    hotel: {
      id: hotel.id,
      name: hotel.name,
      location: hotel.location,
      heroImage: hotel.heroImage,
      currency: hotel.currency,
      supplierCode: hotel.supplierCode,
    },
    roomType: {
      id: roomType.id,
      name: roomType.name,
      description: roomType.description,
      maxAdults: roomType.maxAdults,
      maxChildren: roomType.maxChildren,
      maxOccupancy: roomType.maxOccupancy,
    },
    ratePlan: {
      ...ratePlan,
      cancellationDeadline,
    },
    dates: {
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      nights,
    },
    guests: {
      adults,
      children,
      rooms,
    },
    addOns: {
      available: hotel.addOns,
      selected: addOnBreakdown,
    },
    pricing: {
      nightlyRate,
      subtotal,
      taxes: taxesTotal,
      fees: feesTotal,
      addOns: addOnTotal,
      total,
    },
  };
}

export async function getSectionHotels(sections: { city: string; limit?: number }[]) {
  const adapter = getSupplierAdapter();
  const results = await Promise.all(
    sections.map((section) =>
      adapter.search({
        destination: section.city,
        limit: section.limit ?? 4,
        sortBy: 'rating',
      }),
    ),
  );

  return results;
}

export async function getHotelSummaries(limit = 12): Promise<SupplierHotelSummary[]> {
  const adapter = getSupplierAdapter();
  return adapter.search({ limit, sortBy: 'rating' });
}

function getStringParam(params: QueryParams, key: string) {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

function getNumberParam(params: QueryParams, key: string, fallback: number) {
  const value = getStringParam(params, key);
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getDateParam(params: QueryParams, key: string) {
  const value = getStringParam(params, key);
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function parseAddOns(value?: string) {
  if (!value) return [];
  try {
    const decoded = decodeURIComponent(value);
    const parsed = JSON.parse(decoded);
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => ({
          id: entry.id as string,
          quantity: Number(entry.quantity) || 1,
        }))
        .filter((entry) => Boolean(entry.id));
    }
  } catch {
    // ignore malformed payloads
  }
  return [];
}

function getDefaultCheckIn() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return addDays(today, 1);
}

function diffInNights(from: Date, to: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay) || 1;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}



