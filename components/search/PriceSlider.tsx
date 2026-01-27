'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface PriceSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  histogram?: number[]; // Array of counts for price buckets
  currency?: string;
}

export function PriceSlider({
  min,
  max,
  value,
  onChange,
  histogram = [],
  currency = '£',
}: PriceSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getPercentage = useCallback(
    (val: number) => ((val - min) / (max - min)) * 100,
    [min, max]
  );

  const getValueFromPercentage = useCallback(
    (percentage: number) => {
      const rawValue = min + (percentage / 100) * (max - min);
      // Round to nearest 10
      return Math.round(rawValue / 10) * 10;
    },
    [min, max]
  );

  const handleMouseDown = (thumb: 'min' | 'max') => {
    setIsDragging(thumb);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const percentage = Math.max(
        0,
        Math.min(100, ((clientX - rect.left) / rect.width) * 100)
      );
      const newValue = getValueFromPercentage(percentage);

      setLocalValue((prev) => {
        if (isDragging === 'min') {
          return [Math.min(newValue, prev[1] - 10), prev[1]];
        } else {
          return [prev[0], Math.max(newValue, prev[0] + 10)];
        }
      });
    },
    [isDragging, getValueFromPercentage]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onChange(localValue);
    }
    setIsDragging(null);
  }, [isDragging, localValue, onChange]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const maxHistogramValue = Math.max(...histogram, 1);

  return (
    <div className="space-y-4">
      {/* Histogram */}
      {histogram.length > 0 && (
        <div className="flex items-end gap-[2px] h-12">
          {histogram.map((count, i) => {
            const height = (count / maxHistogramValue) * 100;
            const bucketMin = min + (i / histogram.length) * (max - min);
            const bucketMax = min + ((i + 1) / histogram.length) * (max - min);
            const isInRange = bucketMin >= localValue[0] && bucketMax <= localValue[1];

            return (
              <div
                key={i}
                className={`flex-1 rounded-t transition-colors ${
                  isInRange ? 'bg-blue-400' : 'bg-white/20'
                }`}
                style={{ height: `${Math.max(height, 4)}%` }}
              />
            );
          })}
        </div>
      )}

      {/* Slider Track */}
      <div
        ref={sliderRef}
        className="relative h-2 bg-white/20 rounded-full cursor-pointer"
      >
        {/* Active Range */}
        <div
          className="absolute h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
          style={{
            left: `${getPercentage(localValue[0])}%`,
            width: `${getPercentage(localValue[1]) - getPercentage(localValue[0])}%`,
          }}
        />

        {/* Min Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg cursor-grab transition-transform ${
            isDragging === 'min' ? 'scale-125 cursor-grabbing' : 'hover:scale-110'
          }`}
          style={{ left: `${getPercentage(localValue[0])}%`, marginLeft: '-10px' }}
          onMouseDown={() => handleMouseDown('min')}
          onTouchStart={() => handleMouseDown('min')}
        />

        {/* Max Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg cursor-grab transition-transform ${
            isDragging === 'max' ? 'scale-125 cursor-grabbing' : 'hover:scale-110'
          }`}
          style={{ left: `${getPercentage(localValue[1])}%`, marginLeft: '-10px' }}
          onMouseDown={() => handleMouseDown('max')}
          onTouchStart={() => handleMouseDown('max')}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-sm">
        <span className="text-white font-medium">
          {currency}{localValue[0]}
        </span>
        <span className="text-white/60">per night</span>
        <span className="text-white font-medium">
          {currency}{localValue[1]}+
        </span>
      </div>
    </div>
  );
}


