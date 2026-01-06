/**
 * RateHawk/ETG API Adapter
 * Documentation: https://docs.emergingtravel.com/
 * 
 * Auth: HTTP Basic Auth with KEY_ID:API_KEY
 * Base URL: https://api.worldota.net/api/b2b/v3/
 */

import { BoardType, PaymentType, RateType } from '@prisma/client';
import {
  SupplierAdapter,
  SupplierHotelDetails,
  SupplierHotelSummary,
  SupplierRatePlan,
  SupplierRoomType,
  SupplierSearchParams,
} from './types';
import { localInventoryAdapter } from './localInventoryAdapter';
import { withCache } from '../cache/sharedCache';

// ─────────────────────────────────────────────────────────────────────────────
// Environment Configuration
// ─────────────────────────────────────────────────────────────────────────────
const ETG_KEY_ID = process.env.RATEHAWK_KEY_ID ?? process.env.ETG_KEY_ID;
const ETG_API_KEY = process.env.RATEHAWK_API_KEY ?? process.env.ETG_API_KEY;
const ETG_BASE_URL = process.env.RATEHAWK_BASE_URL ?? process.env.ETG_BASE_URL ?? 'https://api.worldota.net/api/b2b/v3';
const ETG_LANGUAGE = (process.env.RATEHAWK_LANGUAGE ?? 'en').toLowerCase();
const ETG_CURRENCY = process.env.RATEHAWK_CURRENCY ?? 'GBP';
const ETG_RESIDENCY = process.env.RATEHAWK_RESIDENCY ?? 'gb';

export const isRatehawkConfigured = Boolean(ETG_KEY_ID && ETG_API_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// HTTP Client
// ─────────────────────────────────────────────────────────────────────────────
class HttpError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

function buildAuthHeader(): string {
  // HTTP Basic Auth: base64(KEY_ID:API_KEY)
  const credentials = `${ETG_KEY_ID}:${ETG_API_KEY}`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
}

async function etgFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!isRatehawkConfigured) {
    throw new Error('RateHawk/ETG credentials are missing');
  }

  const url = `${ETG_BASE_URL}${path}`;
  
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: buildAuthHeader(),
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`RateHawk request failed (${res.status}): ${text}`);
    throw new HttpError(res.status, text, `RateHawk request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────
function formatDate(date?: Date): string {
  const d = date ?? addDays(new Date(), 1);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Resolve free-text destination to ETG region_id using multicomplete
 */
async function resolveRegionId(query: string): Promise<string | undefined> {
  if (!query || !isRatehawkConfigured) return undefined;
  
  const trimmed = query.trim();
  if (!trimmed) return undefined;

  try {
    const cacheKey = `etg-region:${trimmed.toLowerCase()}`;
    const data = await withCache(
      cacheKey,
      1000 * 60 * 60 * 24, // 24h cache
      async () => {
        const body = {
          query: trimmed,
          language: ETG_LANGUAGE,
        };
        return etgFetch<any>('/search/multicomplete/', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
    );

    // The response has { data: { regions: [...], hotels: [...] } }
    const regions = data?.data?.regions ?? [];
    if (regions.length > 0) {
      // Return the first matching region ID
      return regions[0].id;
    }

    return undefined;
  } catch (err) {
    console.error('RateHawk region lookup failed:', err);
    return undefined;
  }
}

/**
 * Build guests array for ETG API
 * Format: [{ adults: N, children: [age1, age2, ...] }]
 */
function buildGuests(adults = 2, children = 0, childAges: number[] = []): any[] {
  const ages = childAges.length > 0 ? childAges : Array(children).fill(8);
  return [
    {
      adults,
      children: ages.slice(0, children),
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapping Functions
// ─────────────────────────────────────────────────────────────────────────────
function mapMealType(mealType?: string): BoardType {
  const meal = mealType?.toLowerCase() ?? '';
  if (meal.includes('all-inclusive') || meal.includes('all_inclusive')) return BoardType.ALL_INCLUSIVE;
  if (meal.includes('full-board') || meal.includes('full_board')) return BoardType.FULL_BOARD;
  if (meal.includes('half-board') || meal.includes('half_board')) return BoardType.HALF_BOARD;
  if (meal.includes('breakfast')) return BoardType.BED_AND_BREAKFAST;
  return BoardType.ROOM_ONLY;
}

function mapPaymentType(paymentOptions?: any): PaymentType {
  // ETG has payment_options with different methods
  if (paymentOptions?.payment_types?.includes('deposit')) return PaymentType.CREDIT_LIMIT;
  if (paymentOptions?.payment_types?.includes('now')) return PaymentType.PREPAID;
  if (paymentOptions?.payment_types?.includes('hotel')) return PaymentType.PAY_AT_HOTEL;
  return PaymentType.PREPAID;
}

function mapRateType(rateInfo?: any): RateType {
  const freeCancellationBefore = rateInfo?.free_cancellation_before;
  if (!freeCancellationBefore) return RateType.NON_REFUNDABLE;
  
  // Check if cancellation is still possible
  const cancelDate = new Date(freeCancellationBefore);
  if (cancelDate > new Date()) return RateType.FLEX;
  
  return RateType.NON_REFUNDABLE;
}

function parseStars(starRating?: number | string): number {
  if (typeof starRating === 'number') return starRating;
  if (typeof starRating === 'string') {
    const match = starRating.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }
  return 0;
}

/**
 * Map ETG rate to our SupplierRatePlan
 */
function toRatePlan(rate: any, roomName?: string): SupplierRatePlan {
  const freeCancellationBefore = rate.free_cancellation_before;
  const isRefundable = Boolean(freeCancellationBefore && new Date(freeCancellationBefore) > new Date());
  
  const boardType = mapMealType(rate.meal);
  const paymentType = mapPaymentType(rate.payment_options);
  const rateType = mapRateType(rate);

  // ETG provides daily_prices array
  const dailyPrices = rate.daily_prices ?? [];
  const baseRate = Number(rate.payment_options?.payment_types?.[0]?.amount ?? rate.daily_prices?.[0] ?? 0);
  const totalAmount = dailyPrices.reduce((sum: number, p: number) => sum + p, 0) || baseRate;

  return {
    id: rate.book_hash ?? rate.match_hash ?? crypto.randomUUID(),
    name: rate.room_name ?? roomName ?? 'Room',
    boardType,
    rateType,
    paymentType,
    isRefundable,
    currency: rate.currency ?? ETG_CURRENCY,
    baseRate: totalAmount / Math.max(dailyPrices.length, 1),
    taxes: 0, // ETG includes taxes in price
    fees: 0,
    totalAmount,
    nightlyBreakdown: dailyPrices,
    promotions: rate.rg_ext ?? undefined,
    inclusions: rate.amenities_data ?? undefined,
    includeBreakfast: boardType === BoardType.BED_AND_BREAKFAST,
    availableRooms: rate.rooms_available ?? rate.room_data_trans?.rooms ?? 1,
    cancellationPolicy: isRefundable
      ? {
          name: 'Free cancellation',
          description: `Free cancellation before ${freeCancellationBefore}`,
          refundableUntilHours: hoursUntil(freeCancellationBefore),
          policyText: rate.cancellation_penalties ? JSON.stringify(rate.cancellation_penalties) : undefined,
        }
      : {
          name: 'Non-refundable',
          description: 'This rate is non-refundable',
          refundableUntilHours: null,
          policyText: undefined,
        },
    addOns: [],
  };
}

function hoursUntil(dateString: string): number | null {
  const target = new Date(dateString).getTime();
  const now = Date.now();
  if (Number.isNaN(target)) return null;
  return Math.max(0, Math.round((target - now) / (1000 * 60 * 60)));
}

/**
 * Map ETG hotel from search response to SupplierHotelSummary
 */
function toHotelSummary(hotel: any): SupplierHotelSummary {
  const rates = hotel.rates ?? [];
  const minRate = rates.length > 0
    ? rates.reduce((min: any, r: any) => {
        const rTotal = r.daily_prices?.reduce((s: number, p: number) => s + p, 0) ?? Infinity;
        const minTotal = min.daily_prices?.reduce((s: number, p: number) => s + p, 0) ?? Infinity;
        return rTotal < minTotal ? r : min;
      }, rates[0])
    : null;

  const ratePlan = minRate ? toRatePlan(minRate) : null;

  return {
    id: hotel.id ?? hotel.hotel_id ?? '',
    slug: hotel.id ?? hotel.hotel_id ?? '',
    name: hotel.name ?? `Hotel ${hotel.id}`,
    headline: hotel.address ?? undefined,
    location: hotel.region?.name ?? hotel.address ?? '',
    city: hotel.region?.name ?? '',
    country: hotel.region?.country_code ?? '',
    rating: parseStars(hotel.star_rating ?? hotel.stars),
    reviewCount: hotel.reviews?.rating_count ?? 0,
    currency: ratePlan?.currency ?? ETG_CURRENCY,
    startingRate: ratePlan?.totalAmount ?? null,
    heroImage: hotel.images?.[0] ?? undefined,
    primaryImage: hotel.images?.[0] ?? undefined,
    tags: undefined,
    categories: [],
    supplierCode: 'RATEHAWK',
    minRatePlan: ratePlan
      ? {
          id: ratePlan.id,
          name: ratePlan.name,
          boardType: ratePlan.boardType,
          rateType: ratePlan.rateType,
          paymentType: ratePlan.paymentType,
          baseRate: ratePlan.baseRate,
          currency: ratePlan.currency,
          isRefundable: ratePlan.isRefundable,
        }
      : null,
  };
}

/**
 * Map ETG hotel from hotelpage response to SupplierHotelDetails
 */
function toHotelDetails(hotelInfo: any, hotelpage: any): SupplierHotelDetails {
  const summary = toHotelSummary({ ...hotelInfo, rates: hotelpage?.rates ?? [] });

  // Group rates by room_name to create room types
  const ratesByRoom: Map<string, any[]> = new Map();
  for (const rate of hotelpage?.rates ?? []) {
    const roomName = rate.room_name ?? 'Standard Room';
    const existing = ratesByRoom.get(roomName) ?? [];
    existing.push(rate);
    ratesByRoom.set(roomName, existing);
  }

  const roomTypes: SupplierRoomType[] = Array.from(ratesByRoom.entries()).map(([roomName, rates], idx) => ({
    id: `${summary.id}-room-${idx}`,
    name: roomName,
    description: rates[0]?.room_data_trans?.main_name ?? undefined,
    sizeSqm: rates[0]?.room_data_trans?.area ?? undefined,
    view: rates[0]?.room_data_trans?.view ?? undefined,
    maxAdults: rates[0]?.room_data_trans?.max_adults ?? 2,
    maxChildren: rates[0]?.room_data_trans?.max_children ?? 2,
    maxOccupancy: (rates[0]?.room_data_trans?.max_adults ?? 2) + (rates[0]?.room_data_trans?.max_children ?? 2),
    isSuite: roomName.toLowerCase().includes('suite'),
    images: (rates[0]?.room_data_trans?.images ?? []).map((url: string, i: number) => ({
      id: `room-img-${i}`,
      url,
      caption: roomName,
      isPrimary: i === 0,
    })),
    amenities: (rates[0]?.amenities_data ?? []).map((a: string, i: number) => ({
      id: `amenity-${i}`,
      name: a,
      category: 'Room',
    })),
    ratePlans: rates.map(r => toRatePlan(r, roomName)),
  }));

  return {
    ...summary,
    description: hotelInfo?.description ?? undefined,
    reviewScore: hotelInfo?.reviews?.rating ?? summary.rating,
    reviewCount: hotelInfo?.reviews?.rating_count ?? 0,
    amenities: (hotelInfo?.amenities ?? []).map((a: string, i: number) => ({
      id: `hotel-amenity-${i}`,
      name: a,
      category: 'Hotel',
    })),
    images: (hotelInfo?.images ?? []).map((url: string, i: number) => ({
      id: `hotel-img-${i}`,
      url,
      caption: undefined,
      isPrimary: i === 0,
    })),
    addOns: [],
    roomTypes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ETG API Endpoints
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search by region ID
 * POST /search/serp/region/
 */
async function searchByRegion(
  regionId: string,
  checkIn: string,
  checkOut: string,
  guests: any[],
  residency: string,
  limit = 20
): Promise<any> {
  const body = {
    region_id: Number(regionId),
    checkin: checkIn,
    checkout: checkOut,
    guests,
    residency,
    language: ETG_LANGUAGE,
    currency: ETG_CURRENCY,
  };

  return etgFetch<any>('/search/serp/region/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Search by geo coordinates
 * POST /search/serp/geo/
 */
async function searchByGeo(
  lat: number,
  lon: number,
  radius: number,
  checkIn: string,
  checkOut: string,
  guests: any[],
  residency: string
): Promise<any> {
  const body = {
    latitude: lat,
    longitude: lon,
    radius,
    checkin: checkIn,
    checkout: checkOut,
    guests,
    residency,
    language: ETG_LANGUAGE,
    currency: ETG_CURRENCY,
  };

  return etgFetch<any>('/search/serp/geo/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Search by hotel IDs
 * POST /search/serp/hotels/
 */
async function searchByHotelIds(
  hotelIds: string[],
  checkIn: string,
  checkOut: string,
  guests: any[],
  residency: string
): Promise<any> {
  const body = {
    ids: hotelIds,
    checkin: checkIn,
    checkout: checkOut,
    guests,
    residency,
    language: ETG_LANGUAGE,
    currency: ETG_CURRENCY,
  };

  return etgFetch<any>('/search/serp/hotels/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Get detailed rates for a single hotel (hotelpage)
 * POST /search/hp/
 */
async function getHotelpage(
  hotelId: string,
  checkIn: string,
  checkOut: string,
  guests: any[],
  residency: string
): Promise<any> {
  const body = {
    id: hotelId,
    checkin: checkIn,
    checkout: checkOut,
    guests,
    residency,
    language: ETG_LANGUAGE,
    currency: ETG_CURRENCY,
  };

  return etgFetch<any>('/search/hp/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Get static hotel info
 * POST /hotel/info/
 */
async function getHotelInfo(hotelId: string): Promise<any> {
  const body = {
    id: hotelId,
    language: ETG_LANGUAGE,
  };

  return etgFetch<any>('/hotel/info/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Prebook - validate rate before booking
 * POST /search/prebook/
 */
export async function prebookRate(bookHash: string): Promise<any> {
  const body = {
    hash: bookHash,
    price_increase_percent: 5, // Allow up to 5% price increase
  };

  return etgFetch<any>('/search/prebook/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Create booking
 * POST /orders/order/book/
 */
export async function createBooking(params: {
  bookHash: string;
  partnerOrderId: string;
  guests: Array<{
    firstName: string;
    lastName: string;
    isLeader?: boolean;
  }>;
  paymentType?: 'deposit' | 'now' | 'hotel';
}): Promise<any> {
  const body = {
    partner_order_id: params.partnerOrderId,
    book_hash: params.bookHash,
    language: ETG_LANGUAGE,
    user_ip: '127.0.0.1', // Should be real user IP in production
    guests: params.guests.map((g, i) => ({
      first_name: g.firstName,
      last_name: g.lastName,
      is_leader: i === 0 || g.isLeader,
    })),
    payment_type: params.paymentType ?? 'deposit',
  };

  return etgFetch<any>('/orders/order/book/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Get booking order info
 * POST /orders/order/info/
 */
export async function getOrderInfo(orderId: string): Promise<any> {
  const body = {
    partner_order_id: orderId,
    language: ETG_LANGUAGE,
  };

  return etgFetch<any>('/orders/order/info/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Cancel booking
 * POST /orders/order/cancel/
 */
export async function cancelOrder(orderId: string): Promise<any> {
  const body = {
    partner_order_id: orderId,
    language: ETG_LANGUAGE,
  };

  return etgFetch<any>('/orders/order/cancel/', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Adapter Implementation
// ─────────────────────────────────────────────────────────────────────────────
export const ratehawkAdapter: SupplierAdapter = {
  code: 'RATEHAWK',

  async search(params: SupplierSearchParams): Promise<SupplierHotelSummary[]> {
    if (!isRatehawkConfigured) {
      return localInventoryAdapter.search(params);
    }

    const {
      destination,
      checkIn,
      checkOut,
      adults = 2,
      children = 0,
      limit = 20,
    } = params;

    if (!destination) {
      return [];
    }

    // Resolve destination to region ID
    const regionId = await resolveRegionId(destination);
    if (!regionId) {
      return localInventoryAdapter.search(params);
    }

    const checkInDate = formatDate(checkIn);
    const checkOutDate = formatDate(checkOut ?? addDays(checkIn ?? addDays(new Date(), 1), 2));
    const guests = buildGuests(adults, children);

    try {
      const cacheKey = `etg-search:${regionId}:${checkInDate}:${checkOutDate}:${adults}:${children}:${limit}`;
      const data = await withCache(cacheKey, 1000 * 60, () =>
        searchByRegion(regionId, checkInDate, checkOutDate, guests, ETG_RESIDENCY, limit)
      );

      const hotels = data?.data?.hotels ?? [];
      return hotels.slice(0, limit).map(toHotelSummary);
    } catch (err: any) {
      if (err instanceof HttpError && (err.status === 429 || err.status === 403)) {
        console.warn('RateHawk quota/limit hit; falling back to local inventory');
        return localInventoryAdapter.search(params);
      }
      console.error('RateHawk search failed:', err);
      return localInventoryAdapter.search(params);
    }
  },

  async getHotelDetails(hotelId: string): Promise<SupplierHotelDetails | null> {
    if (!isRatehawkConfigured || !hotelId) {
      return localInventoryAdapter.getHotelDetails(hotelId);
    }

    const checkIn = formatDate();
    const checkOut = formatDate(addDays(new Date(), 2));
    const guests = buildGuests(2, 0);

    try {
      // Fetch both hotel info (static) and hotelpage (rates) in parallel
      const cacheKeyInfo = `etg-info:${hotelId}`;
      const cacheKeyRates = `etg-hp:${hotelId}:${checkIn}:${checkOut}`;

      const [hotelInfo, hotelpage] = await Promise.all([
        withCache(cacheKeyInfo, 1000 * 60 * 60 * 24, () => getHotelInfo(hotelId)),
        withCache(cacheKeyRates, 1000 * 60, () => getHotelpage(hotelId, checkIn, checkOut, guests, ETG_RESIDENCY)),
      ]);

      if (!hotelInfo?.data) {
        return localInventoryAdapter.getHotelDetails(hotelId);
      }

      return toHotelDetails(hotelInfo.data, hotelpage?.data);
    } catch (err: any) {
      if (err instanceof HttpError && (err.status === 429 || err.status === 403)) {
        console.warn(`RateHawk quota/limit on details for ${hotelId}; falling back to local`);
        return localInventoryAdapter.getHotelDetails(hotelId);
      }
      console.error(`RateHawk getHotelDetails failed for ${hotelId}:`, err);
      return localInventoryAdapter.getHotelDetails(hotelId);
    }
  },

  async getRatePlan(ratePlanId: string): Promise<SupplierRatePlan | null> {
    // Rate plans are embedded in hotel details responses
    // For prebook, use the prebookRate function directly with the book_hash
    return null;
  },
};

export default ratehawkAdapter;

