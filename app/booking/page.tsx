import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBookingSelectionPayload } from '@/lib/hotels-data';
import { BookingFlowClient } from '@/components/booking/BookingFlow';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import RestoreSelection from './restore-selection';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BookingPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const selection = await getBookingSelectionPayload(params);

  if (!selection) {
    return (
      <RestoreSelection />
    );
  }

  return (
    <main className="relative min-h-screen pb-24 pt-24">
      <BookingFlowClient initialSelection={selection} user={session?.user} />
    </main>
  );
}



