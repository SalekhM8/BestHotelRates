// HotelBeds API Integration Service
// Documentation: https://developer.hotelbeds.com

import crypto from 'crypto';

interface HotelBedsConfig {
  apiKey: string;
  apiSecret: string;
  apiUrl: string;
}

interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  rooms?: number;
}

interface Hotel {
  code: string;
  name: string;
  destinationName: string;
  categoryCode: string;
  rating: number;
  minRate: number;
  maxRate: number;
  currency: string;
  images?: Array<{ path: string }>;
  latitude?: number;
  longitude?: number;
}

class HotelBedsApiService {
  private config: HotelBedsConfig;

  constructor() {
    this.config = {
      apiKey: process.env.HOTELBEDS_API_KEY || '',
      apiSecret: process.env.HOTELBEDS_API_SECRET || '',
      apiUrl: process.env.HOTELBEDS_API_URL || 'https://api.test.hotelbeds.com',
    };
  }

  /**
   * Generate HotelBeds signature for authentication
   * Required: X-Signature header = SHA256(ApiKey + ApiSecret + Timestamp)
   */
  private generateSignature(): { signature: string; timestamp: string } {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const stringToSign = this.config.apiKey + this.config.apiSecret + timestamp;
    const signature = crypto.createHash('sha256').update(stringToSign).digest('hex');

    return { signature, timestamp };
  }

  /**
   * Get authentication headers for HotelBeds API
   */
  private getAuthHeaders(): HeadersInit {
    const { signature, timestamp } = this.generateSignature();

    return {
      'Api-Key': this.config.apiKey,
      'X-Signature': signature,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    };
  }

  /**
   * Search hotels by destination
   * HotelBeds Endpoint: POST /hotel-api/1.0/hotels
   */
  async searchHotels(params: SearchParams): Promise<any> {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        console.warn('HotelBeds API credentials not configured. Using mock data.');
        return this.getMockSearchResults();
      }

      const endpoint = `${this.config.apiUrl}/hotel-api/1.0/hotels`;

      const requestBody = {
        stay: {
          checkIn: params.checkIn,
          checkOut: params.checkOut,
        },
        occupancies: [
          {
            rooms: params.rooms || 1,
            adults: params.adults,
            children: params.children || 0,
          },
        ],
        destination: {
          code: params.destination, // HotelBeds destination code
        },
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error(`HotelBeds API error: ${response.status}`);
        return this.getMockSearchResults();
      }

      const data = await response.json();
      return this.transformSearchResponse(data);
    } catch (error) {
      console.error('HotelBeds search error:', error);
      return this.getMockSearchResults();
    }
  }

  /**
   * Get hotel content/details
   * HotelBeds Endpoint: GET /hotel-content-api/1.0/hotels/{hotelCodes}
   */
  async getHotelDetails(hotelCode: string): Promise<any> {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        return this.getMockHotelDetails(hotelCode);
      }

      const endpoint = `${this.config.apiUrl}/hotel-content-api/1.0/hotels/${hotelCode}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return this.getMockHotelDetails(hotelCode);
      }

      const data = await response.json();
      return this.transformHotelDetails(data);
    } catch (error) {
      console.error('HotelBeds hotel details error:', error);
      return this.getMockHotelDetails(hotelCode);
    }
  }

  /**
   * Check availability for specific hotel
   * HotelBeds Endpoint: POST /hotel-api/1.0/checkrates
   */
  async checkAvailability(rateKey: string): Promise<any> {
    try {
      const endpoint = `${this.config.apiUrl}/hotel-api/1.0/checkrates`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ rooms: [{ rateKey }] }),
      });

      if (!response.ok) {
        throw new Error(`Availability check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('HotelBeds availability check error:', error);
      throw error;
    }
  }

  /**
   * Create booking
   * HotelBeds Endpoint: POST /hotel-api/1.0/bookings
   */
  async createBooking(bookingData: any): Promise<any> {
    try {
      const endpoint = `${this.config.apiUrl}/hotel-api/1.0/bookings`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error(`Booking creation failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('HotelBeds booking error:', error);
      throw error;
    }
  }

  /**
   * Transform HotelBeds search response to our format
   */
  private transformSearchResponse(data: any): Hotel[] {
    if (!data.hotels || !data.hotels.hotels) {
      return [];
    }

    return data.hotels.hotels.map((hotel: any) => ({
      code: hotel.code,
      name: hotel.name,
      destinationName: hotel.destinationName,
      categoryCode: hotel.categoryCode,
      rating: parseFloat(hotel.categoryCode?.replace('EST', '') || '0'),
      minRate: hotel.minRate,
      maxRate: hotel.maxRate,
      currency: hotel.currency,
      images: hotel.rooms?.[0]?.images || [],
      latitude: hotel.latitude,
      longitude: hotel.longitude,
    }));
  }

  /**
   * Transform hotel details response
   */
  private transformHotelDetails(data: any): any {
    return data.hotel || {};
  }

  /**
   * Mock data for development/fallback
   */
  private getMockSearchResults(): Hotel[] {
    return [
      {
        code: 'MOCK001',
        name: 'Mock Hotel - HotelBeds API',
        destinationName: 'London',
        categoryCode: '4EST',
        rating: 4.0,
        minRate: 150,
        maxRate: 300,
        currency: 'GBP',
        images: [],
      },
    ];
  }

  /**
   * Mock hotel details
   */
  private getMockHotelDetails(hotelCode: string): any {
    return {
      code: hotelCode,
      name: 'Mock Hotel Details',
      description: 'HotelBeds API will provide real data when credentials are configured',
    };
  }
}

// Export singleton instance
export const hotelBedsApi = new HotelBedsApiService();

// Export types
export type { Hotel, SearchParams };

