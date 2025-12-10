import crypto from 'crypto';
import { BoardType, PaymentType, RateType } from '@prisma/client';
import {
  SupplierAdapter,
  SupplierHotelDetails,
  SupplierHotelSummary,
  SupplierRatePlan,
  SupplierSearchParams,
} from './types';
import { localInventoryAdapter } from './localInventoryAdapter';
import { withCache } from '../cache/sharedCache';

const HB_API_KEY = process.env.HOTELBEDS_API_KEY;
const HB_API_SECRET = process.env.HOTELBEDS_API_SECRET;
const HB_BASE_URL = process.env.HOTELBEDS_BASE_URL ?? 'https://api.test.hotelbeds.com';
const HB_SOURCE_MARKET = process.env.HOTELBEDS_SOURCE_MARKET ?? 'GB';
const HB_CURRENCY = process.env.HOTELBEDS_CURRENCY ?? 'GBP';
const rawLanguage = (process.env.HOTELBEDS_LANGUAGE ?? 'ENG').toUpperCase();
// HotelBeds expects 3-letter language codes (e.g., ENG, SPA). If a 2-letter code is provided, coerce EN -> ENG.
const HB_LANGUAGE = rawLanguage.length === 2 && rawLanguage === 'EN' ? 'ENG' : rawLanguage;

export const isHotelbedsConfigured = Boolean(HB_API_KEY && HB_API_SECRET);

class HttpError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

function buildSignature(timestampSeconds: number) {
  return crypto
    .createHash('sha256')
    .update(`${HB_API_KEY}${HB_API_SECRET}${timestampSeconds}`)
    .digest('hex');
}

async function hbFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!isHotelbedsConfigured) {
    throw new Error('HotelBeds credentials are missing');
  }

  const ts = Math.floor(Date.now() / 1000);
  const signature = buildSignature(ts);

  const res = await fetch(`${HB_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Api-key': HB_API_KEY as string,
      'X-Signature': signature,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new HttpError(res.status, text, `HotelBeds request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

function formatDate(date?: Date) {
  const d = date ?? addDays(new Date(), 1);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function resolveDestinationCode(query: string): Promise<string | undefined> {
  if (!query || !isHotelbedsConfigured) return undefined;
  const trimmed = query.trim();
  // If the user already typed an uppercase short code, accept it directly.
  const upper = trimmed.toUpperCase();
  if (/^[A-Z]{2,3}$/.test(upper)) {
    return upper;
  }

  const encoded = encodeURIComponent(trimmed);
  try {
    const cacheKey = `hb-dest:${upper}`;
    const data = await withCache(
      cacheKey,
      1000 * 60 * 60 * 24, // 24h cache
      () =>
        hbFetch<any>(
          `/hotel-content-api/1.0/locations/destinations?fields=all&language=${HB_LANGUAGE}&from=1&to=10&order=name&text=${encoded}`,
        ),
    );
    const dest = data?.destinations?.[0];
    return dest?.code ? String(dest.code).toUpperCase() : undefined;
  } catch (err) {
    console.error('HotelBeds destination lookup failed, falling back to raw query', err);
    return undefined;
  }
}

function buildPaxes(adults = 2, children = 0) {
  const paxes: { type: 'AD' | 'CH'; age: number }[] = [];
  for (let i = 0; i < adults; i += 1) {
    paxes.push({ type: 'AD', age: 30 });
  }
  for (let i = 0; i < children; i += 1) {
    paxes.push({ type: 'CH', age: 8 });
  }
  return paxes;
}

function mapBoard(boardCode?: string, boardName?: string): BoardType {
  const code = boardCode?.toUpperCase() ?? boardName?.toUpperCase() ?? '';
  if (code.includes('BB') || code.includes('BREAKFAST')) return BoardType.BED_AND_BREAKFAST;
  if (code.includes('HB')) return BoardType.HALF_BOARD;
  if (code.includes('FB')) return BoardType.FULL_BOARD;
  if (code.includes('AI') || code.includes('ALL')) return BoardType.ALL_INCLUSIVE;
  return BoardType.ROOM_ONLY;
}

function mapPayment(paymentType?: string): PaymentType {
  const normalized = paymentType?.toUpperCase();
  if (normalized === 'AT_HOTEL' || normalized === 'HOTEL') return PaymentType.PAY_AT_HOTEL;
  if (normalized === 'CREDIT') return PaymentType.CREDIT_LIMIT;
  return PaymentType.PREPAID;
}

function mapRateType(rateType?: string, refundable = true): RateType {
  const rt = rateType?.toUpperCase() ?? '';
  if (!refundable || rt.includes('NRF') || rt.includes('NON')) return RateType.NON_REFUNDABLE;
  if (rt.includes('PROMO') || rt.includes('OFFER')) return RateType.PROMO;
  if (rt.includes('FLEX')) return RateType.FLEX;
  return RateType.STANDARD;
}

function parseCategory(categoryName?: string) {
  if (!categoryName) return 0;
  const match = categoryName.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function toRatePlan(rate: any): SupplierRatePlan {
  const isRefundable = Array.isArray(rate.cancellationPolicies) && rate.cancellationPolicies.length > 0;
  const boardType = mapBoard(rate.boardCode, rate.boardName);
  const paymentType = mapPayment(rate.paymentType);
  const rateType = mapRateType(rate.rateClass || rate.rateType, isRefundable);
  const baseRate = Number(rate.net ?? rate.sellingRate ?? 0);
  const taxes = Array.isArray(rate.taxes?.taxes)
    ? rate.taxes.taxes.reduce((sum: number, tax: any) => sum + Number(tax.amount ?? 0), 0)
    : 0;
  const fees = 0;
  const totalAmount = Number(rate.sellingRate ?? rate.net ?? 0) + taxes + fees;
  const refundableUntil = isRefundable
    ? rate.cancellationPolicies?.[0]?.from
    : null;

  return {
    id: rate.rateKey ?? crypto.randomUUID(),
    name: rate.rateClass || rate.boardName || 'Room',
    boardType,
    rateType,
    paymentType,
    isRefundable,
    currency: rate.currency ?? HB_CURRENCY,
    baseRate,
    taxes,
    fees,
    totalAmount,
    nightlyBreakdown: rate.dailyRates ?? undefined,
    promotions: rate.promotions ?? undefined,
    inclusions: rate.includedBoard ?? undefined,
    includeBreakfast: boardType === BoardType.BED_AND_BREAKFAST,
    availableRooms: Number(rate.allotment ?? 0),
    cancellationPolicy: refundableUntil
      ? {
          name: 'Cancellation policy',
          description: rate.cancellationPolicies?.[0]?.description,
          refundableUntilHours: refundableUntil ? hoursUntil(refundableUntil) : null,
          policyText: JSON.stringify(rate.cancellationPolicies ?? []),
        }
      : null,
    addOns: [],
  };
}

function hoursUntil(dateString: string) {
  const target = new Date(dateString).getTime();
  const now = Date.now();
  if (Number.isNaN(target)) return null;
  return Math.max(0, Math.round((target - now) / (1000 * 60 * 60)));
}

function toHotelSummary(hotel: any): SupplierHotelSummary {
  const primaryRate = hotel.minRate ?? hotel?.rooms?.[0]?.rates?.[0];
  const ratePlan = primaryRate ? toRatePlan(primaryRate) : null;
  return {
    id: String(hotel.code),
    slug: String(hotel.code),
    name: hotel.name?.content ?? hotel.name ?? `Hotel ${hotel.code}`,
    headline: undefined,
    location: hotel.destinationName ?? hotel.zoneName ?? '',
    city: hotel.destinationName ?? hotel.zoneName ?? '',
    country: hotel.countryCode ?? '',
    rating: parseCategory(hotel.categoryName),
    reviewCount: 0,
    currency: ratePlan?.currency ?? HB_CURRENCY,
    startingRate: ratePlan?.baseRate ?? null,
    heroImage: undefined,
    primaryImage: undefined,
    tags: undefined,
    categories: [],
    supplierCode: 'HOTELBEDS',
    minRatePlan: ratePlan
      ? {
          id: ratePlan.id,
          name: ratePlan.name,
          boardType: ratePlan.boardType,
          rateType: ratePlan.rateType,
          paymentType: ratePlan.paymentType,
          baseRate: ratePlan.baseRate,
          currency: ratePlan.currency,
        }
      : null,
  };
}

function toHotelDetails(hotel: any): SupplierHotelDetails {
  const summary = toHotelSummary(hotel);
  const roomTypes =
    hotel.rooms?.map((room: any) => ({
      id: room.code ? `${hotel.code}-${room.code}` : crypto.randomUUID(),
      name: room.name?.content ?? room.name ?? 'Room',
      description: room.description?.content ?? room.description,
      sizeSqm: undefined,
      view: undefined,
      maxAdults: room.maxAdults ?? room.adults ?? 2,
      maxChildren: room.children ?? 0,
      maxOccupancy: (room.maxAdults ?? room.adults ?? 2) + (room.children ?? 0),
      isSuite: false,
      images: [],
      amenities: [],
      ratePlans: (room.rates ?? []).map(toRatePlan),
    })) ?? [];

  return {
    ...summary,
    description: hotel.description?.content ?? undefined,
    reviewScore: summary.rating,
    amenities: [],
    images: [],
    addOns: [],
    roomTypes,
  };
}

async function availabilityRequest(body: any) {
  // HotelBeds availability/search endpoint is /hotel-api/1.0/hotels (POST)
  return hbFetch<any>('/hotel-api/1.0/hotels', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export const hotelbedsAdapter: SupplierAdapter = {
  code: 'HOTELBEDS',

  async search(params: SupplierSearchParams) {
    if (!isHotelbedsConfigured) return [];
    const {
      destination,
      checkIn,
      checkOut,
      adults = 2,
      children = 0,
      rooms = 1,
      limit = 20,
    } = params;

    if (!destination) {
      return [];
    }

    const destinationCode = await resolveDestinationCode(destination);
    // If we fail to resolve a valid destination code, return empty to avoid 400s.
    if (!destinationCode) {
      return [];
    }

    const body = {
      stay: {
        checkIn: formatDate(checkIn),
        checkOut: formatDate(checkOut ?? addDays(checkIn ?? addDays(new Date(), 1), 2)),
      },
      occupancies: [
        {
          rooms,
          adults,
          children,
          paxes: buildPaxes(adults, children),
        },
      ],
      destination: {
        code: destinationCode,
        type: 'SIMPLE',
      },
      filter: {
        maxHotels: limit,
        maxRooms: rooms,
      },
      sourceMarket: HB_SOURCE_MARKET,
      dailyRate: 'true',
      language: HB_LANGUAGE,
    };

    try {
      const cacheKey = `hb-search:${destinationCode}:${body.stay.checkIn}:${body.stay.checkOut}:${adults}:${children}:${rooms}:${limit}`;
      const data = await withCache(cacheKey, 1000 * 60, () => availabilityRequest(body));
      const hotels = data?.hotels?.hotels ?? [];
      return hotels.map(toHotelSummary);
    } catch (err: any) {
      if (err instanceof HttpError && (err.status === 429 || err.status === 403 || err.body?.includes('Quota exceeded'))) {
        console.warn('HotelBeds quota/limit hit; falling back to local inventory');
        return localInventoryAdapter.search(params);
      }
      console.error('HotelBeds search failed, falling back to empty result', err);
      return [];
    }
  },

  async getHotelDetails(hotelId: string): Promise<SupplierHotelDetails | null> {
    if (!isHotelbedsConfigured || !hotelId) return null;

    const body = {
      stay: {
        checkIn: formatDate(),
        checkOut: formatDate(addDays(new Date(), 2)),
      },
      occupancies: [
        {
          rooms: 1,
          adults: 2,
          children: 0,
          paxes: buildPaxes(2, 0),
        },
      ],
      hotels: {
        hotel: [Number(hotelId)],
      },
      sourceMarket: HB_SOURCE_MARKET,
      language: HB_LANGUAGE,
    };

    try {
      const cacheKey = `hb-details:${hotelId}`;
      const data = await withCache(cacheKey, 1000 * 60, () => availabilityRequest(body));
      const hotel = data?.hotels?.hotels?.[0];
      if (!hotel) return null;
      return toHotelDetails(hotel);
    } catch (err: any) {
      if (err instanceof HttpError && (err.status === 429 || err.status === 403 || err.body?.includes('Quota exceeded'))) {
        console.warn(`HotelBeds quota/limit on details for ${hotelId}; falling back to local inventory`);
        return localInventoryAdapter.getHotelDetails(hotelId);
      }
      console.error(`HotelBeds getHotelDetails failed for ${hotelId}`, err);
      return null;
    }
  },

  async getRatePlan(ratePlanId: string): Promise<SupplierRatePlan | null> {
    // HotelBeds requires re-checking with rateKey; here we return null to force client to rely on hotel details call.
    return null;
  },
};

export default hotelbedsAdapter;

