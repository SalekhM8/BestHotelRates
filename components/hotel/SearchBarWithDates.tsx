'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';

export const SearchBarWithDates: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (destination) searchParams.set('destination', destination);
    if (checkIn) searchParams.set('checkIn', checkIn.toISOString());
    if (checkOut) searchParams.set('checkOut', checkOut.toISOString());
    if (guests) searchParams.set('guests', guests);

    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="w-full px-6 mt-20 mb-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            Find Your Perfect Stay
          </h1>
          <p className="text-xl text-white/90 drop-shadow-lg">
            Discover unbeatable hotel deals worldwide
          </p>
        </div>

        {/* Search Card */}
        <div className="glass-card p-2">
          <div className="flex flex-col md:flex-row items-stretch bg-white/5 rounded-full overflow-hidden">
            {/* Where */}
            <div className="flex-1 px-6 py-4 border-b md:border-b-0 md:border-r border-white/10">
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                Where
              </label>
              <input
                type="text"
                placeholder="Search destinations"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-white text-base placeholder:text-white/50 font-medium"
              />
            </div>

            {/* Check in */}
            <div className="flex-1 px-6 py-4 border-b md:border-b-0 md:border-r border-white/10 date-picker-wrapper">
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                Check in
              </label>
              <DatePicker
                selected={checkIn}
                onChange={(date) => setCheckIn(date)}
                selectsStart
                startDate={checkIn}
                endDate={checkOut}
                minDate={new Date()}
                placeholderText="Add dates"
                dateFormat="dd MMM"
                className="w-full bg-transparent border-none outline-none text-white text-base placeholder:text-white/50 font-medium cursor-pointer"
              />
            </div>

            {/* Check out */}
            <div className="flex-1 px-6 py-4 border-b md:border-b-0 md:border-r border-white/10 date-picker-wrapper">
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                Check out
              </label>
              <DatePicker
                selected={checkOut}
                onChange={(date) => setCheckOut(date)}
                selectsEnd
                startDate={checkIn}
                endDate={checkOut}
                minDate={checkIn || new Date()}
                placeholderText="Add dates"
                dateFormat="dd MMM"
                className="w-full bg-transparent border-none outline-none text-white text-base placeholder:text-white/50 font-medium cursor-pointer"
              />
            </div>

            {/* Guests */}
            <div className="flex-1 px-6 py-4 flex items-end">
              <div className="w-full">
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Guests
                </label>
                <input
                  type="number"
                  placeholder="Add guests"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  min="1"
                  className="w-full bg-transparent border-none outline-none text-white text-base placeholder:text-white/50 font-medium"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-center justify-center p-2">
              <button
                onClick={handleSearch}
                className="w-14 h-14 rounded-full bg-[rgba(135,206,250,0.4)] backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[rgba(135,206,250,0.6)] transition-all hover:scale-105 shadow-lg"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

