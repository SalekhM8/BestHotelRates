import { AddOnType, BoardType, PaymentType, RateType } from '@prisma/client';

export type SupplierSearchParams = {
  destination?: string;
  checkIn?: Date;
  checkOut?: Date;
  adults?: number;
  children?: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'rating';
  limit?: number;
};

export type SupplierHotelSummary = {
  id: string;
  slug: string;
  name: string;
  headline?: string | null;
  location: string;
  city: string;
  country: string;
  rating: number;
  reviewCount: number;
  currency: string;
  startingRate?: number | null;
  heroImage?: string | null;
  primaryImage?: string | null;
  tags?: unknown;
  categories: string[];
  supplierCode?: string | null;
  minRatePlan?: {
    id: string;
    name: string;
    boardType: BoardType;
    rateType: RateType;
    paymentType: PaymentType;
    baseRate: number;
    currency: string;
  } | null;
};

export type SupplierAmenity = {
  id: string;
  name: string;
  category: string;
};

export type SupplierImage = {
  id: string;
  url: string;
  caption?: string | null;
  isPrimary?: boolean;
};

export type SupplierAddOn = {
  id: string;
  name: string;
  type: AddOnType;
  price: number;
  currency: string;
  isPerNight: boolean;
  isComplimentary: boolean;
  description?: string | null;
};

export type SupplierRatePlan = {
  id: string;
  name: string;
  boardType: BoardType;
  rateType: RateType;
  paymentType: PaymentType;
  isRefundable: boolean;
  currency: string;
  baseRate: number;
  taxes: number;
  fees: number;
  totalAmount: number;
  nightlyBreakdown?: unknown;
  promotions?: unknown;
  inclusions?: unknown;
  includeBreakfast: boolean;
  availableRooms: number;
  cancellationPolicy?: {
    name: string;
    description?: string | null;
    refundableUntilHours?: number | null;
    policyText?: string | null;
  } | null;
  addOns: {
    id: string;
    name: string;
    type: AddOnType;
    included: boolean;
    additionalPrice?: number | null;
  }[];
};

export type SupplierRoomType = {
  id: string;
  name: string;
  description?: string | null;
  sizeSqm?: number | null;
  view?: string | null;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  isSuite: boolean;
  images: SupplierImage[];
  amenities: SupplierAmenity[];
  ratePlans: SupplierRatePlan[];
};

export type SupplierHotelDetails = SupplierHotelSummary & {
  description?: string | null;
  reviewScore?: number | null;
  reviewCount: number;
  amenities: SupplierAmenity[];
  images: SupplierImage[];
  addOns: SupplierAddOn[];
  roomTypes: SupplierRoomType[];
};

export interface SupplierAdapter {
  code: string;
  search(params: SupplierSearchParams): Promise<SupplierHotelSummary[]>;
  getHotelDetails(hotelId: string): Promise<SupplierHotelDetails | null>;
  getRatePlan(ratePlanId: string): Promise<SupplierRatePlan | null>;
}

