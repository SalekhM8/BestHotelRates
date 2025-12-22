'use client';

import { useState, useEffect, useCallback } from 'react';

export type RecentlyViewedHotel = {
  id: string;
  slug?: string;
  name: string;
  location: string;
  rating: number;
  startingRate?: number | null;
  currency?: string;
  image?: string | null;
  viewedAt: number; // timestamp
};

const STORAGE_KEY = 'bhr_recently_viewed';
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedHotel[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out items older than 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const filtered = parsed.filter((item: RecentlyViewedHotel) => item.viewedAt > thirtyDaysAgo);
        setRecentlyViewed(filtered);
      }
    } catch (err) {
      console.error('Failed to load recently viewed:', err);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever the list changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
      } catch (err) {
        console.error('Failed to save recently viewed:', err);
      }
    }
  }, [recentlyViewed, isLoaded]);

  // Add a hotel to recently viewed
  const addRecentlyViewed = useCallback((hotel: Omit<RecentlyViewedHotel, 'viewedAt'>) => {
    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((h) => h.id !== hotel.id);
      // Add to front with timestamp
      const newItem: RecentlyViewedHotel = {
        ...hotel,
        viewedAt: Date.now(),
      };
      // Keep only MAX_ITEMS
      return [newItem, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  // Clear all recently viewed
  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    recentlyViewed,
    addRecentlyViewed,
    clearRecentlyViewed,
    isLoaded,
  };
}

