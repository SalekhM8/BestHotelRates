import { GlassCard } from '@/components/ui/GlassCard';

export const metadata = {
  title: 'FAQ - Best Hotel Rates',
  description: 'Frequently asked questions about booking hotels with Best Hotel Rates.',
};

const faqs = [
  {
    question: 'How do I book a hotel?',
    answer: 'Simply search for your destination, select your dates and number of guests, browse available hotels, and click "Book Now" on your preferred option. Follow the checkout process to complete your reservation.',
  },
  {
    question: 'Is my payment secure?',
    answer: 'Yes, absolutely. We use Stripe for all payment processing, which is PCI-DSS compliant and uses industry-standard encryption. Your card details are never stored on our servers.',
  },
  {
    question: 'Can I cancel or modify my booking?',
    answer: 'Cancellation policies vary by hotel and rate plan. "Free Cancellation" rates can be cancelled without charge up to 24-48 hours before check-in. Non-refundable rates offer lower prices but cannot be cancelled. Check your booking confirmation for specific terms.',
  },
  {
    question: 'When will I be charged?',
    answer: 'Most bookings are charged immediately upon confirmation. Some hotels offer "Pay at Hotel" options where you pay directly at the property. The payment method will be clearly shown during booking.',
  },
  {
    question: 'How do I get my booking confirmation?',
    answer: 'After successful payment, you will receive an email confirmation with your booking reference, hotel details, and a downloadable PDF voucher. You can also view all your bookings in "My Bookings" after logging in.',
  },
  {
    question: 'What if my hotel booking is not confirmed?',
    answer: 'In the rare case that a booking cannot be confirmed (e.g., hotel oversold), you will receive a full refund automatically, and our team will contact you to help find alternative accommodation.',
  },
  {
    question: 'Do I need to print my voucher?',
    answer: 'Most hotels accept digital vouchers shown on your phone. However, we recommend having a copy (printed or digital) of your booking confirmation with your reference number.',
  },
  {
    question: 'How do refunds work?',
    answer: 'If you are eligible for a refund, it will be processed to your original payment method within 5-10 business days. The exact timeframe depends on your bank or card issuer.',
  },
  {
    question: 'Can I book for someone else?',
    answer: 'Yes, you can book on behalf of another person. Just enter their name as the guest name during booking. The guest will need to present identification matching the name on the booking at check-in.',
  },
  {
    question: 'What currency will I be charged in?',
    answer: 'Currently, all bookings are processed in GBP (British Pounds). If your card is in a different currency, your bank may apply a conversion fee.',
  },
  {
    question: 'How do I contact customer support?',
    answer: 'You can reach us at support@besthotelrates.co.uk. We aim to respond to all enquiries within 24 hours. For urgent matters regarding active bookings, please include your booking reference.',
  },
  {
    question: 'Are the prices shown final?',
    answer: 'Prices shown include all taxes and fees. There are no hidden charges. The price you see at checkout is the price you pay.',
  },
];

export default function FaqPage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
        <p className="text-white/70 text-lg mb-8">
          Find answers to common questions about booking hotels with Best Hotel Rates.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <GlassCard key={index} className="p-6">
              <h2 className="text-lg font-semibold text-white mb-3">{faq.question}</h2>
              <p className="text-white/80 leading-relaxed">{faq.answer}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="mt-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-3">Still have questions?</h2>
          <p className="text-white/70 mb-4">
            Can't find what you're looking for? Contact our support team.
          </p>
          <a
            href="mailto:support@besthotelrates.co.uk"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Contact Support
          </a>
        </GlassCard>
      </div>
    </main>
  );
}
