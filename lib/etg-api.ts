// ETG API Integration Service
// Documentation: https://docs.emergingtravel.com

interface ETGConfig {
  apiUrl: string;
  apiKey: string;
  apiSecret: string;
}

interface SearchParams {
  regionId?: string;
  checkin: string;
  checkout: string;
  guests: number;
  currency?: string;
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  image: string;
  amenities?: string[];
}

class ETGApiService {
  private config: ETGConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      apiUrl: process.env.ETG_API_URL || 'https://api.etg.com',
      apiKey: process.env.ETG_API_KEY || '',
      apiSecret: process.env.ETG_API_SECRET || '',
    };
    this.baseUrl = this.config.apiUrl;
  }

  /**
   * Generate authorization headers for ETG API
   */
  private getAuthHeaders(): HeadersInit {
    // ETG API uses Bearer token authentication
    const authToken = Buffer.from(
      `${this.config.apiKey}:${this.config.apiSecret}`
    ).toString('base64');

    return {
      'Authorization': `Basic ${authToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Search hotels by region
   * Based on ETG API documentation
   */
  async searchHotels(params: SearchParams): Promise<Hotel[]> {
    try {
      // For now, return mock data until we have real ETG credentials
      // In Phase 3, this will make real API calls
      if (!this.config.apiKey || !this.config.apiSecret) {
        console.warn('ETG API credentials not configured. Using mock data.');
        return this.getMockHotels();
      }

      const endpoint = `${this.baseUrl}/api/b2b/v3/hotel/search/region`;
      
      const requestBody = {
        checkin: params.checkin,
        checkout: params.checkout,
        residency: 'gb',
        language: 'en',
        guests: [{ adults: params.guests, children: [] }],
        region: params.regionId || '1',
        currency: params.currency || 'GBP',
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`ETG API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform ETG response to our hotel format
      return this.transformETGResponse(data);
    } catch (error) {
      console.error('ETG API search error:', error);
      // Fallback to mock data
      return this.getMockHotels();
    }
  }

  /**
   * Get hotel details by ID
   */
  async getHotelDetails(hotelId: string): Promise<any> {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        return this.getMockHotelDetails(hotelId);
      }

      const endpoint = `${this.baseUrl}/api/b2b/v3/hotel/info`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ hotel_ids: [hotelId] }),
      });

      const data = await response.json();
      return this.transformHotelDetails(data);
    } catch (error) {
      console.error('ETG API hotel details error:', error);
      return this.getMockHotelDetails(hotelId);
    }
  }

  /**
   * Create booking with ETG
   */
  async createBooking(bookingData: any): Promise<any> {
    try {
      if (!this.config.apiKey || !this.config.apiSecret) {
        console.warn('ETG API credentials not configured. Booking simulation only.');
        return { success: true, bookingId: 'MOCK-' + Date.now() };
      }

      const endpoint = `${this.baseUrl}/api/b2b/v3/hotel/order/start/booking`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('ETG API booking error:', error);
      throw error;
    }
  }

  /**
   * Transform ETG response to our format
   */
  private transformETGResponse(data: any): Hotel[] {
    // Transform ETG hotel data structure to our app format
    // This will be implemented based on actual ETG response structure
    return [];
  }

  /**
   * Transform hotel details
   */
  private transformHotelDetails(data: any): any {
    // Transform ETG hotel details to our format
    return {};
  }

  /**
   * Mock hotel data for development
   */
  private getMockHotels(): Hotel[] {
    return [
      {
        id: '1',
        name: 'Mock Hotel London',
        location: 'London, UK',
        rating: 4.5,
        price: 150,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
        amenities: ['WiFi', 'Pool'],
      },
    ];
  }

  /**
   * Mock hotel details
   */
  private getMockHotelDetails(hotelId: string): any {
    return {
      id: hotelId,
      name: 'Mock Hotel',
      description: 'ETG API will provide real hotel details in Phase 3',
    };
  }
}

// Export singleton instance
export const etgApi = new ETGApiService();

// Export types
export type { Hotel, SearchParams };

