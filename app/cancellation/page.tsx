import { GlassCard } from '@/components/ui/GlassCard';

export const metadata = {
  title: 'Cancellation Policy - Best Hotel Rates',
  description: 'Understand our cancellation and refund policies for hotel bookings.',
};

export default function CancellationPage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">Cancellation Policy</h1>
        <p className="text-white/70 text-lg mb-8">
          Understanding your options for cancelling or modifying hotel bookings.
        </p>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Rate Types & Cancellation</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              Each hotel booking comes with a specific rate type that determines your cancellation options:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <h3 className="text-lg font-medium text-green-400 mb-2">✓ Free Cancellation</h3>
                <p className="text-white/80">
                  Cancel at no charge up to the deadline shown (typically 24-48 hours before check-in). 
                  After the deadline, charges may apply.
                </p>
              </div>
              
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <h3 className="text-lg font-medium text-yellow-400 mb-2">⚠ Partially Refundable</h3>
                <p className="text-white/80">
                  Partial refunds available depending on when you cancel. The specific terms will be shown 
                  during booking and in your confirmation email.
                </p>
              </div>
              
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <h3 className="text-lg font-medium text-red-400 mb-2">✗ Non-Refundable</h3>
                <p className="text-white/80">
                  These rates offer the lowest prices but cannot be cancelled or refunded. 
                  Payment is charged immediately and is non-recoverable.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">How to Cancel a Booking</h2>
            <ol className="text-white/80 leading-relaxed space-y-3">
              <li>
                <strong>1. Log in to your account</strong> at besthotelrates.co.uk
              </li>
              <li>
                <strong>2. Go to "My Bookings"</strong> from the menu
              </li>
              <li>
                <strong>3. Find your booking</strong> and click "View Details"
              </li>
              <li>
                <strong>4. Click "Cancel Booking"</strong> if eligible for cancellation
              </li>
              <li>
                <strong>5. Confirm cancellation</strong> - you will receive an email confirmation
              </li>
            </ol>
            <p className="text-white/70 mt-4 text-sm">
              If you booked as a guest, contact us at support@besthotelrates.co.uk with your booking reference.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Refund Process</h2>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>• Refunds are processed automatically when you cancel an eligible booking.</li>
              <li>• The refund will be credited to your original payment method.</li>
              <li>• Refunds typically appear within <strong>5-10 business days</strong>, depending on your bank.</li>
              <li>• The refund amount will match what you paid, minus any applicable fees as per the rate terms.</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Modifications</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              To change your booking dates, guest details, or room type:
            </p>
            <ul className="text-white/80 leading-relaxed space-y-2">
              <li>• <strong>Free Cancellation rates:</strong> Cancel and rebook with new details</li>
              <li>• <strong>Non-Refundable rates:</strong> Cannot be modified</li>
              <li>• <strong>Contact the hotel directly:</strong> For minor changes like adding a cot or late check-out</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">No-Shows</h2>
            <p className="text-white/80 leading-relaxed">
              If you do not arrive at the hotel without cancelling your booking:
            </p>
            <ul className="text-white/80 leading-relaxed space-y-2 mt-4">
              <li>• Your booking will be marked as a "no-show"</li>
              <li>• No refund will be provided</li>
              <li>• The hotel may charge the full booking amount</li>
            </ul>
            <p className="text-white/70 mt-4 text-sm">
              If you're running late, contact the hotel directly to hold your reservation.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Special Circumstances</h2>
            <p className="text-white/80 leading-relaxed">
              In exceptional circumstances (natural disasters, illness requiring hospitalisation, travel bans), 
              please contact us with supporting documentation. We will work with the hotel to find a fair solution, 
              though this is at the hotel's discretion.
            </p>
          </GlassCard>

          <GlassCard className="text-center">
            <h2 className="text-xl font-semibold text-white mb-3">Need Help?</h2>
            <p className="text-white/70 mb-4">
              Contact our support team for assistance with cancellations or refunds.
            </p>
            <a
              href="mailto:support@besthotelrates.co.uk"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Contact Support
            </a>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
