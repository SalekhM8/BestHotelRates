import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';

export const metadata = {
  title: 'Booking Policy - Best Hotel Rates',
  description: 'Important information about booking hotels through Best Hotel Rates.',
};

export default function BookingPolicyPage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">Booking Policy</h1>
        <p className="text-white/70 text-lg mb-8">
          Important information to know before making a hotel reservation.
        </p>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Booking Process</h2>
            <ol className="text-white/80 leading-relaxed space-y-3">
              <li><strong>1. Search:</strong> Enter your destination, dates, and number of guests.</li>
              <li><strong>2. Select:</strong> Choose a hotel and room type that suits your needs.</li>
              <li><strong>3. Review:</strong> Check the rate details, including cancellation policy and what's included.</li>
              <li><strong>4. Book:</strong> Enter guest information and complete payment.</li>
              <li><strong>5. Confirm:</strong> Receive instant email confirmation with your booking details.</li>
            </ol>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Pricing</h2>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>• All prices are shown in <strong>GBP (British Pounds)</strong>.</li>
              <li>• Prices include all taxes and fees unless otherwise stated.</li>
              <li>• Prices are subject to availability and may change until booking is confirmed.</li>
              <li>• Some hotels may charge additional fees directly (e.g., resort fees, city taxes).</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Payment</h2>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>• We accept major credit and debit cards (Visa, Mastercard, American Express).</li>
              <li>• Payment is processed securely through <strong>Stripe</strong>.</li>
              <li>• Most bookings are charged immediately upon confirmation.</li>
              <li>• Some rates offer "Pay at Hotel" - payment is taken directly by the property.</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Guest Requirements</h2>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>• The main guest must be at least 18 years old.</li>
              <li>• Valid photo identification (passport or ID card) is required at check-in.</li>
              <li>• The name on the booking must match the ID presented at the hotel.</li>
              <li>• Some hotels may require a credit card for incidentals at check-in.</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Check-in & Check-out</h2>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>• Standard check-in: <strong>3:00 PM onwards</strong></li>
              <li>• Standard check-out: <strong>By 11:00 AM</strong></li>
              <li>• Times vary by hotel - check your confirmation for specific times.</li>
              <li>• Early check-in or late check-out may be available at an additional charge.</li>
              <li>• Contact the hotel directly for special requests.</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Special Requests</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              You can add special requests during booking (e.g., high floor, quiet room, extra pillows). 
              Please note:
            </p>
            <ul className="text-white/80 leading-relaxed space-y-2">
              <li>• Special requests are not guaranteed and subject to availability.</li>
              <li>• The hotel will do their best to accommodate your preferences.</li>
              <li>• Some requests may incur additional charges payable at the hotel.</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Related Policies</h2>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>
                <Link href="/cancellation" className="text-blue-400 hover:underline">
                  → Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-blue-400 hover:underline">
                  → Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-blue-400 hover:underline">
                  → Privacy Policy
                </Link>
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
