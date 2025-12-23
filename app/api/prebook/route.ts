/**
 * Prebook API - Validates rate availability and locks price before payment
 * 
 * This is a REQUIRED step for both RateHawk and HotelBeds.
 * It ensures the rate is still available and the price hasn't changed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prebookRate } from '@/lib/suppliers/ratehawkAdapter';
import { withCache } from '@/lib/cache/sharedCache';

// HotelBeds prebook (checkRate)
async function prebookHotelbeds(rateKey: string): Promise<{
  success: boolean;
  priceChanged: boolean;
  newPrice?: number;
  originalPrice?: number;
  currency?: string;
  error?: string;
}> {
  const HB_API_KEY = process.env.HOTELBEDS_API_KEY;
  const HB_API_SECRET = process.env.HOTELBEDS_API_SECRET;
  const HB_BASE_URL = process.env.HOTELBEDS_BASE_URL ?? 'https://api.test.hotelbeds.com';

  if (!HB_API_KEY || !HB_API_SECRET) {
    return { success: false, priceChanged: false, error: 'HotelBeds not configured' };
  }

  const crypto = await import('crypto');
  const ts = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHash('sha256')
    .update(`${HB_API_KEY}${HB_API_SECRET}${ts}`)
    .digest('hex');

  try {
    const res = await fetch(`${HB_BASE_URL}/hotel-api/1.0/checkrates`, {
      method: 'POST',
      headers: {
        'Api-key': HB_API_KEY,
        'X-Signature': signature,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rooms: [{ rateKey }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('HotelBeds checkRate failed:', text);
      return { success: false, priceChanged: false, error: `HotelBeds error: ${res.status}` };
    }

    const data = await res.json();
    const hotel = data?.hotel;
    const room = hotel?.rooms?.[0];
    const rate = room?.rates?.[0];

    if (!rate) {
      return { success: false, priceChanged: false, error: 'Rate no longer available' };
    }

    return {
      success: true,
      priceChanged: rate.priceChanged === true,
      newPrice: Number(rate.net || rate.sellingRate),
      currency: rate.currency,
    };
  } catch (err: any) {
    console.error('HotelBeds prebook error:', err);
    return { success: false, priceChanged: false, error: err.message };
  }
}

// RateHawk prebook
async function prebookRatehawk(bookHash: string): Promise<{
  success: boolean;
  priceChanged: boolean;
  newPrice?: number;
  originalPrice?: number;
  currency?: string;
  error?: string;
}> {
  try {
    const result = await prebookRate(bookHash);

    if (result?.data?.status === 'ok') {
      const priceInfo = result.data.data;
      return {
        success: true,
        priceChanged: priceInfo.price_changed === true,
        newPrice: priceInfo.final_price,
        originalPrice: priceInfo.original_price,
        currency: priceInfo.currency,
      };
    }

    return {
      success: false,
      priceChanged: false,
      error: result?.data?.error || 'Rate not available',
    };
  } catch (err: any) {
    console.error('RateHawk prebook error:', err);
    return { success: false, priceChanged: false, error: err.message };
  }
}

// Local inventory prebook (mock - always succeeds)
function prebookLocal(ratePlanId: string, totalAmount: number, currency: string): {
  success: boolean;
  priceChanged: boolean;
  newPrice?: number;
  currency?: string;
} {
  return {
    success: true,
    priceChanged: false,
    newPrice: totalAmount,
    currency,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplierCode, ratePlanId, bookHash, rateKey, totalAmount, currency, hotelId } = body;

    if (!ratePlanId && !bookHash && !rateKey) {
      return NextResponse.json(
        { success: false, error: 'Missing rate identifier' },
        { status: 400 }
      );
    }

    let result: {
      success: boolean;
      priceChanged: boolean;
      newPrice?: number;
      originalPrice?: number;
      currency?: string;
      error?: string;
    };

    // Check if this is test data - our test hotel IDs are 100000-199999
    const hotelIdNum = parseInt(hotelId || ratePlanId?.split('-')?.[0] || '0', 10);
    const isTestData = hotelIdNum >= 100000 && hotelIdNum < 200000;
    
    if (isTestData) {
      console.log('Test data detected - skipping supplier prebook validation');
      return NextResponse.json({
        success: true,
        priceChanged: false,
        confirmedPrice: totalAmount,
        currency: currency || 'GBP',
      });
    }

    const supplier = supplierCode?.toUpperCase() || 'LOCAL';

    switch (supplier) {
      case 'RATEHAWK':
        if (!bookHash) {
          return NextResponse.json(
            { success: false, error: 'Missing bookHash for RateHawk' },
            { status: 400 }
          );
        }
        result = await prebookRatehawk(bookHash);
        break;

      case 'HOTELBEDS':
        if (!rateKey) {
          return NextResponse.json(
            { success: false, error: 'Missing rateKey for HotelBeds' },
            { status: 400 }
          );
        }
        result = await prebookHotelbeds(rateKey);
        break;

      default:
        // Local inventory - always available
        result = prebookLocal(ratePlanId, totalAmount, currency);
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Rate no longer available',
          priceChanged: result.priceChanged,
        },
        { status: 422 }
      );
    }

    // Check if price changed significantly (more than 5%)
    if (result.priceChanged && result.newPrice && totalAmount) {
      const priceDiff = Math.abs(result.newPrice - totalAmount) / totalAmount;
      if (priceDiff > 0.05) {
        return NextResponse.json({
          success: false,
          error: 'Price has changed significantly',
          priceChanged: true,
          newPrice: result.newPrice,
          originalPrice: totalAmount,
          currency: result.currency,
        });
      }
    }

    return NextResponse.json({
      success: true,
      priceChanged: result.priceChanged,
      confirmedPrice: result.newPrice || totalAmount,
      currency: result.currency || currency,
    });
  } catch (error: any) {
    console.error('Prebook error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Prebook failed' },
      { status: 500 }
    );
  }
}

