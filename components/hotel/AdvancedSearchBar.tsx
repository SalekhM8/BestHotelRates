'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Debounce helper
function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  return (...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

// City suggestions for autocomplete
const cities = [
  'London, UK', 'Dubai, UAE', 'Paris, France', 'New York, USA', 
  'Tokyo, Japan', 'Barcelona, Spain', 'Amsterdam, Netherlands',
  'Singapore', 'Rome, Italy', 'Sydney, Australia', 'Bangkok, Thailand',
  'Istanbul, Turkey', 'Los Angeles, USA', 'Hong Kong', 'Miami, USA'
];

export const AdvancedSearchBar: React.FC = () => {
  const [destination, setDestination] = useState('');
  const [showDestinations, setShowDestinations] = useState(false);
  const [filteredCities, setFilteredCities] = useState(cities);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const router = useRouter();
  
  const destinationRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
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

  // Save search state to sessionStorage whenever it changes
  useEffect(() => {
    const searchState = {
      checkIn: checkIn?.toISOString() || null,
      checkOut: checkOut?.toISOString() || null,
      adults,
      children,
      rooms,
    };
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('searchState', JSON.stringify(searchState));
    }
  }, [checkIn, checkOut, adults, children, rooms]);

  const updateFilteredCities = useDebouncedCallback((value: string) => {
    if (value) {
      const filtered = cities.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, 250);

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    setShowDestinations(true);
    updateFilteredCities(value);
  };

  const selectDestination = (city: string) => {
    setDestination(city);
    setShowDestinations(false);
  };

  const handleSearch = useDebouncedCallback(() => {
    if (!destination) {
      alert('Please enter a destination');
      return;
    }

    const params = new URLSearchParams();
    params.set('destination', destination);
    if (checkIn) params.set('checkIn', checkIn.toISOString());
    if (checkOut) params.set('checkOut', checkOut.toISOString());
    params.set('adults', adults.toString());
    params.set('children', children.toString());
    params.set('rooms', rooms.toString());

    router.push(`/search?${params.toString()}`);
  }, 300);

  const totalGuests = adults + children;

  return (
    <div className="w-full px-4 md:px-6 mt-16 md:mt-20 mb-8 md:mb-12 relative z-50">
      <div className="max-w-[1200px] mx-auto relative z-50">
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
        <div className="glass-card p-3 md:p-2 relative z-50">
          {/* Mobile: Vertical Stack, Desktop: Horizontal */}
          <div className="flex flex-col md:flex-row items-stretch md:bg-white/5 md:rounded-full gap-0 md:gap-0 relative z-50">
            
            {/* Destination with Autocomplete */}
            <div ref={destinationRef} className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-white/5 md:bg-transparent rounded-xl md:rounded-none mb-2 md:mb-0 md:border-r border-white/10 relative">
              <label className="block text-[10px] md:text-xs font-bold text-white uppercase tracking-wider mb-1">
                Where
              </label>
              <input
                type="text"
                placeholder="Search destinations"
                value={destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                onFocus={() => setShowDestinations(true)}
                className="w-full bg-transparent border-none outline-none text-white text-sm md:text-base placeholder:text-white/50 font-medium"
              />
              
              {/* Autocomplete Dropdown */}
              {showDestinations && filteredCities.length > 0 && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 p-3 z-[9999] max-h-60 overflow-y-auto rounded-2xl border-2 border-[rgba(135,206,250,0.3)]"
                  style={{
                    background: 'rgba(20, 30, 70, 0.98)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  {filteredCities.map((city, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectDestination(city)}
                      className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                    >
                      <svg className="inline w-4 h-4 mr-2 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Check in with DatePicker */}
            <div className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-white/5 md:bg-transparent rounded-xl md:rounded-none mb-2 md:mb-0 md:border-r border-white/10">
              <label className="block text-[10px] md:text-xs font-bold text-white uppercase tracking-wider mb-1">
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
                dateFormat="dd MMM yyyy"
                className="w-full bg-transparent border-none outline-none text-white text-sm md:text-base placeholder:text-white/50 font-medium cursor-pointer"
                calendarClassName="custom-datepicker"
              />
            </div>

            {/* Check out with DatePicker */}
            <div className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-white/5 md:bg-transparent rounded-xl md:rounded-none mb-2 md:mb-0 md:border-r border-white/10">
              <label className="block text-[10px] md:text-xs font-bold text-white uppercase tracking-wider mb-1">
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
                dateFormat="dd MMM yyyy"
                className="w-full bg-transparent border-none outline-none text-white text-sm md:text-base placeholder:text-white/50 font-medium cursor-pointer"
                calendarClassName="custom-datepicker"
              />
            </div>

            {/* Guests with Custom Picker */}
            <div ref={guestRef} className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-white/5 md:bg-transparent rounded-xl md:rounded-none mb-3 md:mb-0 relative">
              <label className="block text-[10px] md:text-xs font-bold text-white uppercase tracking-wider mb-1">
                Guests
              </label>
              <button
                type="button"
                onClick={() => setShowGuestPicker(!showGuestPicker)}
                className="w-full bg-transparent border-none outline-none text-white text-sm md:text-base font-medium text-left cursor-pointer"
              >
                {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}, {rooms} {rooms === 1 ? 'room' : 'rooms'}
              </button>

              {/* Guest Picker Dropdown */}
              {showGuestPicker && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 bg-black/40 z-[9998] md:hidden"
                    onClick={() => setShowGuestPicker(false)}
                  />
                  <div 
                    className="absolute top-full left-0 right-0 md:right-auto md:w-80 mt-2 p-5 z-[9999] rounded-2xl border-2 border-[rgba(135,206,250,0.3)]"
                    style={{
                      background: 'rgba(20, 30, 70, 0.98)',
                      backdropFilter: 'blur(30px)',
                      WebkitBackdropFilter: 'blur(30px)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                  {/* Adults */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-white font-semibold text-sm">Adults</p>
                      <p className="text-white/60 text-xs">Ages 13+</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        disabled={adults <= 1}
                        className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all disabled:opacity-30"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                      <span className="text-white font-bold w-8 text-center">{adults}</span>
                      <button
                        onClick={() => setAdults(adults + 1)}
                        className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-white font-semibold text-sm">Children</p>
                      <p className="text-white/60 text-xs">Ages 0-12</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        disabled={children <= 0}
                        className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all disabled:opacity-30"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                      <span className="text-white font-bold w-8 text-center">{children}</span>
                      <button
                        onClick={() => setChildren(children + 1)}
                        className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Rooms */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white font-semibold text-sm">Rooms</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setRooms(Math.max(1, rooms - 1))}
                        disabled={rooms <= 1}
                        className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all disabled:opacity-30"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                      <span className="text-white font-bold w-8 text-center">{rooms}</span>
                      <button
                        onClick={() => setRooms(rooms + 1)}
                        className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowGuestPicker(false)}
                    className="w-full glass-card-small px-4 py-2 text-white font-semibold text-sm hover:bg-white/10"
                  >
                    Done
                  </button>
                </div>
                </>
              )}
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

