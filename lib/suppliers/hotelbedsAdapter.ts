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

// NO MOCKS - All data comes from real HotelBeds API

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

// HotelBeds destination codes for popular cities
// The content API search is unreliable, so we use a mapping
const DESTINATION_CODES: Record<string, string> = {
  'london': 'LON',
  'paris': 'PAR',
  'barcelona': 'BCN',
  'madrid': 'MAD',
  'rome': 'ROM',
  'milan': 'MIL',
  'amsterdam': 'AMS',
  'dubai': 'DXB',
  'new york': 'NYC',
  'los angeles': 'LAX',
  'miami': 'MIA',
  'las vegas': 'LAS',
  'tokyo': 'TYO',
  'singapore': 'SIN',
  'hong kong': 'HKG',
  'bangkok': 'BKK',
  'sydney': 'SYD',
  'melbourne': 'MEL',
  'lisbon': 'LIS',
  'vienna': 'VIE',
  'prague': 'PRG',
  'berlin': 'BER',
  'munich': 'MUC',
  'istanbul': 'IST',
  'maldives': 'MLE',
  'bali': 'DPS',
  'phuket': 'HKT',
  'cancun': 'CUN',
  'santorini': 'JTR',
  'mykonos': 'JMK',
  'ibiza': 'IBZ',
  'mallorca': 'PMI',
  'nice': 'NCE',
  'florence': 'FLR',
  'venice': 'VCE',
  'edinburgh': 'EDI',
  'manchester': 'MAN',
  'dublin': 'DUB',
  'athens': 'ATH',
  'zurich': 'ZRH',
  'geneva': 'GVA',
  'brussels': 'BRU',
  'copenhagen': 'CPH',
  'stockholm': 'STO',
  'oslo': 'OSL',
  'helsinki': 'HEL',
  'marrakech': 'RAK',
  'cairo': 'CAI',
  'cape town': 'CPT',
  'toronto': 'YTO',
  'vancouver': 'YVR',
  'montreal': 'YMQ',
};

async function resolveDestinationCode(query: string): Promise<string | undefined> {
  if (!query || !isHotelbedsConfigured) return undefined;
  const trimmed = query.trim();
  
  // If the user already typed an uppercase short code, accept it directly.
  const upper = trimmed.toUpperCase();
  if (/^[A-Z]{2,3}$/.test(upper)) {
    return upper;
  }

  // Check our mapping first (HotelBeds content API is unreliable)
  const lowerQuery = trimmed.toLowerCase();
  for (const [city, code] of Object.entries(DESTINATION_CODES)) {
    if (lowerQuery.includes(city) || city.includes(lowerQuery)) {
      console.log(`Resolved "${query}" to destination code: ${code}`);
      return code;
    }
  }

  // Fallback to API lookup (though it's unreliable)
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

// HotelBeds images base URL
const HB_PHOTOS_BASE = 'https://photos.hotelbeds.com/giata';

// Build full image URL from HotelBeds image path
function buildImageUrl(imagePath: string, size: 'standard' | 'bigger' | 'large' | 'xlarge' = 'bigger'): string {
  // imagePath from HotelBeds is like: "12/123456/123456a_hb_a_001.jpg"
  // We need to prepend the base URL and size
  if (imagePath.startsWith('http')) return imagePath;
  return `${HB_PHOTOS_BASE}/${size}/${imagePath}`;
}

// Fetch hotel content including images from HotelBeds Content API
async function fetchHotelContent(hotelCode: string): Promise<{
  images: Array<{ id: string; url: string; caption: string; isPrimary?: boolean }>;
  description?: string;
  amenities: string[];
  address?: string;
  email?: string;
  phone?: string;
  web?: string;
  coordinates?: { latitude: number; longitude: number };
} | null> {
  // HotelBeds requires NUMERIC hotel codes, not slugs
  const numericCode = Number(hotelCode);
  if (!Number.isFinite(numericCode) || numericCode <= 0) {
    console.log(`Skipping HotelBeds content API - invalid hotel code: "${hotelCode}"`);
    return null;
  }

  const cacheKey = `hb-content:${hotelCode}`;
  
  try {
    const data = await withCache(
      cacheKey,
      1000 * 60 * 60 * 24, // 24h cache - static content doesn't change often
      () => hbFetch<any>(`/hotel-content-api/1.0/hotels/${numericCode}?language=${HB_LANGUAGE}&useSecondaryLanguage=false`),
    );
    
    const hotel = data?.hotel;
    if (!hotel) return null;
    
    // Map images
    const images = (hotel.images ?? []).map((img: any, idx: number) => ({
      id: `img-${idx}`,
      url: buildImageUrl(img.path || '', 'bigger'),
      caption: img.roomType ?? img.typeDescription?.content ?? img.characteristicDescription?.content ?? 'Hotel Photo',
      isPrimary: idx === 0 || img.type?.code === 'GEN',
    })).filter((img: any) => img.url && !img.url.endsWith('/'));
    
    // Map amenities/facilities
    const amenities = (hotel.facilities ?? []).map((f: any) => 
      f.description?.content ?? f.facilityName ?? ''
    ).filter(Boolean);
    
    return {
      images,
      description: hotel.description?.content,
      amenities,
      address: hotel.address?.content,
      email: hotel.email,
      phone: hotel.phones?.[0]?.phoneNumber,
      web: hotel.web,
      coordinates: hotel.coordinates ? {
        latitude: hotel.coordinates.latitude,
        longitude: hotel.coordinates.longitude,
      } : undefined,
    };
  } catch (err) {
    console.warn(`Failed to fetch hotel content for ${hotelCode}:`, err);
    return null;
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

// Convert cryptic HotelBeds rate codes to friendly names
function getFriendlyRateName(rateClass: string | undefined, boardName: string | undefined, isRefundable: boolean): string {
  const code = (rateClass || '').toUpperCase();
  
  // Map common HotelBeds rate codes to friendly names
  const codeMap: Record<string, string> = {
    'NOR': 'Standard Rate',
    'NRF': 'Non-Refundable',
    'GOV': 'Government Rate',
    'AAA': 'AAA Member Rate',
    'SEN': 'Senior Rate',
    'PKG': 'Package Rate',
    'PRO': 'Promotional Rate',
    'OFR': 'Special Offer',
    'COR': 'Corporate Rate',
    'RAC': 'Rack Rate',
  };

  // Check for matching code
  for (const [key, value] of Object.entries(codeMap)) {
    if (code.includes(key)) return value;
  }

  // Fallback: use board name if it's descriptive
  if (boardName && boardName.length > 3 && !boardName.match(/^[A-Z]{2,4}$/)) {
    return boardName;
  }

  // Final fallback based on refundability
  return isRefundable ? 'Flexible Rate' : 'Non-Refundable Rate';
}

function toRatePlan(rate: any, nights: number = 1): SupplierRatePlan {
  const isRefundable = Array.isArray(rate.cancellationPolicies) && rate.cancellationPolicies.length > 0;
  const boardType = mapBoard(rate.boardCode, rate.boardName);
  const paymentType = mapPayment(rate.paymentType);
  const rateType = mapRateType(rate.rateClass || rate.rateType, isRefundable);
  
  // HotelBeds returns TOTAL prices, divide by nights for per-night rate
  const totalBaseRate = Number(rate.net ?? rate.sellingRate ?? 0);
  const baseRate = nights > 0 ? Math.round(totalBaseRate / nights) : totalBaseRate;
  
  const taxes = Array.isArray(rate.taxes?.taxes)
    ? rate.taxes.taxes.reduce((sum: number, tax: any) => sum + Number(tax.amount ?? 0), 0)
    : 0;
  const fees = 0;
  const totalForStay = Number(rate.sellingRate ?? rate.net ?? 0) + taxes + fees;
  const totalAmount = nights > 0 ? Math.round(totalForStay / nights) : totalForStay;
  const refundableUntil = isRefundable
    ? rate.cancellationPolicies?.[0]?.from
    : null;

  return {
    id: rate.rateKey ?? crypto.randomUUID(),
    name: getFriendlyRateName(rate.rateClass, rate.boardName, isRefundable),
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

function toHotelSummary(hotel: any, nights: number = 1): SupplierHotelSummary {
  // hotel.minRate is the TOTAL price for the entire stay, NOT per night
  // We need to divide by nights to get the per-night rate
  const totalPrice = Number(hotel.minRate) || 0;
  const currency = hotel.currency ?? HB_CURRENCY;
  const firstRate = hotel?.rooms?.[0]?.rates?.[0];
  const ratePlan = firstRate ? toRatePlan(firstRate, nights) : null;
  
  // Calculate per-night rate by dividing total by number of nights
  const perNightRate = nights > 0 && totalPrice > 0 
    ? Math.round(totalPrice / nights) 
    : (ratePlan?.baseRate ?? null);
  const startingRate = perNightRate;
  
  return {
    id: String(hotel.code),
    slug: String(hotel.code),
    name: hotel.name?.content ?? hotel.name ?? `Hotel ${hotel.code}`,
    headline: undefined,
    location: hotel.destinationName ?? hotel.zoneName ?? '',
    city: hotel.destinationName ?? hotel.zoneName ?? '',
    country: hotel.countryCode ?? '',
    rating: parseCategory(hotel.categoryName ?? hotel.categoryCode),
    reviewCount: 0,
    currency,
    startingRate,
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
          baseRate: perNightRate || ratePlan.baseRate,
          currency,
          isRefundable: ratePlan.isRefundable,
          availableRooms: ratePlan.availableRooms,
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

    // Calculate number of nights for per-night rate calculation
    const checkInDate = new Date(body.stay.checkIn);
    const checkOutDate = new Date(body.stay.checkOut);
    const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

    try {
      const cacheKey = `hb-search:${destinationCode}:${body.stay.checkIn}:${body.stay.checkOut}:${adults}:${children}:${rooms}:${limit}`;
      const data = await withCache(cacheKey, 1000 * 60, () => availabilityRequest(body));
      const hotels = data?.hotels?.hotels ?? [];
      console.log(`HotelBeds returned ${hotels.length} hotels for ${destinationCode} (${nights} nights)`);
      
      // If HotelBeds returns 0 results, return empty - NO MOCKS
      if (hotels.length === 0) {
        console.log('HotelBeds returned 0 hotels for', destinationCode);
        return [];
      }
      
      // Pass nights to calculate per-night rates
      return hotels.map((hotel: any) => toHotelSummary(hotel, nights));
    } catch (err: any) {
      console.error('HotelBeds search error:', err.message || err);
      // NO MOCKS - throw the error so it's visible
      throw new Error(`HotelBeds API failed: ${err.message || 'Unknown error'}`);
    }
  },

  async getHotelDetails(hotelId: string): Promise<SupplierHotelDetails | null> {
    if (!isHotelbedsConfigured || !hotelId) return null;

    // HotelBeds requires NUMERIC hotel IDs, not slugs
    // If the ID is not a valid number, skip the API call entirely
    const numericId = Number(hotelId);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      console.log(`Skipping HotelBeds API call - invalid hotel ID: "${hotelId}" (expected numeric ID)`);
      return null;
    }

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
        hotel: [numericId],
      },
      sourceMarket: HB_SOURCE_MARKET,
      language: HB_LANGUAGE,
    };

    try {
      // Fetch availability and content in parallel
      const [availabilityData, contentData] = await Promise.all([
        withCache(`hb-details:${hotelId}`, 1000 * 60, () => availabilityRequest(body)),
        fetchHotelContent(hotelId),
      ]);
      
      const hotel = availabilityData?.hotels?.hotels?.[0];
      if (!hotel) return null;
      
      const details = toHotelDetails(hotel);
      
      // Enrich with content data (images, description, amenities)
      if (contentData) {
        if (contentData.images.length > 0) {
          details.images = contentData.images;
          details.heroImage = contentData.images.find(img => img.isPrimary)?.url || contentData.images[0]?.url;
          details.primaryImage = details.heroImage;
        }
        if (contentData.description) {
          details.description = contentData.description;
        }
        if (contentData.amenities.length > 0) {
          details.amenities = contentData.amenities;
        }
        if (contentData.coordinates) {
          details.latitude = contentData.coordinates.latitude;
          details.longitude = contentData.coordinates.longitude;
        }
      }
      
      // NO IMAGE FALLBACKS - show real data only
      // If no images, details.images will be empty
      
      return details;
    } catch (err: any) {
      console.error(`HotelBeds getHotelDetails failed for ${hotelId}:`, err.message || err);
      // NO MOCKS - return null so UI shows the error
      return null;
    }
  },

  async getRatePlan(ratePlanId: string): Promise<SupplierRatePlan | null> {
    // HotelBeds requires re-checking with rateKey; here we return null to force client to rely on hotel details call.
    return null;
  },
};

export default hotelbedsAdapter;

