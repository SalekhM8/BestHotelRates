'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const footerLinks = {
  support: {
    title: 'Support',
    links: [
      { id: 'help', label: 'Help Centre', href: '/help' },
      { id: 'faq', label: 'FAQs', href: '/faq' },
      { id: 'contact', label: 'Contact Us', href: '/contact' },
      { id: 'booking-policy', label: 'Booking Policy', href: '/booking-policy' },
      { id: 'cancellation', label: 'Cancellation', href: '/cancellation' },
    ],
  },
  discover: {
    title: 'Discover',
    links: [
      { id: 'deals', label: 'Seasonal deals', href: '/categories' },
      { id: 'articles', label: 'Travel articles', href: '/blog' },
      { id: 'destinations', label: 'Best destinations', href: '/search?destination=London' },
    ],
  },
  terms: {
    title: 'Terms and settings',
    links: [
      { id: 'privacy', label: 'Privacy & cookies', href: '/privacy' },
      { id: 'terms', label: 'Terms & conditions', href: '/terms' },
      { id: 'cookies', label: 'Cookie settings', href: '/cookies' },
    ],
  },
  about: {
    title: 'About',
    links: [
      { id: 'about', label: 'About Best Hotel Rates', href: '/about' },
    ],
  },
};

export function Footer() {
  const pathname = usePathname();

  // Don't show footer on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#003580] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-bold text-sm mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.id}>
                    <Link 
                      href={link.href}
                      className="text-sm text-white/80 hover:text-white hover:underline transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold">
                Best Hotel Rates
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
              <span>&copy; {new Date().getFullYear()} Best Hotel Rates Ltd.</span>
              <span className="hidden md:inline">|</span>
              <Link href="/terms" className="hover:text-white hover:underline">Terms</Link>
              <span className="hidden md:inline">|</span>
              <Link href="/privacy" className="hover:text-white hover:underline">Privacy</Link>
              <span className="hidden md:inline">|</span>
              <Link href="/cookies" className="hover:text-white hover:underline">Cookies</Link>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50">We accept:</span>
              <div className="flex items-center gap-2">
                <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                  <span className="text-[#1A1F71] text-xs font-bold">VISA</span>
                </div>
                <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                  <span className="text-[#EB001B] text-xs font-bold">MC</span>
                </div>
                <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                  <span className="text-gray-800 text-xs font-bold">AMEX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
