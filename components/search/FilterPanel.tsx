'use client';

import React from 'react';
import { PriceSlider } from './PriceSlider';
import { GlassCard } from '../ui/GlassCard';

export interface SearchFilters {
  priceRange: [number, number];
  starRating: number[];
  amenities: string[];
  boardTypes: string[];
  refundableOnly: boolean;
  payAtHotel: boolean;
}

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  priceHistogram?: number[];
  resultsCount: number;
  onClearAll: () => void;
}

const STAR_OPTIONS = [5, 4, 3, 2, 1];

// Amenities removed - HotelBeds API doesn't provide amenity data in search results

const BOARD_OPTIONS = [
  { id: 'breakfast', label: 'Breakfast Included', icon: '🥐' },
  { id: 'halfboard', label: 'Half Board', icon: '🍽️' },
  { id: 'fullboard', label: 'Full Board', icon: '🍴' },
  { id: 'allinclusive', label: 'All Inclusive', icon: '🌴' },
];

export function FilterPanel({
  filters,
  onChange,
  priceHistogram = [],
  resultsCount,
  onClearAll,
}: FilterPanelProps) {
  const toggleStarRating = (star: number) => {
    const newStars = filters.starRating.includes(star)
      ? filters.starRating.filter((s) => s !== star)
      : [...filters.starRating, star];
    onChange({ ...filters, starRating: newStars });
  };

  // toggleAmenity removed - HotelBeds doesn't support amenity filtering

  const toggleBoardType = (boardId: string) => {
    const newBoardTypes = filters.boardTypes.includes(boardId)
      ? filters.boardTypes.filter((b) => b !== boardId)
      : [...filters.boardTypes, boardId];
    onChange({ ...filters, boardTypes: newBoardTypes });
  };

  const hasActiveFilters =
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 2000 ||
    filters.starRating.length > 0 ||
    filters.amenities.length > 0 ||
    filters.boardTypes.length > 0 ||
    filters.refundableOnly ||
    filters.payAtHotel;

  return (
    <GlassCard className="sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <p className="text-white/80">
          <span className="text-2xl font-bold text-white">{resultsCount}</span> hotels found
        </p>
      </div>

      {/* Price Range */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
          Price per night
        </h4>
        <PriceSlider
          min={0}
          max={2000}
          value={filters.priceRange}
          onChange={(priceRange) => onChange({ ...filters, priceRange })}
          histogram={priceHistogram}
        />
      </div>

      {/* Quick Filters */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
          Popular filters
        </h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.refundableOnly}
              onChange={(e) =>
                onChange({ ...filters, refundableOnly: e.target.checked })
              }
              className="w-5 h-5 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-white group-hover:text-white/80 transition-colors">
              Free cancellation
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.payAtHotel}
              onChange={(e) =>
                onChange({ ...filters, payAtHotel: e.target.checked })
              }
              className="w-5 h-5 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-white group-hover:text-white/80 transition-colors">
              Pay at hotel
            </span>
          </label>
        </div>
      </div>

      {/* Star Rating */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
          Star rating
        </h4>
        <div className="flex flex-wrap gap-2">
          {STAR_OPTIONS.map((star) => (
            <button
              key={star}
              onClick={() => toggleStarRating(star)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-all ${
                filters.starRating.includes(star)
                  ? 'bg-blue-500/30 border-blue-400 text-white'
                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <span>{star}</span>
              <svg
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Board Type / Meals */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
          Meals included
        </h4>
        <div className="space-y-2">
          {BOARD_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => toggleBoardType(option.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all ${
                filters.boardTypes.includes(option.id)
                  ? 'bg-blue-500/30 border-blue-400 text-white'
                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amenities removed - HotelBeds API doesn't provide amenity data in search results */}
    </GlassCard>
  );
}

