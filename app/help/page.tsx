import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';

export const metadata = {
  title: 'Help Centre - Best Hotel Rates',
  description: 'Get help with your hotel bookings and find answers to common questions.',
};

const helpCategories = [
  {
    title: 'Booking & Reservations',
    icon: '🏨',
    links: [
      { label: 'How to book a hotel', href: '/faq#how-to-book' },
      { label: 'Modify or cancel booking', href: '/faq#cancel-booking' },
      { label: 'Payment methods', href: '/faq#payment' },
      { label: 'Booking confirmation', href: '/faq#confirmation' },
    ],
  },
  {
    title: 'Account & Profile',
    icon: '👤',
    links: [
      { label: 'Create an account', href: '/register' },
      { label: 'Reset password', href: '/forgot-password' },
      { label: 'Update profile', href: '/profile' },
      { label: 'View booking history', href: '/bookings' },
    ],
  },
  {
    title: 'Payments & Refunds',
    icon: '💳',
    links: [
      { label: 'Payment security', href: '/faq#payment-security' },
      { label: 'Refund policy', href: '/cancellation' },
      { label: 'Currency information', href: '/faq#currency' },
      { label: 'Payment issues', href: '/contact' },
    ],
  },
  {
    title: 'Policies',
    icon: '📋',
    links: [
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Cancellation Policy', href: '/cancellation' },
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">Help Centre</h1>
        <p className="text-white/70 text-lg mb-8">
          Find answers, guides, and support for all your booking needs.
        </p>

        {/* Search suggestion */}
        <GlassCard className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Looking for something specific?</h2>
              <p className="text-white/70 text-sm">
                Check our <Link href="/faq" className="text-blue-400 hover:underline">FAQ page</Link> for quick answers, 
                or <Link href="/contact" className="text-blue-400 hover:underline">contact us</Link> for personalised support.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {helpCategories.map((category) => (
            <GlassCard key={category.title}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{category.icon}</span>
                <h2 className="text-xl font-semibold text-white">{category.title}</h2>
              </div>
              <ul className="space-y-2">
                {category.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <span className="text-blue-400">→</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>

        {/* Contact CTA */}
        <GlassCard className="text-center">
          <h2 className="text-xl font-semibold text-white mb-3">Still need help?</h2>
          <p className="text-white/70 mb-6">
            Our support team is available to assist you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Contact Support
            </Link>
            <a
              href="mailto:support@besthotelrates.co.uk"
              className="inline-block bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Email Us
            </a>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
