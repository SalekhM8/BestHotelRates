import { AddOnType, BoardType, PaymentType, Prisma, PrismaClient, RateType } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

type RatePlanSeed = {
  name: string;
  code?: string;
  description?: string;
  boardType: BoardType;
  rateType: RateType;
  paymentType: PaymentType;
  isRefundable: boolean;
  cancellationPolicyName: string;
  currency?: string;
  baseRate: number;
  taxes: number;
  fees: number;
  totalBeforeTaxes?: number;
  totalAmount?: number;
  minStay?: number;
  maxStay?: number;
  includeBreakfast?: boolean;
  availableRooms?: number;
  nightlyBreakdown?: Prisma.JsonValue;
  promotions?: Prisma.JsonValue;
  inclusions?: Prisma.JsonValue;
  addOns?: {
    name: string;
    included?: boolean;
    additionalPrice?: number;
  }[];
};

type RoomTypeSeed = {
  name: string;
  description: string;
  sizeSqm: number;
  view?: string;
  maxAdults: number;
  maxChildren: number;
  maxOccupancy: number;
  totalInventory: number;
  isSuite?: boolean;
  amenities: string[];
  images: { url: string; caption?: string; isPrimary?: boolean }[];
  ratePlans: RatePlanSeed[];
};

type HotelSeed = {
  name: string;
  slug?: string;
  headline: string;
  description: string;
  country: string;
  city: string;
  region?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  starRating: number;
  reviewScore: number;
  reviewCount: number;
  heroImage: string;
  featured?: boolean;
  supplierCode?: string;
  categories: string[];
  amenities: string[];
  tags?: Prisma.JsonValue;
  images: { url: string; caption?: string; isPrimary?: boolean }[];
  addOns: {
    name: string;
    type: AddOnType;
    price: number;
    currency?: string;
    isPerNight?: boolean;
    isComplimentary?: boolean;
    description?: string;
  }[];
  roomTypes: RoomTypeSeed[];
};

const supplierSeeds = [
  {
    name: 'RateHawk',
    code: 'RATEHAWK',
    apiType: 'ETG',
    baseUrl: 'https://api.ratehawk.com',
  },
  {
    name: 'HotelBeds',
    code: 'HOTELBEDS',
    apiType: 'HOTELBEDS',
    baseUrl: 'https://api.hotelbeds.com',
  },
];

const categorySeeds = [
  { name: 'Luxury', slug: 'luxury', description: 'Flagship five-star stays' },
  { name: 'Boutique', slug: 'boutique', description: 'Design-led intimate hotels' },
  { name: 'Beach', slug: 'beach', description: 'Coastal and island escapes' },
  { name: 'Wellness', slug: 'wellness', description: 'Spa & wellbeing retreats' },
  { name: 'Business', slug: 'business', description: 'Executive-friendly properties' },
  { name: 'Desert', slug: 'desert', description: 'Remote desert experiences' },
  { name: 'City Break', slug: 'city', description: 'Iconic urban addresses' },
];

const amenitySeeds = [
  { name: 'Complimentary WiFi', slug: 'wifi', category: 'GENERAL', icon: 'wifi' },
  { name: 'Infinity Pool', slug: 'infinity-pool', category: 'WELLNESS', icon: 'waves' },
  { name: 'Holistic Spa', slug: 'spa', category: 'WELLNESS', icon: 'spa' },
  { name: 'Signature Restaurant', slug: 'restaurant', category: 'DINING', icon: 'restaurant' },
  { name: 'Champagne Bar', slug: 'bar', category: 'DINING', icon: 'glass' },
  { name: '24/7 Butler Service', slug: 'butler', category: 'LUXURY', icon: 'bell' },
  { name: 'Curated Concierge', slug: 'concierge', category: 'LUXURY', icon: 'concierge' },
  { name: 'Private Beach', slug: 'private-beach', category: 'LUXURY', icon: 'umbrella' },
  { name: 'Kids Club', slug: 'kids-club', category: 'FAMILY', icon: 'kite' },
  { name: 'Executive Lounge', slug: 'business-lounge', category: 'BUSINESS', icon: 'briefcase' },
  { name: 'Rooftop Lounge', slug: 'rooftop-lounge', category: 'LUXURY', icon: 'city' },
  { name: 'Performance Gym', slug: 'gym', category: 'WELLNESS', icon: 'dumbbell' },
  { name: 'Zen Garden', slug: 'zen-garden', category: 'WELLNESS', icon: 'leaf' },
  { name: 'Onsen Suites', slug: 'onsen', category: 'WELLNESS', icon: 'steam' },
  { name: 'Tea Salon', slug: 'tea-salon', category: 'DINING', icon: 'tea' },
  { name: 'Helipad Transfers', slug: 'helipad', category: 'TRANSPORT', icon: 'helicopter' },
  { name: 'Chauffeur Fleet', slug: 'chauffeur', category: 'TRANSPORT', icon: 'car' },
];

const cancellationPolicies = [
  {
    name: 'Flexible 72h',
    description: 'Full refund up to 72 hours before arrival.',
    refundableUntilHours: 72,
    policyText: 'Cancel up to 72h before check-in for a full refund. Within 72h the first night is charged.',
  },
  {
    name: 'Semi-Flex 7d',
    description: '50% refund up to 7 days before arrival.',
    refundableUntilHours: 168,
    policyText: 'Cancel up to 7 days before arrival for 50% refund. Within 7 days reservation becomes non-refundable.',
  },
  {
    name: 'Non-refundable',
    description: 'Best rate, no refunds after booking.',
    refundableUntilHours: 0,
    policyText: 'Immediately non-refundable once confirmed. Name changes subject to supplier approval.',
  },
];

const hotelInventory: HotelSeed[] = [
  {
    name: 'Aurora Royal London',
    headline: 'Skyline suites overlooking Westminster with bespoke butler service',
    description:
      'Set above the Thames, Aurora Royal pairs glasshouse suites with Michelin-starred dining, chauffeured Rolls Royce transfers, and a members-only club lounge. Designed for discerning travelers seeking privacy with instant city access.',
    country: 'United Kingdom',
    city: 'London',
    region: 'Westminster',
    address: '1 Westminster Bridge Road, London SE1',
    latitude: 51.5007,
    longitude: -0.1246,
    starRating: 5,
    reviewScore: 4.92,
    reviewCount: 1287,
    heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop',
    featured: true,
    supplierCode: 'RATEHAWK',
    categories: ['luxury', 'boutique', 'city'],
    amenities: ['wifi', 'spa', 'restaurant', 'bar', 'butler', 'concierge', 'business-lounge', 'gym'],
    tags: ['River views', 'Butler service'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1400&h=900&fit=crop',
        caption: 'Skyline suite',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1400&h=900&fit=crop',
        caption: 'Atrium lobby',
      },
      {
        url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1400&h=900&fit=crop',
        caption: 'Private dining',
      },
    ],
    addOns: [
      {
        name: 'Late Checkout 4 PM',
        type: AddOnType.LATE_CHECKOUT,
        price: 120,
        description: 'Extend your stay until 4 PM (subject to availability).',
      },
      {
        name: 'Chauffeur Transfer',
        type: AddOnType.AIRPORT_TRANSFER,
        price: 180,
        description: 'BMW 7 Series private transfer for up to 3 guests.',
      },
      {
        name: 'Private Thames Cruise',
        type: AddOnType.EXPERIENCE,
        price: 320,
        description: '60-minute sunset cruise with champagne.',
      },
    ],
    roomTypes: [
      {
        name: 'Skyline Deluxe King',
        description: '52 sqm panoramic room with river-facing daybed and spa bathroom.',
        sizeSqm: 52,
        view: 'River Thames',
        maxAdults: 2,
        maxChildren: 1,
        maxOccupancy: 3,
        totalInventory: 12,
        amenities: ['wifi', 'butler', 'business-lounge'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&h=800&fit=crop',
            isPrimary: true,
            caption: 'Skyline Deluxe King',
          },
          {
            url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&h=800&fit=crop',
            caption: 'Marble bathroom',
          },
        ],
        ratePlans: [
          {
            name: 'Flexible Breakfast Included',
            boardType: BoardType.BED_AND_BREAKFAST,
            rateType: RateType.STANDARD,
            paymentType: PaymentType.PREPAID,
            isRefundable: true,
            cancellationPolicyName: 'Flexible 72h',
            baseRate: 420,
            taxes: 65,
            fees: 20,
            includeBreakfast: true,
            availableRooms: 5,
            nightlyBreakdown: [
              { label: 'Night 1', amount: 420 },
              { label: 'Night 2', amount: 420 },
            ],
            promotions: [{ label: 'Lounge Access', value: 'Complimentary for flexible guests' }],
            addOns: [
              { name: 'Late Checkout 4 PM' },
              { name: 'Chauffeur Transfer' },
            ],
          },
          {
            name: 'Advance Purchase Non-refundable',
            boardType: BoardType.ROOM_ONLY,
            rateType: RateType.NON_REFUNDABLE,
            paymentType: PaymentType.PREPAID,
            isRefundable: false,
            cancellationPolicyName: 'Non-refundable',
            baseRate: 360,
            taxes: 56,
            fees: 18,
            availableRooms: 4,
            nightlyBreakdown: [{ label: 'Night 1', amount: 360 }],
            promotions: [{ label: 'Save 15%', value: 'Advance purchase saver' }],
            addOns: [{ name: 'Chauffeur Transfer' }],
          },
        ],
      },
      {
        name: 'Thames Signature Suite',
        description: '110 sqm corner suite with dining salon, butler pantry, and Peloton studio.',
        sizeSqm: 110,
        view: 'London skyline',
        maxAdults: 3,
        maxChildren: 2,
        maxOccupancy: 4,
        totalInventory: 6,
        isSuite: true,
        amenities: ['wifi', 'spa', 'concierge', 'butler'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&h=900&fit=crop',
            isPrimary: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1400&h=900&fit=crop',
          },
        ],
        ratePlans: [
          {
            name: 'Suite Retreat with Lounge',
            boardType: BoardType.BED_AND_BREAKFAST,
            rateType: RateType.STANDARD,
            paymentType: PaymentType.PREPAID,
            isRefundable: true,
            cancellationPolicyName: 'Flexible 72h',
            baseRate: 620,
            taxes: 95,
            fees: 28,
            includeBreakfast: true,
            availableRooms: 3,
            nightlyBreakdown: [
              { label: 'Night 1', amount: 620 },
              { label: 'Night 2', amount: 640 },
            ],
            promotions: [{ label: 'Suite Perks', value: 'Butler welcome ritual + spa circuit' }],
            addOns: [
              { name: 'Late Checkout 4 PM', included: true },
              { name: 'Private Thames Cruise' },
            ],
          },
          {
            name: 'Chauffeur Inclusive Suite',
            boardType: BoardType.BED_AND_BREAKFAST,
            rateType: RateType.PACKAGE,
            paymentType: PaymentType.DEPOSIT,
            isRefundable: true,
            cancellationPolicyName: 'Semi-Flex 7d',
            baseRate: 680,
            taxes: 102,
            fees: 32,
            includeBreakfast: true,
            availableRooms: 2,
            nightlyBreakdown: [{ label: 'Night 1', amount: 680 }],
            promotions: [{ label: 'Daily Transfers', value: 'Round-trip chauffeurs included' }],
            addOns: [
              { name: 'Chauffeur Transfer', included: true },
              { name: 'Private Thames Cruise' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Azure Mirage Dubai',
    headline: 'A floating glass oasis on The Palm with overwater cabanas and helipad arrivals',
    description:
      'Azure Mirage curates bespoke desert-to-sea experiences with overwater hammams, a Himalayan salt lounge, and Michelin-partnered chefs. Designed for epic sundowners and discreet celebrity stays.',
    country: 'United Arab Emirates',
    city: 'Dubai',
    region: 'Palm Jumeirah',
    starRating: 5,
    reviewScore: 4.96,
    reviewCount: 2143,
    heroImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&h=900&fit=crop',
    featured: true,
    supplierCode: 'HOTELBEDS',
    categories: ['luxury', 'beach', 'wellness'],
    amenities: ['wifi', 'infinity-pool', 'spa', 'private-beach', 'kids-club', 'concierge', 'helipad'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1600&h=900&fit=crop',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1400&h=900&fit=crop',
      },
      {
        url: 'https://images.unsplash.com/photo-1541971875078-6c5c1b8ca1f4?w=1400&h=900&fit=crop',
      },
    ],
    addOns: [
      {
        name: 'Airport Bentley Transfer',
        type: AddOnType.AIRPORT_TRANSFER,
        price: 220,
      },
      {
        name: 'Private Cabana Experience',
        type: AddOnType.EXPERIENCE,
        price: 150,
        description: 'Beachfront cabana with host & chilled Veuve.',
      },
      {
        name: 'Desert Sunrise Helicopter',
        type: AddOnType.EXCURSION,
        price: 740,
      },
      {
        name: 'Talise Spa Journey',
        type: AddOnType.SPA,
        price: 260,
      },
    ],
    roomTypes: [
      {
        name: 'Palm View Club Room',
        description: '68 sqm club-level room with sunset terrace and spa soaking tub.',
        sizeSqm: 68,
        view: 'Palm & Marina',
        maxAdults: 2,
        maxChildren: 2,
        maxOccupancy: 3,
        totalInventory: 18,
        amenities: ['wifi', 'infinity-pool', 'spa', 'kids-club'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1400&h=900&fit=crop',
            isPrimary: true,
          },
        ],
        ratePlans: [
          {
            name: 'Club Half Board',
            boardType: BoardType.HALF_BOARD,
            rateType: RateType.STANDARD,
            paymentType: PaymentType.PREPAID,
            isRefundable: true,
            cancellationPolicyName: 'Flexible 72h',
            baseRate: 540,
            taxes: 80,
            fees: 25,
            includeBreakfast: true,
            availableRooms: 7,
            nightlyBreakdown: [
              { label: 'Night 1', amount: 540 },
              { label: 'Night 2', amount: 560 },
            ],
            promotions: [{ label: 'Club Cocktail Hour', value: 'Complimentary for club guests' }],
            addOns: [
              { name: 'Private Cabana Experience' },
              { name: 'Talise Spa Journey' },
            ],
          },
          {
            name: 'GCC Resident Saver',
            boardType: BoardType.ROOM_ONLY,
            rateType: RateType.PROMO,
            paymentType: PaymentType.PREPAID,
            isRefundable: false,
            cancellationPolicyName: 'Non-refundable',
            baseRate: 420,
            taxes: 60,
            fees: 18,
            availableRooms: 6,
            nightlyBreakdown: [{ label: 'Night 1', amount: 420 }],
            promotions: [{ label: 'Residents Only', value: 'Valid GCC ID required at check-in' }],
            addOns: [{ name: 'Airport Bentley Transfer' }],
          },
        ],
      },
      {
        name: 'Royal Overwater Villa',
        description: 'Two-bedroom villa with infinity pool, cinema lounge, and private chef pantry.',
        sizeSqm: 210,
        view: 'Arabian Gulf',
        maxAdults: 4,
        maxChildren: 2,
        maxOccupancy: 6,
        totalInventory: 4,
        isSuite: true,
        amenities: ['wifi', 'spa', 'private-beach', 'concierge', 'helipad'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&h=900&fit=crop',
            isPrimary: true,
          },
        ],
        ratePlans: [
          {
            name: 'Villa All Inclusive',
            boardType: BoardType.ALL_INCLUSIVE,
            rateType: RateType.PACKAGE,
            paymentType: PaymentType.PREPAID,
            isRefundable: true,
            cancellationPolicyName: 'Semi-Flex 7d',
            baseRate: 1480,
            taxes: 220,
            fees: 60,
            includeBreakfast: true,
            availableRooms: 2,
            nightlyBreakdown: [
              { label: 'Night 1', amount: 1480 },
              { label: 'Night 2', amount: 1520 },
            ],
            promotions: [{ label: 'Seaplane Arrival', value: 'Complimentary seaplane landing' }],
            addOns: [
              { name: 'Desert Sunrise Helicopter', included: true },
              { name: 'Talise Spa Journey' },
            ],
          },
          {
            name: 'Villa Non-refundable',
            boardType: BoardType.ROOM_ONLY,
            rateType: RateType.NON_REFUNDABLE,
            paymentType: PaymentType.PREPAID,
            isRefundable: false,
            cancellationPolicyName: 'Non-refundable',
            baseRate: 1280,
            taxes: 190,
            fees: 55,
            availableRooms: 2,
            nightlyBreakdown: [{ label: 'Night 1', amount: 1280 }],
            addOns: [{ name: 'Private Cabana Experience' }],
          },
        ],
      },
    ],
  },
  {
    name: 'Hudson Glasshouse NYC',
    headline: 'A cantilevered glass retreat in Hudson Yards with immersive art suites',
    description:
      'Hudson Glasshouse blends biophilic design with Japanese soaking tubs, rooftop cold plunges, and a speakeasy jazz salon. Perfect for creative nomads and executive teams needing privacy.',
    country: 'United States',
    city: 'New York',
    region: 'Hudson Yards',
    starRating: 5,
    reviewScore: 4.88,
    reviewCount: 987,
    heroImage: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1600&h=900&fit=crop',
    supplierCode: 'RATEHAWK',
    categories: ['luxury', 'business', 'boutique', 'city'],
    amenities: ['wifi', 'rooftop-lounge', 'restaurant', 'bar', 'business-lounge', 'gym', 'concierge'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505692794400-5e0f0c46887c?w=1600&h=900&fit=crop',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1400&h=900&fit=crop',
      },
    ],
    addOns: [
      { name: 'Late Checkout 2 PM', type: AddOnType.LATE_CHECKOUT, price: 80 },
      { name: 'Broadway VIP Concierge', type: AddOnType.EXPERIENCE, price: 260 },
      { name: 'Tesla Airport Transfer', type: AddOnType.AIRPORT_TRANSFER, price: 150 },
    ],
    roomTypes: [
      {
        name: 'Glasshouse Studio King',
        description: 'Floor-to-ceiling corner studio with soaking tub and Dyson workspace.',
        sizeSqm: 44,
        view: 'Hudson River',
        maxAdults: 2,
        maxChildren: 1,
        maxOccupancy: 2,
        totalInventory: 20,
        amenities: ['wifi', 'rooftop-lounge', 'gym'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1400&h=900&fit=crop',
            isPrimary: true,
          },
        ],
        ratePlans: [
          {
            name: 'Corporate Flex',
            boardType: BoardType.ROOM_ONLY,
            rateType: RateType.CORPORATE,
            paymentType: PaymentType.PREPAID,
            isRefundable: true,
            cancellationPolicyName: 'Flexible 72h',
            baseRate: 375,
            taxes: 58,
            fees: 20,
            availableRooms: 10,
            nightlyBreakdown: [{ label: 'Night 1', amount: 375 }],
            addOns: [
              { name: 'Tesla Airport Transfer' },
              { name: 'Late Checkout 2 PM' },
            ],
          },
          {
            name: 'Creator Loft Package',
            boardType: BoardType.BED_AND_BREAKFAST,
            rateType: RateType.PACKAGE,
            paymentType: PaymentType.DEPOSIT,
            isRefundable: true,
            cancellationPolicyName: 'Semi-Flex 7d',
            baseRate: 420,
            taxes: 64,
            fees: 20,
            includeBreakfast: true,
            availableRooms: 6,
            nightlyBreakdown: [{ label: 'Night 1', amount: 420 }],
            promotions: [{ label: 'Content Studio', value: '60 minutes complimentary per stay' }],
            addOns: [
              { name: 'Broadway VIP Concierge', included: true },
              { name: 'Late Checkout 2 PM' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Seine Atelier Paris',
    headline: 'Haussmann townhouse curated by French designers with secret winter garden',
    description:
      'Steps from Pont Neuf, Seine Atelier hosts nightly perfumer salons, chef residencies, and art concierge teams. Maison-style suites wrap guests in cashmere and curated vinyl collections.',
    country: 'France',
    city: 'Paris',
    region: '1er arrondissement',
    starRating: 5,
    reviewScore: 4.9,
    reviewCount: 742,
    heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop',
    categories: ['luxury', 'boutique', 'wellness', 'city'],
    amenities: ['wifi', 'spa', 'restaurant', 'bar', 'concierge', 'zen-garden', 'tea-salon'],
    supplierCode: 'RATEHAWK',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?w=1600&h=900&fit=crop',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=1400&h=900&fit=crop',
      },
    ],
    addOns: [
      { name: 'Champagne Welcome', type: AddOnType.DINING, price: 95, isComplimentary: false },
      { name: 'Versailles Chauffeur Day', type: AddOnType.EXCURSION, price: 340 },
      { name: 'Private Chef Dinner', type: AddOnType.DINING, price: 280 },
    ],
    roomTypes: [
      {
        name: 'Artist Residence Suite',
        description: '65 sqm suite with atelier easel, freestanding tub, and Juliette balcony.',
        sizeSqm: 65,
        view: 'Rue de Rivoli',
        maxAdults: 2,
        maxChildren: 1,
        maxOccupancy: 2,
        totalInventory: 8,
        amenities: ['wifi', 'spa', 'tea-salon'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1400&h=900&fit=crop',
            isPrimary: true,
          },
        ],
        ratePlans: [
          {
            name: 'Maison Breakfast Ritual',
            boardType: BoardType.BED_AND_BREAKFAST,
            rateType: RateType.STANDARD,
            paymentType: PaymentType.PREPAID,
            isRefundable: true,
            cancellationPolicyName: 'Flexible 72h',
            baseRate: 510,
            taxes: 72,
            fees: 20,
            includeBreakfast: true,
            availableRooms: 4,
            nightlyBreakdown: [{ label: 'Night 1', amount: 510 }],
            addOns: [
              { name: 'Champagne Welcome', included: true },
              { name: 'Private Chef Dinner' },
            ],
          },
          {
            name: 'Perfumer-in-Residence',
            boardType: BoardType.HALF_BOARD,
            rateType: RateType.PACKAGE,
            paymentType: PaymentType.DEPOSIT,
            isRefundable: true,
            cancellationPolicyName: 'Semi-Flex 7d',
            baseRate: 590,
            taxes: 84,
            fees: 20,
            includeBreakfast: true,
            nightlyBreakdown: [
              { label: 'Night 1', amount: 590 },
              { label: 'Night 2', amount: 610 },
            ],
            promotions: [{ label: 'Atelier Workshop', value: 'Private perfumer session included' }],
            addOns: [
              { name: 'Versailles Chauffeur Day' },
              { name: 'Private Chef Dinner' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Kyoto Garden Pavilion',
    headline: 'Ryokan-inspired sanctuary with indoor-outdoor onsen suites and tea masters',
    description:
      'Tucked in the Higashiyama foothills, the pavilion offers tatami suites, forest meditation decks, and curated temple access with personal cultural hosts.',
    country: 'Japan',
    city: 'Kyoto',
    region: 'Higashiyama',
    starRating: 5,
    reviewScore: 4.95,
    reviewCount: 563,
    supplierCode: 'HOTELBEDS',
    categories: ['boutique', 'wellness'],
    amenities: ['wifi', 'onsen', 'zen-garden', 'tea-salon', 'spa'],
    heroImage: 'https://images.unsplash.com/photo-1508606572321-901ea443707f?w=1600&h=900&fit=crop',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&h=900&fit=crop',
        isPrimary: true,
      },
    ],
    addOns: [
      { name: 'Tea Ceremony Masterclass', type: AddOnType.EXPERIENCE, price: 140 },
      { name: 'Private Temple Guide', type: AddOnType.EXCURSION, price: 220 },
      { name: 'Onsen Floral Upgrade', type: AddOnType.SPA, price: 60 },
    ],
    roomTypes: [
      {
        name: 'Maple Tatami Suite',
        description: '82 sqm tatami suite with hinoki tub and pocket garden.',
        sizeSqm: 82,
        view: 'Zen courtyard',
        maxAdults: 3,
        maxChildren: 1,
        maxOccupancy: 3,
        totalInventory: 10,
        amenities: ['wifi', 'onsen', 'zen-garden'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1400&h=900&fit=crop',
            isPrimary: true,
          },
        ],
        ratePlans: [
          {
            name: 'Kaiseki Half Board',
            boardType: BoardType.HALF_BOARD,
            rateType: RateType.STANDARD,
            paymentType: PaymentType.PREPAID,
            isRefundable: true,
            cancellationPolicyName: 'Flexible 72h',
            baseRate: 480,
            taxes: 68,
            fees: 15,
            includeBreakfast: true,
            availableRooms: 6,
            nightlyBreakdown: [{ label: 'Night 1', amount: 480 }],
            addOns: [
              { name: 'Tea Ceremony Masterclass', included: true },
              { name: 'Onsen Floral Upgrade' },
            ],
          },
          {
            name: 'Zen Immersion Package',
            boardType: BoardType.FULL_BOARD,
            rateType: RateType.PACKAGE,
            paymentType: PaymentType.DEPOSIT,
            isRefundable: true,
            cancellationPolicyName: 'Semi-Flex 7d',
            baseRate: 540,
            taxes: 78,
            fees: 18,
            includeBreakfast: true,
            availableRooms: 4,
            nightlyBreakdown: [{ label: 'Night 1', amount: 540 }],
            addOns: [
              { name: 'Private Temple Guide', included: true },
              { name: 'Onsen Floral Upgrade' },
            ],
          },
        ],
      },
    ],
  },
];

async function resetDatabase() {
  console.log('🧹 Resetting tables...');
  await prisma.bookingAddOn.deleteMany();
  await prisma.bookingRoom.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.ratePlanAddOn.deleteMany();
  await prisma.ratePlan.deleteMany();
  await prisma.roomTypeAmenity.deleteMany();
  await prisma.roomTypeImage.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.hotelAddOn.deleteMany();
  await prisma.hotelAmenity.deleteMany();
  await prisma.hotelCategory.deleteMany();
  await prisma.hotelImage.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.category.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.cancellationPolicy.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers() {
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: '$2a$12$MnBuuAkDyMFivdX/ecFTIODUmwZ92sK44.x2vKC1sNr5WSAupMdBO', // password123
      name: 'Test User',
      phone: '+44 7700 900000',
      emailVerified: new Date(),
    },
  });

  const admin = await prisma.admin.create({
    data: {
      email: 'admin@besthotelrates.com',
      password: '$2a$12$MnBuuAkDyMFivdX/ecFTIODUmwZ92sK44.x2vKC1sNr5WSAupMdBO',
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  });

  console.log(`👤 Seeded user: ${testUser.email}`);
  console.log(`🛡️  Seeded admin: ${admin.email}`);
}

async function seedTaxonomy() {
  console.log('📚 Seeding suppliers, categories, amenities, policies...');

  await prisma.supplier.createMany({ data: supplierSeeds });
  await prisma.category.createMany({ data: categorySeeds });

  for (const amenity of amenitySeeds) {
    await prisma.amenity.create({
      data: {
        name: amenity.name,
        slug: amenity.slug,
        category: amenity.category as any,
        icon: amenity.icon,
      },
    });
  }

  for (const policy of cancellationPolicies) {
    await prisma.cancellationPolicy.create({
      data: policy,
    });
  }
}

async function seedHotels() {
  console.log('🏨 Seeding hotels with deep inventory...');

  for (const hotel of hotelInventory) {
    const slug = hotel.slug ?? slugify(hotel.name);
    const rateValues = hotel.roomTypes.flatMap((room) => room.ratePlans.map((rp) => rp.baseRate));
    const minRate = Math.min(...rateValues);
    const maxRate = Math.max(...rateValues);

    const createdHotel = await prisma.hotel.create({
      data: {
        name: hotel.name,
        slug,
        headline: hotel.headline,
        description: hotel.description,
        country: hotel.country,
        city: hotel.city,
        region: hotel.region,
        address: hotel.address,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        starRating: hotel.starRating,
        reviewScore: hotel.reviewScore,
        reviewCount: hotel.reviewCount,
        heroImage: hotel.heroImage,
        defaultCurrency: 'GBP',
        minRate,
        maxRate,
        featured: hotel.featured ?? false,
        tags: (hotel.tags ?? []) as any,
        supplier: hotel.supplierCode
          ? {
              connect: { code: hotel.supplierCode },
            }
          : undefined,
        categories: {
          create: hotel.categories.map((categorySlug) => ({
            category: {
              connect: { slug: categorySlug },
            },
          })),
        },
        amenities: {
          create: hotel.amenities.map((amenitySlug, index) => ({
            amenity: { connect: { slug: amenitySlug } },
            priority: index,
          })),
        },
        images: {
          create: hotel.images.map((img, index) => ({
            url: img.url,
            caption: img.caption,
            isPrimary: img.isPrimary ?? index === 0,
            sortOrder: index,
            type: 'gallery',
          })),
        },
      },
    });

    const addOnRecords = [];
    for (const [index, addOn] of hotel.addOns.entries()) {
      const record = await prisma.hotelAddOn.create({
        data: {
          hotelId: createdHotel.id,
          name: addOn.name,
          type: addOn.type,
          price: addOn.price,
          currency: addOn.currency ?? 'GBP',
          isPerNight: addOn.isPerNight ?? false,
          isComplimentary: addOn.isComplimentary ?? false,
          description: addOn.description,
          sortOrder: index,
        },
      });
      addOnRecords.push(record);
    }
    const addOnMap = new Map(addOnRecords.map((record) => [record.name, record]));

    for (const roomType of hotel.roomTypes) {
      const roomSlug = `${slug}-${slugify(roomType.name)}`;
      const createdRoom = await prisma.roomType.create({
        data: {
          hotelId: createdHotel.id,
          name: roomType.name,
          slug: roomSlug,
          description: roomType.description,
          sizeSqm: roomType.sizeSqm,
          view: roomType.view,
          maxAdults: roomType.maxAdults,
          maxChildren: roomType.maxChildren,
          maxOccupancy: roomType.maxOccupancy,
          totalInventory: roomType.totalInventory,
          isSuite: roomType.isSuite ?? false,
          images: {
            create: roomType.images.map((img, index) => ({
              url: img.url,
              caption: img.caption,
              isPrimary: img.isPrimary ?? index === 0,
              sortOrder: index,
            })),
          },
          amenities: {
            create: roomType.amenities.map((amenitySlug) => ({
              amenity: { connect: { slug: amenitySlug } },
            })),
          },
        },
      });

      for (const ratePlan of roomType.ratePlans) {
        const cancellationPolicy = await prisma.cancellationPolicy.findFirst({
          where: { name: ratePlan.cancellationPolicyName },
        });

        const createdRatePlan = await prisma.ratePlan.create({
          data: {
            roomTypeId: createdRoom.id,
            name: ratePlan.name,
            code: ratePlan.code ?? slugify(ratePlan.name).toUpperCase(),
            description: ratePlan.description,
            boardType: ratePlan.boardType,
            rateType: ratePlan.rateType,
            paymentType: ratePlan.paymentType,
            isRefundable: ratePlan.isRefundable,
            cancellationPolicyId: cancellationPolicy?.id,
            currency: ratePlan.currency ?? 'GBP',
            baseRate: ratePlan.baseRate,
            averageNightlyRate: ratePlan.baseRate,
            totalBeforeTaxes: ratePlan.totalBeforeTaxes ?? ratePlan.baseRate,
            taxes: ratePlan.taxes,
            fees: ratePlan.fees,
            totalAmount:
              ratePlan.totalAmount ?? ratePlan.baseRate + ratePlan.taxes + ratePlan.fees,
            minStay: ratePlan.minStay ?? 1,
            maxStay: ratePlan.maxStay ?? 21,
            availableRooms: ratePlan.availableRooms ?? 3,
            includeBreakfast: ratePlan.includeBreakfast ?? false,
            nightlyBreakdown:
              ratePlan.nightlyBreakdown ?? [{ label: 'Night 1', amount: ratePlan.baseRate }],
            promotions: ratePlan.promotions ?? [],
            inclusions: ratePlan.inclusions ?? [],
            supplierRateId: `${slugify(ratePlan.name)}-${Math.floor(Math.random() * 9999)}`,
            freeCancellationUntil: ratePlan.isRefundable
              ? new Date(Date.now() + 72 * 60 * 60 * 1000)
              : null,
          },
        });

        if (ratePlan.addOns?.length) {
          for (const addOn of ratePlan.addOns) {
            const addOnRecord = addOnMap.get(addOn.name);
            if (!addOnRecord) continue;

            await prisma.ratePlanAddOn.create({
              data: {
                ratePlanId: createdRatePlan.id,
                addOnId: addOnRecord.id,
                included: addOn.included ?? false,
                additionalPrice: addOn.additionalPrice ?? (addOn.included ? 0 : null),
              },
            });
          }
        }
      }
    }

    console.log(`   • Seeded hotel: ${createdHotel.name} (${hotel.city})`);
  }
}

async function main() {
  console.log('🌱 Starting database seed...');
  await resetDatabase();
  await seedUsers();
  await seedTaxonomy();
  await seedHotels();
  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('   User: test@example.com / password123');
  console.log('   Admin: admin@besthotelrates.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

