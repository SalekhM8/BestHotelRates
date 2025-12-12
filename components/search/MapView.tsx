'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SupplierHotelSummary } from '@/lib/suppliers/types';

// Mock coordinates for demo - in production, these would come from the API
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  london: { lat: 51.5074, lng: -0.1278 },
  paris: { lat: 48.8566, lng: 2.3522 },
  barcelona: { lat: 41.3851, lng: 2.1734 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  rome: { lat: 41.9028, lng: 12.4964 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  vienna: { lat: 48.2082, lng: 16.3738 },
  lisbon: { lat: 38.7223, lng: -9.1393 },
  maldives: { lat: 3.2028, lng: 73.2207 },
  bali: { lat: -8.3405, lng: 115.0920 },
  miami: { lat: 25.7617, lng: -80.1918 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  sydney: { lat: -33.8688, lng: 151.2093 },
};

type Props = {
  hotels: SupplierHotelSummary[];
  destination: string;
  onHotelSelect?: (hotel: SupplierHotelSummary) => void;
  selectedHotelId?: string;
};

// Price marker component that shows on the map
function PriceMarker({
  hotel,
  isSelected,
  onClick,
  style,
}: {
  hotel: SupplierHotelSummary;
  isSelected: boolean;
  onClick: () => void;
  style: React.CSSProperties;
}) {
  const price = hotel.startingRate ?? 0;
  const currency = hotel.currency || 'GBP';

  const formattedPrice = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <button
      onClick={onClick}
      className={`
        absolute transform -translate-x-1/2 -translate-y-full
        px-2 py-1 rounded-full text-xs font-bold shadow-lg
        transition-all duration-200 ease-out cursor-pointer
        ${isSelected
          ? 'bg-blue-600 text-white scale-125 z-50'
          : 'bg-white text-gray-900 hover:bg-blue-600 hover:text-white hover:scale-110 z-10'
        }
      `}
      style={style}
      title={hotel.name}
    >
      {formattedPrice}
      <div
        className={`
          absolute left-1/2 transform -translate-x-1/2 top-full
          w-0 h-0 border-l-4 border-r-4 border-t-4
          border-l-transparent border-r-transparent
          ${isSelected ? 'border-t-blue-600' : 'border-t-white'}
        `}
      />
    </button>
  );
}

// Hotel popup card when marker is selected
function HotelPopup({
  hotel,
  onClose,
  onViewDetails,
}: {
  hotel: SupplierHotelSummary;
  onClose: () => void;
  onViewDetails: () => void;
}) {
  const price = hotel.startingRate ?? 0;
  const currency = hotel.currency || 'GBP';

  const formattedPrice = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-50">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white z-10"
      >
        ×
      </button>

      {hotel.heroImage && (
        <div
          className="h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${hotel.heroImage})` }}
        />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 line-clamp-1">{hotel.name}</h3>
          <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 rounded text-sm font-bold shrink-0">
            ★ {hotel.rating.toFixed(1)}
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-3">{hotel.location}</p>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">{formattedPrice}</span>
            <span className="text-gray-500 text-sm"> / night</span>
          </div>
          <button
            onClick={onViewDetails}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

export function MapView({ hotels, destination, onHotelSelect, selectedHotelId }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedHotel, setSelectedHotel] = useState<SupplierHotelSummary | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Get center coordinates based on destination
  const getCenterCoords = useCallback(() => {
    const destLower = destination?.toLowerCase() || '';
    for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
      if (destLower.includes(city)) {
        return coords;
      }
    }
    // Default to London
    return CITY_COORDINATES.london;
  }, [destination]);

  const centerCoords = getCenterCoords();

  // Generate pseudo-random but deterministic positions for hotels
  const getHotelPosition = useCallback(
    (hotel: SupplierHotelSummary, index: number) => {
      // Use hotel ID to generate consistent random offset
      const seed = hotel.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const angle = ((seed + index * 137.5) % 360) * (Math.PI / 180);
      const distance = 0.02 + ((seed % 100) / 100) * 0.03; // 2-5km radius

      const lat = centerCoords.lat + Math.sin(angle) * distance;
      const lng = centerCoords.lng + Math.cos(angle) * distance * 1.5; // Adjust for map projection

      // Convert to percentage position in the map container
      const latRange = 0.08; // Total latitude range to show
      const lngRange = 0.12; // Total longitude range to show

      const x = ((lng - (centerCoords.lng - lngRange / 2)) / lngRange) * 100;
      const y = (((centerCoords.lat + latRange / 2) - lat) / latRange) * 100;

      return { x: Math.max(5, Math.min(95, x)), y: Math.max(10, Math.min(90, y)) };
    },
    [centerCoords]
  );

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleMarkerClick = (hotel: SupplierHotelSummary) => {
    setSelectedHotel(hotel);
    onHotelSelect?.(hotel);
  };

  const handleViewDetails = () => {
    if (selectedHotel) {
      window.location.href = `/hotels/${selectedHotel.slug || selectedHotel.id}`;
    }
  };

  return (
    <div
      ref={mapRef}
      className="relative w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, #e8f4f8 0%, #d4e9ed 100%),
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L30 60M0 30L60 30' stroke='%23cde4e8' stroke-width='0.5'/%3E%3C/svg%3E")
        `,
        backgroundSize: 'cover, 60px 60px',
      }}
    >
      {/* Map styling to simulate a real map */}
      <div className="absolute inset-0 opacity-30">
        {/* Simulated roads */}
        <svg className="w-full h-full">
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#a8d0d6" strokeWidth="3" />
          <line x1="0" y1="60%" x2="100%" y2="55%" stroke="#a8d0d6" strokeWidth="2" />
          <line x1="20%" y1="0" x2="25%" y2="100%" stroke="#a8d0d6" strokeWidth="2" />
          <line x1="70%" y1="0" x2="75%" y2="100%" stroke="#a8d0d6" strokeWidth="3" />
          <line x1="40%" y1="0" x2="50%" y2="100%" stroke="#a8d0d6" strokeWidth="1" />
          {/* Park area */}
          <ellipse cx="60%" cy="40%" rx="15%" ry="10%" fill="#b8e0c8" opacity="0.5" />
        </svg>
      </div>

      {/* Loading state */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Hotel markers */}
      {mapLoaded &&
        hotels.map((hotel, index) => {
          const pos = getHotelPosition(hotel, index);
          return (
            <PriceMarker
              key={hotel.id}
              hotel={hotel}
              isSelected={selectedHotelId === hotel.id || selectedHotel?.id === hotel.id}
              onClick={() => handleMarkerClick(hotel)}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            />
          );
        })}

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
      </div>

      {/* Destination label */}
      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-md">
        <p className="text-sm font-semibold text-gray-900">{destination || 'Hotels'}</p>
        <p className="text-xs text-gray-500">{hotels.length} properties</p>
      </div>

      {/* Selected hotel popup */}
      {selectedHotel && (
        <HotelPopup
          hotel={selectedHotel}
          onClose={() => setSelectedHotel(null)}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        Map data for illustration
      </div>
    </div>
  );
}

export default MapView;

