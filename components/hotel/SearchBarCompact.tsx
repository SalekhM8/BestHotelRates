'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const popularDestinations = [
  'London', 'Manchester', 'Edinburgh', 'Birmingham', 'Liverpool',
  'Paris', 'Barcelona', 'Amsterdam', 'Dubai', 'New York',
];

type Props = {
  initialDestination?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  initialChildren?: number;
  initialRooms?: number;
};

export function SearchBarCompact({
  initialDestination = '',
  initialCheckIn = '',
  initialCheckOut = '',
  initialAdults = 2,
  initialChildren = 0,
  initialRooms = 1,
}: Props) {
  const router = useRouter();
  const [destination, setDestination] = useState(initialDestination);
  const [showDestinations, setShowDestinations] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(
    initialCheckIn ? new Date(initialCheckIn) : null
  );
  const [checkOut, setCheckOut] = useState<Date | null>(
    initialCheckOut ? new Date(initialCheckOut) : null
  );
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);
  const [rooms, setRooms] = useState(initialRooms);
  
  const destinationRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinations(false);
      }
      if (guestRef.current && !guestRef.current.contains(event.target as Node)) {
        setShowGuestPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (!destination) return;

    const params = new URLSearchParams();
    params.set('destination', destination);
    if (checkIn) params.set('checkIn', checkIn.toISOString());
    if (checkOut) params.set('checkOut', checkOut.toISOString());
    params.set('adults', adults.toString());
    params.set('children', children.toString());
    params.set('rooms', rooms.toString());

    router.push(`/search?${params.toString()}`);
  };

  const filteredDestinations = destination
    ? popularDestinations.filter(d => d.toLowerCase().includes(destination.toLowerCase()))
    : popularDestinations;

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-white rounded-lg border-4 border-[#FFB700] p-1">
      <div className="flex flex-col md:flex-row gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        {/* Destination */}
        <div ref={destinationRef} className="relative flex-1">
          <div className="flex items-center h-12 px-4 gap-3">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Where are you going?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => setShowDestinations(true)}
              className="flex-1 h-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm"
            />
            {destination && (
              <button onClick={() => setDestination('')} className="p-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {showDestinations && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-60 overflow-y-auto">
              <div className="p-2">
                {filteredDestinations.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setDestination(city);
                      setShowDestinations(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded text-left"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-sm text-gray-900">{city}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="flex-1">
          <div className="flex items-center h-12 px-4 gap-3">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="flex items-center gap-2 flex-1">
              <DatePicker
                selected={checkIn}
                onChange={(date) => setCheckIn(date)}
                selectsStart
                startDate={checkIn}
                endDate={checkOut}
                minDate={new Date()}
                placeholderText="Check-in"
                dateFormat="EEE d MMM"
                className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm cursor-pointer"
              />
              <span className="text-gray-300">—</span>
              <DatePicker
                selected={checkOut}
                onChange={(date) => setCheckOut(date)}
                selectsEnd
                startDate={checkIn}
                endDate={checkOut}
                minDate={checkIn || new Date()}
                placeholderText="Check-out"
                dateFormat="EEE d MMM"
                className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-sm cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Guests */}
        <div ref={guestRef} className="relative flex-1 md:max-w-xs">
          <button
            onClick={() => setShowGuestPicker(!showGuestPicker)}
            className="flex items-center h-12 px-4 gap-3 w-full text-left"
          >
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm text-gray-900 flex-1 truncate">
              {adults} adults · {children} children · {rooms} room
            </span>
          </button>

          {showGuestPicker && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
              {/* Adults */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-900">Adults</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-[#5DADE2] disabled:opacity-40">−</button>
                  <span className="w-6 text-center text-sm">{adults}</span>
                  <button onClick={() => setAdults(adults + 1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-[#5DADE2]">+</button>
                </div>
              </div>
              {/* Children */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-900">Children</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-[#5DADE2] disabled:opacity-40">−</button>
                  <span className="w-6 text-center text-sm">{children}</span>
                  <button onClick={() => setChildren(children + 1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-[#5DADE2]">+</button>
                </div>
              </div>
              {/* Rooms */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-900">Rooms</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setRooms(Math.max(1, rooms - 1))} disabled={rooms <= 1} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-[#5DADE2] disabled:opacity-40">−</button>
                  <span className="w-6 text-center text-sm">{rooms}</span>
                  <button onClick={() => setRooms(rooms + 1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-[#5DADE2]">+</button>
                </div>
              </div>
              <button onClick={() => setShowGuestPicker(false)} className="w-full mt-3 py-2 bg-[#5DADE2] text-white text-sm font-medium rounded hover:bg-[#3498DB]">Done</button>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="h-12 px-6 bg-[#5DADE2] hover:bg-[#3498DB] text-white font-semibold rounded-r transition-colors"
        >
          Search
        </button>
      </div>
    </div>
  );
}

