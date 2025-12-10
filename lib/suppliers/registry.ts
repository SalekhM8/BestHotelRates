import { SupplierAdapter } from './types';
import { localInventoryAdapter } from './localInventoryAdapter';
import { hotelbedsAdapter, isHotelbedsConfigured } from './hotelbedsAdapter';

const SUPPLIER = process.env.DEFAULT_SUPPLIER?.toUpperCase() ?? 'LOCAL';

export const getSupplierAdapter = (_code?: string): SupplierAdapter => {
  if (SUPPLIER === 'HOTELBEDS' && isHotelbedsConfigured) {
    return hotelbedsAdapter;
  }
  return localInventoryAdapter;
};



