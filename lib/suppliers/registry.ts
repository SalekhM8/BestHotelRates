import { SupplierAdapter, SupplierHotelSummary, SupplierSearchParams } from './types';
import { localInventoryAdapter } from './localInventoryAdapter';
import { hotelbedsAdapter, isHotelbedsConfigured } from './hotelbedsAdapter';
import { ratehawkAdapter, isRatehawkConfigured } from './ratehawkAdapter';

const DEFAULT_SUPPLIER = process.env.DEFAULT_SUPPLIER?.toUpperCase() ?? 'LOCAL';

/**
 * Get the primary supplier adapter based on environment configuration
 */
export function getSupplierAdapter(_code?: string): SupplierAdapter {
  const code = _code?.toUpperCase() ?? DEFAULT_SUPPLIER;

  if (code === 'RATEHAWK' && isRatehawkConfigured) {
    return ratehawkAdapter;
  }

  if (code === 'HOTELBEDS' && isHotelbedsConfigured) {
    return hotelbedsAdapter;
  }

  return localInventoryAdapter;
}

/**
 * Get all configured supplier adapters
 */
export function getAllConfiguredAdapters(): SupplierAdapter[] {
  const adapters: SupplierAdapter[] = [localInventoryAdapter];

  if (isRatehawkConfigured) {
    adapters.push(ratehawkAdapter);
  }

  if (isHotelbedsConfigured) {
    adapters.push(hotelbedsAdapter);
  }

  return adapters;
}

/**
 * Multi-supplier search - query all configured suppliers in parallel
 * and return deduplicated results with the best price per hotel
 */
export async function multiSupplierSearch(
  params: SupplierSearchParams
): Promise<SupplierHotelSummary[]> {
  const adapters = getAllConfiguredAdapters();

  // Query all suppliers in parallel
  const results = await Promise.allSettled(
    adapters.map(adapter => adapter.search(params))
  );

  // Collect all successful results
  const allHotels: SupplierHotelSummary[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allHotels.push(...result.value);
    }
  }

  // Deduplicate by hotel name (or ID if available)
  // Keep the one with the lowest price
  const hotelMap = new Map<string, SupplierHotelSummary>();

  for (const hotel of allHotels) {
    // Use a normalized key for deduplication
    const key = hotel.name.toLowerCase().replace(/\s+/g, '-');
    const existing = hotelMap.get(key);

    if (!existing) {
      hotelMap.set(key, hotel);
    } else {
      // Keep the one with lower price
      const existingPrice = existing.startingRate ?? Infinity;
      const newPrice = hotel.startingRate ?? Infinity;
      if (newPrice < existingPrice) {
        hotelMap.set(key, hotel);
      }
    }
  }

  // Convert back to array and sort by price
  const deduplicated = Array.from(hotelMap.values());

  // Sort based on params
  if (params.sortBy === 'price-asc') {
    deduplicated.sort((a, b) => (a.startingRate ?? 0) - (b.startingRate ?? 0));
  } else if (params.sortBy === 'price-desc') {
    deduplicated.sort((a, b) => (b.startingRate ?? 0) - (a.startingRate ?? 0));
  } else if (params.sortBy === 'rating') {
    deduplicated.sort((a, b) => b.rating - a.rating);
  }

  return deduplicated.slice(0, params.limit ?? 50);
}

/**
 * Get the supplier code for a given adapter
 */
export function getSupplierCode(adapter: SupplierAdapter): string {
  return adapter.code;
}
