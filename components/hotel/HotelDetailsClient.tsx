'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';
import { SupplierHotelDetails } from '@/lib/suppliers/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useRecentlyViewed } from '@/lib/hooks/useRecentlyViewed';

// No placeholder - only show real HotelBeds images

type Props = {
  hotel: SupplierHotelDetails;
};

export const HotelDetailsClient: React.FC<Props> = ({ hotel }) => {
  const router = useRouter();
  const { addRecentlyViewed } = useRecentlyViewed();
  
  // Track this hotel as recently viewed
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
  }, [hotel.id]); // Only run once when hotel changes
  
  // Use only real HotelBeds images - no placeholders
  const images = hotel.images;
  const hasImages = images.length > 0;
  const primaryImage = hasImages ? images[0] : null;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<Date>(defaultCheckIn());
  const [checkOut, setCheckOut] = useState<Date>(addDays(defaultCheckIn(), 2));
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [addOnSelections, setAddOnSelections] = useState<Record<string, number>>({});

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
  const addOnBreakdown = useMemo(() => {
    return Object.entries(addOnSelections)
      .map(([addOnId, quantity]) => {
        const addOn = hotel.addOns.find((item) => item.id === addOnId);
        if (!addOn) return null;
        const total = addOn.price * quantity;
        return { ...addOn, quantity, total };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [addOnSelections, hotel.addOns]);

  const totals = useMemo(() => {
    const nightlyRate = selectedRatePlan?.baseRate ?? 0;
    const subtotal = nightlyRate * nights * rooms;
    const taxes = (selectedRatePlan?.taxes ?? 0) * nights * rooms;
    const fees = (selectedRatePlan?.fees ?? 0) * rooms;
    const addOns = addOnBreakdown.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + taxes + fees + addOns;
    return { nightlyRate, subtotal, taxes, fees, addOns, total };
  }, [selectedRatePlan, nights, rooms, addOnBreakdown]);

  const handleSelectRatePlan = (roomId: string, ratePlanId: string) => {
    setSelectedRoomId(roomId);
    setSelectedRatePlanId(ratePlanId);
  };

  const toggleAddOn = (addOnId: string) => {
    setAddOnSelections((prev) => {
      const next = { ...prev };
      if (next[addOnId]) {
        delete next[addOnId];
      } else {
        next[addOnId] = 1;
      }
      return next;
    });
  };

  // Hydrate selection from query/sessionStorage if present to persist when navigating back.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qsRoom = params.get('roomTypeId');
      const qsRate = params.get('ratePlanId');
      const qsCheckIn = params.get('checkIn');
      const qsCheckOut = params.get('checkOut');
      const qsAdults = params.get('adults');
      const qsChildren = params.get('children');
      const qsRooms = params.get('rooms');
      const qsAddOns = params.get('addOns');

      const saved = sessionStorage.getItem(`selection:${hotel.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.roomTypeId) setSelectedRoomId(parsed.roomTypeId);
        if (parsed.ratePlanId) setSelectedRatePlanId(parsed.ratePlanId);
        if (parsed.checkIn) setCheckIn(new Date(parsed.checkIn));
        if (parsed.checkOut) setCheckOut(new Date(parsed.checkOut));
        if (parsed.adults) setAdults(parsed.adults);
        if (parsed.children !== undefined) setChildren(parsed.children);
        if (parsed.rooms) setRooms(parsed.rooms);
        if (parsed.addOns) setAddOnSelections(parsed.addOns);
        return;
      }

      setSelectedRoomId(qsRoom ?? hotel.roomTypes[0]?.id ?? null);
      setSelectedRatePlanId(qsRate ?? hotel.roomTypes[0]?.ratePlans[0]?.id ?? null);
      if (qsCheckIn) setCheckIn(new Date(qsCheckIn));
      if (qsCheckOut) setCheckOut(new Date(qsCheckOut));
      if (qsAdults) setAdults(Number(qsAdults) || 2);
      if (qsChildren) setChildren(Number(qsChildren) || 0);
      if (qsRooms) setRooms(Number(qsRooms) || 1);
      if (qsAddOns) {
        try {
          const parsed = JSON.parse(decodeURIComponent(qsAddOns));
          if (Array.isArray(parsed)) {
            const next: Record<string, number> = {};
            parsed.forEach((a) => {
              if (a.id) next[a.id] = Number(a.quantity) || 1;
            });
            setAddOnSelections(next);
          }
        } catch {
          // ignore
        }
      }
    } catch {
      setSelectedRoomId(hotel.roomTypes[0]?.id ?? null);
      setSelectedRatePlanId(hotel.roomTypes[0]?.ratePlans[0]?.id ?? null);
    }
  }, [hotel]);

  const persistSelection = () => {
    if (!selectedRoom || !selectedRatePlan) return;
    const nights = diffInNights(checkIn, checkOut);
    const payload = {
      roomTypeId: selectedRoom?.id,
      ratePlanId: selectedRatePlan?.id,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      adults,
      children,
      rooms,
      addOns: addOnSelections,
    };
    try {
      sessionStorage.setItem(`selection:${hotel.id}`, JSON.stringify(payload));
      // Persist full booking payload for client-side restore fallback
      const selectionPayload = {
        hotel: {
          id: hotel.id,
          name: hotel.name,
          location: hotel.location,
          heroImage: hotel.heroImage,
          currency: hotel.currency,
        },
        roomType: {
          id: selectedRoom.id,
          name: selectedRoom.name,
          description: selectedRoom.description,
          maxAdults: selectedRoom.maxAdults,
          maxChildren: selectedRoom.maxChildren,
          maxOccupancy: selectedRoom.maxOccupancy,
        },
        ratePlan: selectedRatePlan,
        dates: {
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          nights,
        },
        guests: {
          adults,
          children,
          rooms,
        },
        addOns: {
          available: hotel.addOns,
          selected: addOnBreakdown.map((a) => ({
            id: a.id,
            name: a.name,
            price: a.price,
            currency: a.currency,
            quantity: a.quantity,
            total: a.total,
          })),
        },
        pricing: {
          nightlyRate: selectedRatePlan.baseRate,
          subtotal: selectedRatePlan.baseRate * nights * rooms,
          taxes: (selectedRatePlan.taxes ?? 0) * nights * rooms,
          fees: (selectedRatePlan.fees ?? 0) * rooms,
          addOns: addOnBreakdown.reduce((sum, a) => sum + a.total, 0),
          total:
            selectedRatePlan.baseRate * nights * rooms +
            (selectedRatePlan.taxes ?? 0) * nights * rooms +
            (selectedRatePlan.fees ?? 0) * rooms +
            addOnBreakdown.reduce((sum, a) => sum + a.total, 0),
        },
      };
      sessionStorage.setItem('selection:payload', JSON.stringify(selectionPayload));
      const params = new URLSearchParams({
        hotelId: hotel.id,
        roomTypeId: selectedRoom?.id ?? '',
        ratePlanId: selectedRatePlan?.id ?? '',
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        adults: String(adults),
        children: String(children),
        rooms: String(rooms),
      });
      if (addOnBreakdown.length > 0) {
        params.set(
          'addOns',
          encodeURIComponent(
            JSON.stringify(addOnBreakdown.map((addOn) => ({ id: addOn.id, quantity: addOn.quantity }))),
          ),
        );
      }
      sessionStorage.setItem('selection:last', params.toString());
    } catch {
      // ignore storage errors
    }
  };

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

    if (addOnBreakdown.length > 0) {
      params.set(
        'addOns',
        encodeURIComponent(
          JSON.stringify(addOnBreakdown.map((addOn) => ({ id: addOn.id, quantity: addOn.quantity }))),
        ),
      );
    }

    persistSelection();
    router.push(`/booking?${params.toString()}`);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 pb-32 space-y-10">
      {/* Hero */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-3">
          <div className="relative h-64 md:h-96 lg:h-[520px] rounded-3xl overflow-hidden glass-card p-0 bg-white/5">
            {hasImages && images[currentImageIndex]?.url ? (
              <Image
                src={images[currentImageIndex].url}
                alt={hotel.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/30">
                <div className="text-center">
                  <svg className="w-24 h-24 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-sm">No images available from HotelBeds</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {hasImages && (
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            {images.slice(0, 4).map((img, index) => (
              <button
                key={img.id}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-32 md:h-40 lg:h-[180px] rounded-2xl overflow-hidden glass-card p-0 border ${
                  currentImageIndex === index ? 'border-white/60' : 'border-transparent'
                }`}
              >
                {img.url && (
                  <Image 
                    src={img.url} 
                    alt={img.caption ?? hotel.name} 
                    fill 
                    className="object-cover" 
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <GlassCard size="medium">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <p className="text-white/70 text-sm uppercase tracking-[0.3em] mb-2">
                  {hotel.categories?.join(' • ') ?? 'Curated Stay'}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{hotel.name}</h1>
                <p className="text-white/80">{hotel.location}</p>
              </div>
              <div className="flex items-center gap-2 text-white text-2xl font-bold">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFD700">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                {hotel.rating.toFixed(2)}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-4">About</h2>
            <p className="text-white/80 leading-relaxed">{hotel.description}</p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {hotel.amenities.map((amenity, idx) => {
                const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
                const amenityKey = typeof amenity === 'string' ? `${amenity}-${idx}` : amenity.id;
                return (
                  <div key={amenityKey} className="text-white/80 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-white/40 rounded-full" />
                    {amenityName}
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <div className="space-y-5">
            <h2 className="text-3xl font-bold text-white">Suites & Packages</h2>
            {hotel.roomTypes.map((room) => (
              <GlassCard key={room.id} className="space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase text-white/60 tracking-[0.4em] mb-1">
                      {room.isSuite ? 'Signature Suite' : 'Room Category'}
                    </p>
                    <h3 className="text-2xl font-semibold text-white">{room.name}</h3>
                    <p className="text-white/70 text-sm">{room.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-white/60 text-sm">
                      Sleeps {room.maxAdults} adults · {room.maxChildren} children
                    </div>
                    <Button
                      variant={selectedRoomId === room.id ? 'primary' : 'secondary'}
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        setSelectedRatePlanId(room.ratePlans[0]?.id ?? null);
                      }}
                    >
                      {selectedRoomId === room.id ? 'Selected' : 'Focus'}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {room.ratePlans.map((plan) => {
                    const isActive = selectedRatePlanId === plan.id;
                    return (
                      <div
                        key={plan.id}
                        className={`border rounded-2xl p-4 transition-all ${
                          isActive ? 'border-white/60 bg-white/5' : 'border-white/10 bg-white/0'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                          <div>
                            <p className="text-xs uppercase text-white/50 tracking-[0.4em] mb-1">
                              {plan.boardType.replace(/_/g, ' ')}
                            </p>
                            <h4 className="text-xl text-white font-semibold">{plan.name}</h4>
                            <p className="text-white/70 text-sm">
                              {plan.cancellationPolicy?.name ?? 'Flexible cancellation'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-white text-2xl font-bold">
                              {formatCurrency(plan.currency, plan.baseRate)}
                            </div>
                            <p className="text-white/60 text-xs">per night · taxes excl.</p>
                          </div>
                        </div>

                        {/* Urgency Indicator */}
                        {plan.availableRooms !== undefined && plan.availableRooms <= 5 && (
                          <div className="flex items-center gap-2 mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-red-400 text-sm font-semibold">
                              {plan.availableRooms === 1 
                                ? 'Only 1 room left!' 
                                : `Only ${plan.availableRooms} rooms left!`}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-4">
                          {plan.addOns.map((addOn) => (
                            <span
                              key={addOn.id}
                              className={`text-[11px] uppercase tracking-wide px-3 py-1 rounded-full ${
                                addOn.included
                                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                                  : 'bg-white/5 text-white/70 border border-white/10'
                              }`}
                            >
                              {addOn.included ? 'Includes' : 'Optional'} · {addOn.name}
                            </span>
                          ))}
                        </div>

                        <Button
                          variant={isActive ? 'primary' : 'secondary'}
                          onClick={() => handleSelectRatePlan(room.id, plan.id)}
                          fullWidth
                        >
                          {isActive ? 'Selected package' : 'Choose this package'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Booking Summary */}
        <div className="xl:col-span-1">
          <GlassCard className="sticky top-24 space-y-5">
            <h3 className="text-2xl font-bold text-white">Plan your stay</h3>

            <div>
              <p className="text-white/60 text-xs uppercase mb-2">Dates</p>
              <div className="flex flex-col gap-3">
                <DatePicker
                  selected={checkIn}
                  onChange={(date) => date && setCheckIn(date)}
                  selectsStart
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={new Date()}
                  placeholderText="Check-in"
                  className="glass-input w-full"
                />
                <DatePicker
                  selected={checkOut}
                  onChange={(date) => date && setCheckOut(date)}
                  selectsEnd
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={addDays(checkIn, 1)}
                  placeholderText="Check-out"
                  className="glass-input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Counter label="Rooms" value={rooms} onChange={setRooms} min={1} max={selectedRatePlan?.availableRooms ?? 5} />
              <Counter label="Adults" value={adults} onChange={setAdults} min={1} max={selectedRoom?.maxAdults ?? 4} />
              <Counter label="Children" value={children} onChange={setChildren} min={0} max={selectedRoom?.maxChildren ?? 2} />
            </div>

            {hotel.addOns.length > 0 && (
              <div>
                <p className="text-white/60 text-xs uppercase mb-2">Optional Extras</p>
                <div className="flex flex-col gap-2">
                  {hotel.addOns.map((addOn) => {
                    const active = Boolean(addOnSelections[addOn.id]);
                    return (
                      <button
                        key={addOn.id}
                        onClick={() => toggleAddOn(addOn.id)}
                        className={`flex items-center justify-between rounded-2xl px-3 py-2 text-left transition ${
                          active ? 'bg-white/20 border border-white/50' : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <div>
                          <p className="text-white text-sm font-semibold">{addOn.name}</p>
                          <p className="text-white/60 text-xs">{addOn.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-bold">
                            {addOn.isComplimentary
                              ? 'Included'
                              : formatCurrency(addOn.currency, addOn.price)}
                          </p>
                          <p className="text-white/50 text-[10px]">
                            {addOn.isPerNight ? 'per night' : 'per stay'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border border-white/5 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-white/70 text-sm">
                <span>
                  {nights} night{nights > 1 ? 's' : ''} × {rooms} room{rooms > 1 ? 's' : ''}
                </span>
                <span>{formatCurrency(selectedRatePlan?.currency ?? 'GBP', totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-white/70 text-sm">
                <span>Taxes & fees</span>
                <span>{formatCurrency(selectedRatePlan?.currency ?? 'GBP', totals.taxes + totals.fees)}</span>
              </div>
              {totals.addOns > 0 && (
                <div className="flex justify-between text-white/70 text-sm">
                  <span>Add-ons</span>
                  <span>{formatCurrency(selectedRatePlan?.currency ?? 'GBP', totals.addOns)}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between text-white text-xl font-bold">
                <span>Total</span>
                <span>{formatCurrency(selectedRatePlan?.currency ?? 'GBP', totals.total)}</span>
              </div>
              <p className="text-white/50 text-xs text-right">Charged in {selectedRatePlan?.currency ?? 'GBP'}</p>
            </div>

            <Button size='lg' onClick={handleBook} fullWidth disabled={!selectedRatePlan}>
              {selectedRatePlan ? 'Proceed to booking' : 'Select a package'}
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

const Counter = ({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
}) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
    <p className="text-white/60 text-xs uppercase mb-2">{label}</p>
    <div className="flex items-center justify-between">
      <button
        onClick={() => value > min && onChange(value - 1)}
        className="w-8 h-8 rounded-full bg-white/10 text-white text-lg"
      >
        −
      </button>
      <span className="text-white text-lg font-semibold">{value}</span>
      <button
        onClick={() => value < max && onChange(value + 1)}
        className="w-8 h-8 rounded-full bg-white/10 text-white text-lg"
      >
        +
      </button>
    </div>
  </div>
);

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

