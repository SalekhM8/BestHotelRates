'use client';

import React, { useState } from 'react';

type Props = {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  starRatings: number[];
  onStarRatingsChange: (ratings: number[]) => void;
  selectedFilters: string[];
  onFiltersChange: (filters: string[]) => void;
};

const popularFilters = [
  { id: 'hotels', label: 'Hotels', count: 902 },
  { id: 'very-good', label: 'Very good: 8+', count: 1147, sub: 'Based on guest reviews' },
  { id: '4-stars', label: '4 stars', count: 972 },
  { id: 'breakfast', label: 'Breakfast included', count: 562 },
  { id: 'twin-beds', label: 'Twin beds', count: 676 },
  { id: 'private-bathroom', label: 'Private bathroom', count: 1956 },
];

const facilityFilters = [
  { id: 'free-wifi', label: 'Free WiFi', count: 2341 },
  { id: 'parking', label: 'Parking', count: 876 },
  { id: 'pet-friendly', label: 'Pet friendly', count: 234 },
  { id: 'swimming-pool', label: 'Swimming pool', count: 156 },
  { id: 'fitness-centre', label: 'Fitness centre', count: 445 },
  { id: 'restaurant', label: 'Restaurant', count: 678 },
  { id: '24hr-reception', label: '24-hour reception', count: 1234 },
  { id: 'non-smoking', label: 'Non-smoking rooms', count: 1987 },
];

const propertyTypes = [
  { id: 'hotels', label: 'Hotels', count: 902 },
  { id: 'apartments', label: 'Apartments', count: 543 },
  { id: 'guest-houses', label: 'Guest houses', count: 234 },
  { id: 'hostels', label: 'Hostels', count: 67 },
  { id: 'b-and-b', label: 'B&Bs', count: 178 },
];

export function FilterPanel({
  priceRange,
  onPriceRangeChange,
  starRatings,
  onStarRatingsChange,
  selectedFilters,
  onFiltersChange,
}: Props) {
  const [showAllFacilities, setShowAllFacilities] = useState(false);

  const toggleFilter = (filterId: string) => {
    if (selectedFilters.includes(filterId)) {
      onFiltersChange(selectedFilters.filter(f => f !== filterId));
    } else {
      onFiltersChange([...selectedFilters, filterId]);
    }
  };

  const toggleStarRating = (star: number) => {
    if (starRatings.includes(star)) {
      onStarRatingsChange(starRatings.filter(s => s !== star));
    } else {
      onStarRatingsChange([...starRatings, star]);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-bold text-gray-900">Filter by:</h2>
      </div>

      {/* Budget */}
      <div className="filter-section px-4">
        <h3 className="filter-title">Your budget (per night)</h3>
        <p className="text-sm text-gray-600 mb-3">£{priceRange[0]} - £{priceRange[1]}+</p>
        
        {/* Price Distribution (simplified) */}
        <div className="flex items-end h-12 gap-0.5 mb-3">
          {[20, 35, 55, 80, 65, 45, 30, 15, 10, 8].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-[#5DADE2] rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        <div className="relative">
          <input
            type="range"
            min="0"
            max="500"
            value={priceRange[1]}
            onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#5DADE2]"
          />
        </div>
      </div>

      {/* Popular Filters */}
      <div className="filter-section px-4">
        <h3 className="filter-title">Popular filters</h3>
        <div className="space-y-1">
          {popularFilters.map((filter) => (
            <label key={filter.id} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedFilters.includes(filter.id)}
                onChange={() => toggleFilter(filter.id)}
                className="w-5 h-5 rounded border-gray-300 text-[#5DADE2] focus:ring-[#5DADE2]"
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-700">{filter.label}</span>
                {filter.sub && (
                  <p className="text-xs text-gray-500">{filter.sub}</p>
                )}
              </div>
              <span className="text-sm text-gray-500">{filter.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Star Rating */}
      <div className="filter-section px-4">
        <h3 className="filter-title">Star rating</h3>
        <div className="flex flex-wrap gap-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => toggleStarRating(star)}
              className={`px-3 py-1.5 border rounded-lg text-sm transition-colors ${
                starRatings.includes(star)
                  ? 'border-[#5DADE2] bg-[#5DADE2]/10 text-[#5DADE2]'
                  : 'border-gray-300 text-gray-700 hover:border-[#5DADE2]'
              }`}
            >
              {star} {star === 1 ? 'star' : 'stars'}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities */}
      <div className="filter-section px-4">
        <h3 className="filter-title">Facilities</h3>
        <div className="space-y-1">
          {(showAllFacilities ? facilityFilters : facilityFilters.slice(0, 5)).map((filter) => (
            <label key={filter.id} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedFilters.includes(filter.id)}
                onChange={() => toggleFilter(filter.id)}
                className="w-5 h-5 rounded border-gray-300 text-[#5DADE2] focus:ring-[#5DADE2]"
              />
              <span className="flex-1 text-sm text-gray-700">{filter.label}</span>
              <span className="text-sm text-gray-500">{filter.count}</span>
            </label>
          ))}
        </div>
        {facilityFilters.length > 5 && (
          <button
            onClick={() => setShowAllFacilities(!showAllFacilities)}
            className="mt-2 text-sm text-[#5DADE2] hover:underline"
          >
            {showAllFacilities ? 'Show less' : `Show all ${facilityFilters.length} facilities`}
          </button>
        )}
      </div>

      {/* Property Type */}
      <div className="filter-section px-4 border-b-0">
        <h3 className="filter-title">Property type</h3>
        <div className="space-y-1">
          {propertyTypes.map((type) => (
            <label key={type.id} className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedFilters.includes(`type-${type.id}`)}
                onChange={() => toggleFilter(`type-${type.id}`)}
                className="w-5 h-5 rounded border-gray-300 text-[#5DADE2] focus:ring-[#5DADE2]"
              />
              <span className="flex-1 text-sm text-gray-700">{type.label}</span>
              <span className="text-sm text-gray-500">{type.count}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
