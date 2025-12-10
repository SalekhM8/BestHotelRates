import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';

export const metadata = {
  title: 'About Us - Best Hotel Rates',
  description: 'Learn about Best Hotel Rates - your trusted partner for finding the best hotel deals worldwide.',
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen pb-32 md:pb-24 pt-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 drop-shadow-2xl">
          About Best Hotel Rates
        </h1>

        <div className="space-y-6">
          {/* Mission */}
          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-white/90 leading-relaxed mb-4">
              At Best Hotel Rates, we're dedicated to helping travelers find the perfect accommodation at unbeatable prices. 
              We search through thousands of hotels worldwide to bring you exclusive deals that you won't find anywhere else.
            </p>
            <p className="text-white/90 leading-relaxed">
              Our platform combines cutting-edge technology with personalized service to ensure every booking is seamless, 
              secure, and offers exceptional value.
            </p>
          </GlassCard>

          {/* Why Choose Us */}
          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-6">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Best Price Guarantee
                </h3>
                <p className="text-white/80">
                  We guarantee the lowest prices on hotel bookings. Find a better rate? We'll match it.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure Booking
                </h3>
                <p className="text-white/80">
                  Your data is protected with industry-leading encryption and security measures.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Instant Confirmation
                </h3>
                <p className="text-white/80">
                  Get immediate booking confirmation and all details sent to your email.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  24/7 Support
                </h3>
                <p className="text-white/80">
                  Our customer service team is available around the clock to assist you.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Our Story */}
          <GlassCard>
            <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
            <p className="text-white/90 leading-relaxed mb-4">
              Founded by travel enthusiasts who were frustrated with opaque pricing and hidden fees, 
              Best Hotel Rates was born from a simple idea: travelers deserve transparent, competitive pricing 
              and exceptional service.
            </p>
            <p className="text-white/90 leading-relaxed">
              Today, we partner with thousands of hotels worldwide and leverage advanced technology to bring you 
              the best deals on accommodations anywhere in the world.
            </p>
          </GlassCard>

          {/* CTA */}
          <GlassCard>
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Perfect Stay?</h2>
              <p className="text-white/80 mb-6">
                Start searching for amazing hotel deals today
              </p>
              <Link
                href="/"
                className="glass-card-small inline-block px-8 py-3 text-white font-bold text-lg hover:bg-white/20 transition-all"
              >
                Search Hotels
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}

