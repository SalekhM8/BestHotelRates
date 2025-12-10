'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function RestoreSelection() {
  const router = useRouter();
  const [triedRestore, setTriedRestore] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    try {
      const payload = sessionStorage.getItem('selection:payload');
      if (payload) {
        const parsed = JSON.parse(payload);
        // If full payload exists, hydrate via client-side and push without redirect loop
        const qs = new URLSearchParams();
        qs.set('hotelId', parsed.hotel.id);
        qs.set('roomTypeId', parsed.roomType.id);
        qs.set('ratePlanId', parsed.ratePlan.id);
        qs.set('checkIn', parsed.dates.checkIn);
        qs.set('checkOut', parsed.dates.checkOut);
        qs.set('adults', String(parsed.guests.adults));
        qs.set('children', String(parsed.guests.children));
        qs.set('rooms', String(parsed.guests.rooms));
        if (parsed.addOns?.selected?.length) {
          qs.set('addOns', encodeURIComponent(JSON.stringify(parsed.addOns.selected)));
        }
        setHasSaved(true);
        router.replace(`/booking?${qs.toString()}`);
        return;
      }
      const saved = sessionStorage.getItem('selection:last');
      if (saved) {
        setHasSaved(true);
        router.replace(`/booking?${saved}`);
        return;
      }
    } catch {
      // ignore
    }
    setTriedRestore(true);
  }, [router]);

  return (
    <main className="relative min-h-screen pb-24 pt-24 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Missing booking details</h1>
        <p className="text-white/70">
          {hasSaved
            ? 'Restoring your selection...'
            : 'Please select a package first.'}
        </p>
        <Link href="/search">
          <Button>Back to search</Button>
        </Link>
      </div>
    </main>
  );
}


