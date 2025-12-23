'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export const SearchBar: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (!destination) {
      alert('Please enter a destination');
      return;
    }

    const params = new URLSearchParams();
    params.set('destination', destination);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full px-4 md:px-6 mt-16 md:mt-20 mb-8 md:mb-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 drop-shadow-2xl leading-tight">
            Find Your Perfect Stay
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 drop-shadow-lg">
            Discover unbeatable hotel deals worldwide
          </p>
        </div>

        {/* Search Card */}
        <div className="glass-card p-3 md:p-2">
          {/* Mobile: Vertical Stack, Desktop: Horizontal */}
          <div className="flex flex-col md:flex-row items-stretch md:bg-white/5 md:rounded-full gap-0 md:gap-0">
            {/* Where */}
            <div className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-white/5 md:bg-transparent rounded-xl md:rounded-none mb-2 md:mb-0 md:border-r border-white/10">
              <label className="block text-[10px] md:text-xs font-bold text-white uppercase tracking-wider mb-1">
                Where
              </label>
              <input
                type="text"
                placeholder="Search destinations"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white text-sm md:text-base placeholder:text-white/50 font-medium"
              />
            </div>

            {/* Check in */}
            <div className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-white/5 md:bg-transparent rounded-xl md:rounded-none mb-2 md:mb-0 md:border-r border-white/10">
              <label className="block text-[10px] md:text-xs font-bold text-white uppercase tracking-wider mb-1">
                Check in
              </label>
              <input
                type="text"
                placeholder="Add dates"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white text-sm md:text-base placeholder:text-white/50 font-medium"
              />
            </div>

            {/* Check out */}
            <div className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-white/5 md:bg-transparent rounded-xl md:rounded-none mb-2 md:mb-0 md:border-r border-white/10">
              <label className="block text-[10px] md:text-xs font-bold text-white uppercase tracking-wider mb-1">
                Check out
              </label>
              <input
                type="text"
                placeholder="Add dates"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white text-sm md:text-base placeholder:text-white/50 font-medium"
              />
            </div>

            {/* Guests */}
            <div className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-white/5 md:bg-transparent rounded-xl md:rounded-none mb-3 md:mb-0">
              <label className="block text-[10px] md:text-xs font-bold text-white uppercase tracking-wider mb-1">
                Guests
              </label>
              <input
                type="number"
                placeholder="Add guests"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                min="1"
                className="w-full bg-transparent border-none outline-none text-white text-sm md:text-base placeholder:text-white/50 font-medium"
              />
            </div>

            {/* Search Button */}
            <div className="flex items-center justify-center md:p-2">
              <button
                onClick={handleSearch}
                className="w-full md:w-14 h-12 md:h-14 rounded-full bg-[rgba(135,206,250,0.4)] backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[rgba(135,206,250,0.6)] transition-all hover:scale-105 shadow-lg font-bold text-white md:text-transparent"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="md:w-[22px] md:h-[22px]">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <span className="ml-2 md:hidden">Search</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

