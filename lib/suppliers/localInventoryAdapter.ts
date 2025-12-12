import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  SupplierAdapter,
  SupplierHotelDetails,
  SupplierHotelSummary,
  SupplierRatePlan,
  SupplierSearchParams,
} from './types';

const buildHotelSummary = (
  hotel: Prisma.HotelGetPayload<typeof hotelSummaryInclude>,
): SupplierHotelSummary => {
  const primaryImage = hotel.images.find((img) => img.isPrimary) ?? hotel.images[0];
  const minRatePlan = hotel.roomTypes
    .flatMap((room) => room.ratePlans)
    .sort((a, b) => a.baseRate - b.baseRate)[0];

  return {
    id: hotel.id,
    slug: hotel.slug,
    name: hotel.name,
    headline: hotel.headline,
    location: `${hotel.city}, ${hotel.country}`,
    city: hotel.city,
    country: hotel.country,
    rating: hotel.reviewScore ?? 0,
    reviewCount: hotel.reviewCount ?? 0,
    currency: hotel.defaultCurrency,
    startingRate: hotel.minRate,
    heroImage: hotel.heroImage ?? primaryImage?.url,
    primaryImage: primaryImage?.url ?? hotel.heroImage ?? undefined,
    tags: hotel.tags,
    categories: hotel.categories.map((c) => c.category.slug),
    supplierCode: hotel.supplier?.code,
    minRatePlan: minRatePlan
      ? {
          id: minRatePlan.id,
          name: minRatePlan.name,
          boardType: minRatePlan.boardType,
          rateType: minRatePlan.rateType,
          paymentType: minRatePlan.paymentType,
          baseRate: minRatePlan.baseRate,
          currency: minRatePlan.currency,
          isRefundable: minRatePlan.isRefundable ?? false,
        }
      : null,
  };
};

const hotelSummaryInclude = {
  include: {
    images: {
      where: { isPrimary: true },
      take: 1,
      orderBy: { sortOrder: 'asc' },
    },
    categories: {
      include: { category: true },
    },
    supplier: true,
    roomTypes: {
      take: 1,
      orderBy: { sortOrder: 'asc' },
      include: {
        ratePlans: {
          take: 1,
          orderBy: { baseRate: 'asc' },
        },
      },
    },
  },
} satisfies Prisma.HotelFindManyArgs;

const localInventoryAdapter: SupplierAdapter = {
  code: 'LOCAL_MOCK',

  async search(params: SupplierSearchParams) {
    const {
      destination,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'rating',
      limit = 24,
    } = params;
    const destinationLower = destination?.toLowerCase();

    const hotels = await prisma.hotel.findMany({
      where: {
        ...(destination && {
          OR: [
            { city: { contains: destination } },
            { name: { contains: destination } },
            { region: { contains: destination } },
          ],
        }),
        ...(minRating && { reviewScore: { gte: minRating } }),
      },
      orderBy:
        sortBy === 'price-asc'
          ? { minRate: 'asc' }
          : sortBy === 'price-desc'
            ? { minRate: 'desc' }
            : { reviewScore: 'desc' },
      take: limit,
      ...hotelSummaryInclude,
    });

    const summaries = hotels.map(buildHotelSummary);

    return summaries.filter((hotel) => {
      if (
        destinationLower &&
        !(
          hotel.city.toLowerCase().includes(destinationLower) ||
          hotel.name.toLowerCase().includes(destinationLower) ||
          (hotel.location ?? '').toLowerCase().includes(destinationLower)
        )
      ) {
        return false;
      }
      if (minPrice && hotel.startingRate && hotel.startingRate < minPrice) return false;
      if (maxPrice && hotel.startingRate && hotel.startingRate > maxPrice) return false;
      return true;
    });
  },

  async getHotelDetails(hotelIdentifier: string): Promise<SupplierHotelDetails | null> {
    if (!hotelIdentifier) return null;

    const hotel = await prisma.hotel.findFirst({
      where: {
        OR: [
          { id: hotelIdentifier },
          { slug: hotelIdentifier },
        ],
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        supplier: true,
        categories: { include: { category: true } },
        amenities: { include: { amenity: true }, orderBy: { priority: 'asc' } },
        addOns: {
          orderBy: { sortOrder: 'asc' },
        },
        roomTypes: {
          orderBy: { sortOrder: 'asc' },
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            amenities: { include: { amenity: true } },
            ratePlans: {
              orderBy: { baseRate: 'asc' },
              include: {
                cancellationPolicy: true,
                addOns: {
                  include: { addOn: true },
                },
              },
            },
          },
        },
      },
    });

    if (!hotel) return null;

    const primarySummary = buildHotelSummary({
      ...hotel,
      images: hotel.images,
      roomTypes: hotel.roomTypes,
    } as any);

    return {
      ...primarySummary,
      description: hotel.description,
      rating: hotel.reviewScore ?? 0,
      reviewScore: hotel.reviewScore,
      reviewCount: hotel.reviewCount ?? 0,
      amenities: hotel.amenities.map(({ amenity }) => ({
        id: amenity.id,
        name: amenity.name,
        category: amenity.category,
      })),
      images: hotel.images.map((image) => ({
        id: image.id,
        url: image.url,
        caption: image.caption,
        isPrimary: image.isPrimary,
      })),
      addOns: hotel.addOns.map((addOn) => ({
        id: addOn.id,
        name: addOn.name,
        type: addOn.type,
        price: addOn.price,
        currency: addOn.currency,
        isPerNight: addOn.isPerNight,
        isComplimentary: addOn.isComplimentary,
        description: addOn.description,
      })),
      roomTypes: hotel.roomTypes.map((room) => ({
        id: room.id,
        name: room.name,
        description: room.description,
        sizeSqm: room.sizeSqm,
        view: room.view,
        maxAdults: room.maxAdults,
        maxChildren: room.maxChildren,
        maxOccupancy: room.maxOccupancy,
        isSuite: room.isSuite,
        images: room.images.map((image) => ({
          id: image.id,
          url: image.url,
          caption: image.caption,
          isPrimary: image.isPrimary,
        })),
        amenities: room.amenities.map(({ amenity }) => ({
          id: amenity.id,
          name: amenity.name,
          category: amenity.category,
        })),
        ratePlans: room.ratePlans.map(mapRatePlan),
      })),
    };
  },

  async getRatePlan(ratePlanId: string): Promise<SupplierRatePlan | null> {
    const ratePlan = await prisma.ratePlan.findUnique({
      where: { id: ratePlanId },
      include: {
        cancellationPolicy: true,
        addOns: { include: { addOn: true } },
      },
    });

    if (!ratePlan) return null;

    return mapRatePlan(ratePlan);
  },
};

const mapRatePlan = (
  ratePlan: Prisma.RatePlanGetPayload<{
    include: {
      cancellationPolicy: true;
      addOns: { include: { addOn: true } };
    };
  }>,
): SupplierRatePlan => ({
  id: ratePlan.id,
  name: ratePlan.name,
  boardType: ratePlan.boardType,
  rateType: ratePlan.rateType,
  paymentType: ratePlan.paymentType,
  isRefundable: ratePlan.isRefundable,
  currency: ratePlan.currency,
  baseRate: ratePlan.baseRate,
  taxes: ratePlan.taxes,
  fees: ratePlan.fees,
  totalAmount: ratePlan.totalAmount,
  nightlyBreakdown: ratePlan.nightlyBreakdown,
  promotions: ratePlan.promotions,
  inclusions: ratePlan.inclusions,
  includeBreakfast: ratePlan.includeBreakfast,
  availableRooms: ratePlan.availableRooms,
  cancellationPolicy: ratePlan.cancellationPolicy
    ? {
        name: ratePlan.cancellationPolicy.name,
        description: ratePlan.cancellationPolicy.description,
        refundableUntilHours: ratePlan.cancellationPolicy.refundableUntilHours,
        policyText: ratePlan.cancellationPolicy.policyText,
      }
    : null,
  addOns: ratePlan.addOns.map((item) => ({
    id: item.addOn.id,
    name: item.addOn.name,
    type: item.addOn.type,
    included: item.included,
    additionalPrice: item.additionalPrice,
  })),
});

export { localInventoryAdapter };

