import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBookingSelectionPayload } from '@/lib/hotels-data';
import { BookingFlowClient } from '@/components/booking/BookingFlow';
import Link from 'next/link';
import RestoreSelection from './restore-selection';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BookingPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const selection = await getBookingSelectionPayload(params);

  if (!selection) {
    return <RestoreSelection />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-[#5DADE2] py-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white">
              Best Hotel Rates
            </Link>
            <div className="flex items-center gap-6 text-white text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#003580] flex items-center justify-center text-xs font-bold">1</div>
                <span>Your selection</span>
              </div>
              <div className="w-8 h-px bg-white/30" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white text-[#5DADE2] flex items-center justify-center text-xs font-bold">2</div>
                <span className="font-semibold">Your details</span>
              </div>
              <div className="w-8 h-px bg-white/30" />
              <div className="flex items-center gap-2 opacity-60">
                <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center text-xs">3</div>
                <span>Final step</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingFlowClient initialSelection={selection} user={session?.user} />
    </div>
  );
}
