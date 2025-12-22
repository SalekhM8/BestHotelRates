'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Hotel = {
  id: string;
  slug?: string;
  name: string;
  location: string;
  rating: number;
  startingRate?: number | null;
  currency?: string;
  image?: string | null;
  latitude?: number;
  longitude?: number;
};

type Props = {
  hotels: Hotel[];
  center?: { lat: number; lng: number };
};

// Map container style
const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
  borderRadius: '16px',
};

// Dark map style to match our theme
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#64779e' }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.stroke', stylers: [{ color: '#334e87' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#3C7680' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#255763' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0d5ce' }] },
  { featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{ color: '#023e58' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'transit.line', elementType: 'geometry.fill', stylers: [{ color: '#283d6a' }] },
  { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#3a4762' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];

// Default city coordinates
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  london: { lat: 51.5074, lng: -0.1278 },
  paris: { lat: 48.8566, lng: 2.3522 },
  barcelona: { lat: 41.3851, lng: 2.1734 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  'new york': { lat: 40.7128, lng: -74.006 },
  rome: { lat: 41.9028, lng: 12.4964 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  berlin: { lat: 52.52, lng: 13.405 },
  madrid: { lat: 40.4168, lng: -3.7038 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
};

export function GoogleMapView({ hotels, center }: Props) {
  const router = useRouter();
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // Calculate center from hotels or use provided center
  const mapCenter = useMemo(() => {
    if (center) return center;
    
    // Try to find center from hotel locations
    const hotelsWithCoords = hotels.filter(h => h.latitude && h.longitude);
    if (hotelsWithCoords.length > 0) {
      const avgLat = hotelsWithCoords.reduce((sum, h) => sum + (h.latitude || 0), 0) / hotelsWithCoords.length;
      const avgLng = hotelsWithCoords.reduce((sum, h) => sum + (h.longitude || 0), 0) / hotelsWithCoords.length;
      return { lat: avgLat, lng: avgLng };
    }
    
    // Fallback: try to detect city from first hotel location
    if (hotels.length > 0) {
      const location = hotels[0].location.toLowerCase();
      for (const [city, coords] of Object.entries(CITY_COORDS)) {
        if (location.includes(city)) {
          return coords;
        }
      }
    }
    
    // Default to London
    return CITY_COORDS.london;
  }, [hotels, center]);

  // Generate coordinates for hotels that don't have them
  const hotelsWithCoords = useMemo(() => {
    return hotels.map((hotel, index) => {
      if (hotel.latitude && hotel.longitude) {
        return hotel;
      }
      // Generate a position near the center with some spread
      const angle = (index / hotels.length) * 2 * Math.PI;
      const radius = 0.02 + Math.random() * 0.03; // ~2-5km spread
      return {
        ...hotel,
        latitude: mapCenter.lat + radius * Math.cos(angle),
        longitude: mapCenter.lng + radius * Math.sin(angle),
      };
    });
  }, [hotels, mapCenter]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const formatPrice = (amount: number | null | undefined, currency = 'GBP') => {
    if (!amount) return 'View prices';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleHotelClick = (hotel: Hotel) => {
    router.push(`/hotels/${hotel.slug || hotel.id}`);
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[500px] rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/70">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="w-full h-full min-h-[500px] rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center text-white/70">
          <p>Failed to load map</p>
          <p className="text-sm mt-2">Please check your API key</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {hotelsWithCoords.map((hotel) => (
          <MarkerF
            key={hotel.id}
            position={{ lat: hotel.latitude!, lng: hotel.longitude! }}
            onClick={() => setSelectedHotel(hotel)}
            label={{
              text: formatPrice(hotel.startingRate, hotel.currency),
              className: 'map-price-label',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '12px',
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 0,
            }}
          />
        ))}

        {/* Custom price markers */}
        {hotelsWithCoords.map((hotel) => (
          <MarkerF
            key={`price-${hotel.id}`}
            position={{ lat: hotel.latitude!, lng: hotel.longitude! }}
            onClick={() => setSelectedHotel(hotel)}
            icon={{
              url: `data:image/svg+xml,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="32" viewBox="0 0 70 32">
                  <rect x="0" y="0" width="70" height="28" rx="14" fill="${selectedHotel?.id === hotel.id ? '#3b82f6' : '#1e3a5f'}" stroke="${selectedHotel?.id === hotel.id ? '#60a5fa' : '#334155'}" stroke-width="2"/>
                  <text x="35" y="19" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="bold">${formatPrice(hotel.startingRate, hotel.currency)}</text>
                  <polygon points="35,28 30,32 40,32" fill="${selectedHotel?.id === hotel.id ? '#3b82f6' : '#1e3a5f'}"/>
                </svg>
              `)}`,
              scaledSize: new google.maps.Size(70, 32),
              anchor: new google.maps.Point(35, 32),
            }}
          />
        ))}

        {/* Info Window */}
        {selectedHotel && (
          <InfoWindowF
            position={{ lat: selectedHotel.latitude!, lng: selectedHotel.longitude! }}
            onCloseClick={() => setSelectedHotel(null)}
            options={{
              pixelOffset: new google.maps.Size(0, -35),
            }}
          >
            <div 
              className="bg-white rounded-lg overflow-hidden cursor-pointer min-w-[240px]"
              onClick={() => handleHotelClick(selectedHotel)}
            >
              {selectedHotel.image && (
                <div className="relative h-32 w-full">
                  <Image
                    src={selectedHotel.image}
                    alt={selectedHotel.name}
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {selectedHotel.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded shrink-0">
                    ★ {selectedHotel.rating.toFixed(1)}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">{selectedHotel.location}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">
                    {formatPrice(selectedHotel.startingRate, selectedHotel.currency)}
                  </span>
                  <span className="text-xs text-gray-500">per night</span>
                </div>
                <button className="mt-2 w-full bg-blue-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Hotel count badge */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium">
        {hotels.length} hotels in this area
      </div>
    </div>
  );
}

