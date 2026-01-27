'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';
import { SupplierHotelDetails } from '@/lib/suppliers/types';
import { useRecentlyViewed } from '@/lib/hooks/useRecentlyViewed';

type Props = {
  hotel: SupplierHotelDetails;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  initialChildren?: number;
  initialRooms?: number;
};

export const HotelDetailsClient: React.FC<Props> = ({ 
  hotel, 
  initialCheckIn, 
  initialCheckOut, 
  initialAdults, 
  initialChildren,
  initialRooms 
}) => {
  const router = useRouter();
  const { addRecentlyViewed } = useRecentlyViewed();
  
  useEffect(() => {
    addRecentlyViewed({
      id: hotel.id,
      slug: hotel.slug,
      name: hotel.name,
      location: hotel.location,
      rating: hotel.rating,
      startingRate: hotel.startingRate,
      currency: hotel.currency,
      image: hotel.primaryImage ?? hotel.heroImage,
    });
  }, [hotel.id]);
  
  const images = hotel.images;
  const hasImages = images.length > 0;
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<string | null>(null);
  
  const [checkIn, setCheckIn] = useState<Date>(() => {
    if (initialCheckIn) {
      const parsed = new Date(initialCheckIn);
      return isNaN(parsed.getTime()) ? defaultCheckIn() : parsed;
    }
    return defaultCheckIn();
  });
  const [checkOut, setCheckOut] = useState<Date>(() => {
    if (initialCheckOut) {
      const parsed = new Date(initialCheckOut);
      return isNaN(parsed.getTime()) ? addDays(defaultCheckIn(), 2) : parsed;
    }
    return addDays(defaultCheckIn(), 2);
  });
  const [rooms, setRooms] = useState(initialRooms ?? 1);
  const [adults, setAdults] = useState(initialAdults ?? 2);
  const [children, setChildren] = useState(initialChildren ?? 0);

  const selectedRoom = useMemo(
    () => hotel.roomTypes.find((room) => room.id === selectedRoomId) ?? hotel.roomTypes[0],
    [hotel.roomTypes, selectedRoomId],
  );

  const selectedRatePlan = useMemo(() => {
    if (!selectedRoom) return undefined;
    return (
      selectedRoom.ratePlans.find((plan) => plan.id === selectedRatePlanId) ??
      selectedRoom.ratePlans[0]
    );
  }, [selectedRoom, selectedRatePlanId]);

  const nights = useMemo(() => diffInNights(checkIn, checkOut), [checkIn, checkOut]);

  const totals = useMemo(() => {
    const nightlyRate = selectedRatePlan?.baseRate ?? 0;
    const subtotal = nightlyRate * nights * rooms;
    const taxes = (selectedRatePlan?.taxes ?? 0) * nights * rooms;
    const fees = (selectedRatePlan?.fees ?? 0) * rooms;
    const total = subtotal + taxes + fees;
    return { nightlyRate, subtotal, taxes, fees, total };
  }, [selectedRatePlan, nights, rooms]);

  useEffect(() => {
    setSelectedRoomId(hotel.roomTypes[0]?.id ?? null);
    setSelectedRatePlanId(hotel.roomTypes[0]?.ratePlans[0]?.id ?? null);
  }, [hotel]);

  const handleBook = () => {
    if (!selectedRoom || !selectedRatePlan) return;
    const params = new URLSearchParams({
      hotelId: hotel.id,
      roomTypeId: selectedRoom.id,
      ratePlanId: selectedRatePlan.id,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      adults: String(adults),
      children: String(children),
      rooms: String(rooms),
    });
    router.push(`/booking?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hotel Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StarRating stars={hotel.rating} />
            <span className="text-sm text-gray-500">Hotel</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{hotel.name}</h1>
          <div className="flex items-center gap-2 text-sm">
            <a href="#" className="text-[#5DADE2] hover:underline">{hotel.location}</a>
            <span className="text-gray-400">–</span>
            <a href="#" className="text-[#5DADE2] hover:underline">Excellent location – show map</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Wishlist */}
          <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          {/* Share */}
          <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          {/* Reserve button */}
          <button 
            onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-2.5 bg-[#5DADE2] hover:bg-[#3498DB] text-white font-semibold rounded transition-colors"
          >
            Reserve
          </button>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="grid grid-cols-4 gap-2 mb-6 rounded-lg overflow-hidden">
        {hasImages ? (
          <>
            <div className="col-span-2 row-span-2 relative aspect-[4/3]">
              <Image
                src={images[0]?.url || ''}
                alt={hotel.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {images.slice(1, 5).map((img, index) => (
              <div key={img.id} className="relative aspect-[4/3]">
                <Image
                  src={img.url}
                  alt={img.caption ?? hotel.name}
                  fill
                  className="object-cover"
                />
                {index === 3 && images.length > 5 && (
                  <button 
                    onClick={() => setShowAllPhotos(true)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold hover:bg-black/60 transition-colors"
                  >
                    +{images.length - 5} photos
                  </button>
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="col-span-4 aspect-[3/1] bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No photos available</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rating & Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-100">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="rating-badge">{hotel.rating.toFixed(1)}</div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {hotel.rating >= 4.5 ? 'Fabulous' : hotel.rating >= 4 ? 'Very Good' : hotel.rating >= 3.5 ? 'Good' : 'Pleasant'}
                    </p>
                    <p className="text-sm text-gray-500">{Math.floor(Math.random() * 500) + 100} reviews</p>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
            
            {/* Highlights */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Most popular facilities</h3>
              <div className="flex flex-wrap gap-3">
                {hotel.amenities.slice(0, 8).map((amenity, idx) => {
                  const name = typeof amenity === 'string' ? amenity : amenity.name;
                  return (
                    <span key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-[#5DADE2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Availability Section */}
          <div id="rooms" className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Availability</h2>
            
            {/* Date/Guest Picker */}
            <div className="bg-[#FFB700] p-1 rounded-lg mb-6">
              <div className="flex flex-col md:flex-row gap-1">
                <div className="flex-1 bg-white rounded-md">
                  <div className="flex items-center h-12 px-4 gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <DatePicker
                      selected={checkIn}
                      onChange={(date) => date && setCheckIn(date)}
                      selectsStart
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={new Date()}
                      dateFormat="EEE d MMM"
                      className="flex-1 bg-transparent border-none outline-none text-gray-900 text-sm"
                    />
                    <span className="text-gray-300">—</span>
                    <DatePicker
                      selected={checkOut}
                      onChange={(date) => date && setCheckOut(date)}
                      selectsEnd
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={addDays(checkIn, 1)}
                      dateFormat="EEE d MMM"
                      className="flex-1 bg-transparent border-none outline-none text-gray-900 text-sm"
                    />
                  </div>
                </div>
                <div className="flex-1 md:max-w-xs bg-white rounded-md">
                  <div className="flex items-center h-12 px-4 gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm text-gray-900">{adults} adults · {children} children · {rooms} room</span>
                  </div>
                </div>
                <button className="h-12 px-6 bg-[#5DADE2] hover:bg-[#3498DB] text-white font-semibold rounded transition-colors">
                  Change search
                </button>
              </div>
            </div>

            {/* Room Types Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#5DADE2] text-white">
                    <th className="text-left p-3 font-semibold">Room type</th>
                    <th className="text-left p-3 font-semibold">Sleeps</th>
                    <th className="text-left p-3 font-semibold">Price for {nights} nights</th>
                    <th className="text-left p-3 font-semibold">Your choices</th>
                    <th className="text-left p-3 font-semibold">Select rooms</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {hotel.roomTypes.map((room) => (
                    room.ratePlans.map((plan, planIndex) => (
                      <tr key={`${room.id}-${plan.id}`} className="border-b border-gray-200 hover:bg-gray-50">
                        {planIndex === 0 && (
                          <td className="p-3 align-top" rowSpan={room.ratePlans.length}>
                            <div className="font-semibold text-[#5DADE2] hover:underline cursor-pointer">{room.name}</div>
                            <p className="text-gray-500 text-xs mt-1">{room.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {room.amenities?.slice(0, 4).map((a, i) => (
                                <span key={i} className="text-xs text-gray-500">• {typeof a === 'string' ? a : a.name}</span>
                              ))}
                            </div>
                          </td>
                        )}
                        {planIndex === 0 && (
                          <td className="p-3 align-top" rowSpan={room.ratePlans.length}>
                            <div className="flex items-center gap-1">
                              {[...Array(room.maxAdults)].map((_, i) => (
                                <svg key={i} className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                              ))}
                            </div>
                          </td>
                        )}
                        <td className="p-3 align-top">
                          <div className="font-bold text-gray-900">
                            {formatCurrency(plan.currency, plan.baseRate * nights * rooms)}
                          </div>
                          <p className="text-xs text-gray-500">Includes taxes and charges</p>
                        </td>
                        <td className="p-3 align-top">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-700 capitalize">{plan.boardType.replace(/_/g, ' ')}</p>
                            {plan.cancellationPolicy && (
                              <p className={`text-xs font-medium ${plan.cancellationPolicy.refundableUntilHours ? 'text-green-600' : 'text-gray-500'}`}>
                                {plan.cancellationPolicy.refundableUntilHours ? 'Free cancellation' : 'Non-refundable'}
                              </p>
                            )}
                            {plan.availableRooms && plan.availableRooms <= 5 && (
                              <p className="text-xs text-red-600 font-semibold">Only {plan.availableRooms} left!</p>
                            )}
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <select 
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#5DADE2] focus:outline-none"
                            value={selectedRatePlanId === plan.id ? rooms : 0}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (val > 0) {
                                setSelectedRoomId(room.id);
                                setSelectedRatePlanId(plan.id);
                                setRooms(val);
                              }
                            }}
                          >
                            <option value={0}>0</option>
                            {[1, 2, 3, 4, 5].map(n => (
                              <option key={n} value={n}>{n} ({formatCurrency(plan.currency, plan.baseRate * nights * n)})</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 align-top">
                          {selectedRatePlanId === plan.id && selectedRoomId === room.id && (
                            <button
                              onClick={handleBook}
                              className="px-4 py-2 bg-[#5DADE2] hover:bg-[#3498DB] text-white font-semibold rounded text-sm whitespace-nowrap transition-colors"
                            >
                              I'll reserve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Amenities Full List */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Facilities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
              {hotel.amenities.map((amenity, idx) => {
                const name = typeof amenity === 'string' ? amenity : amenity.name;
                return (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-[#5DADE2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Price Summary Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
            <h3 className="font-bold text-gray-900 mb-4">Price summary</h3>
            
            {selectedRatePlan ? (
              <>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{nights} nights, {rooms} room</span>
                    <span className="text-gray-900">{formatCurrency(selectedRatePlan.currency, totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes & fees</span>
                    <span className="text-gray-900">{formatCurrency(selectedRatePlan.currency, totals.taxes + totals.fees)}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3 mb-4">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">{formatCurrency(selectedRatePlan.currency, totals.total)}</span>
                  </div>
                  <p className="text-xs text-gray-500 text-right">Includes taxes and charges</p>
                </div>
                <button
                  onClick={handleBook}
                  className="w-full py-3 bg-[#5DADE2] hover:bg-[#3498DB] text-white font-semibold rounded transition-colors"
                >
                  Reserve
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Select a room to see the price</p>
            )}
          </div>

          {/* Map Card */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="aspect-[4/3] bg-gray-100 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <p className="text-sm text-gray-500">Map</p>
                </div>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-gray-900">{hotel.location}</p>
              <a href="#" className="text-sm text-[#5DADE2] hover:underline">Excellent location – show map</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(Math.floor(stars))].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function formatCurrency(currency: string, amount: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency || 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function defaultCheckIn() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return addDays(today, 1);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function diffInNights(from: Date, to: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.floor((to.getTime() - from.getTime()) / msPerDay));
}
