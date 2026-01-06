import { GlassCard } from '@/components/ui/GlassCard';

export const metadata = {
  title: 'Terms & Conditions - Best Hotel Rates',
  description: 'Terms and conditions for using Best Hotel Rates booking services.',
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">Terms & Conditions</h1>
        <p className="text-white/70 mb-8">Last updated: January 2025</p>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-white/80 leading-relaxed">
              By accessing and using Best Hotel Rates ("the Service"), you accept and agree to be bound by these Terms and Conditions. 
              If you do not agree to these terms, please do not use our service. We reserve the right to modify these terms at any time, 
              and your continued use of the Service constitutes acceptance of any changes.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">2. Service Description</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              Best Hotel Rates is an online travel agency (OTA) that provides hotel booking services. We act as an intermediary 
              between you and hotel suppliers, facilitating reservations on your behalf. We do not own, operate, or manage any hotels.
            </p>
            <p className="text-white/80 leading-relaxed">
              Hotel availability, pricing, and policies are determined by the hotels and our supplier partners. Prices are subject 
              to change until a booking is confirmed and paid for.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">3. Booking and Payment</h2>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>• All bookings are subject to availability and acceptance by the hotel.</li>
              <li>• Prices shown include all applicable taxes and fees unless otherwise stated.</li>
              <li>• Payment is processed securely through Stripe. We do not store your card details.</li>
              <li>• You will receive a confirmation email with your booking reference upon successful payment.</li>
              <li>• The person making the booking is responsible for ensuring all information provided is accurate.</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">4. Cancellation and Refunds</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              Cancellation policies vary depending on the rate type selected:
            </p>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>• <strong>Free Cancellation:</strong> Can be cancelled without charge up to the deadline shown (typically 24-48 hours before check-in).</li>
              <li>• <strong>Non-Refundable:</strong> Cannot be cancelled or refunded. These rates offer lower prices in exchange for less flexibility.</li>
              <li>• Refunds for eligible cancellations will be processed within 5-10 business days to your original payment method.</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">5. User Responsibilities</h2>
            <ul className="text-white/80 leading-relaxed space-y-3">
              <li>• Provide accurate personal and payment information during booking.</li>
              <li>• Present valid identification matching the guest name at hotel check-in.</li>
              <li>• Comply with hotel policies regarding check-in/check-out times, conduct, and property rules.</li>
              <li>• Not use the Service for any fraudulent or unlawful purpose.</li>
            </ul>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">6. Limitation of Liability</h2>
            <p className="text-white/80 leading-relaxed">
              Best Hotel Rates acts as an intermediary and is not liable for any issues arising from your stay at a hotel, 
              including but not limited to: service quality, room conditions, hotel staff conduct, or any personal injury or 
              property damage. Any disputes should be raised directly with the hotel. Our maximum liability is limited to the 
              amount paid for your booking.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">7. Intellectual Property</h2>
            <p className="text-white/80 leading-relaxed">
              All content on this website, including text, graphics, logos, and software, is the property of Best Hotel Rates 
              or its licensors and is protected by copyright and intellectual property laws. You may not reproduce, distribute, 
              or create derivative works without prior written consent.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">8. Governing Law</h2>
            <p className="text-white/80 leading-relaxed">
              These Terms and Conditions are governed by the laws of England and Wales. Any disputes shall be subject to the 
              exclusive jurisdiction of the courts of England and Wales.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">9. Contact Information</h2>
            <p className="text-white/80 leading-relaxed">
              For any questions regarding these terms, please contact us at:{' '}
              <a href="mailto:legal@besthotelrates.co.uk" className="text-blue-400 hover:underline">
                legal@besthotelrates.co.uk
              </a>
            </p>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
