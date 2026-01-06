'use client';

import React from 'react';

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4">
      {/* Trustpilot Style Badge */}
      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-5 h-5 ${star <= 4 ? 'text-green-500' : 'text-green-500/50'}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <div className="text-white">
          <span className="font-semibold">4.8</span>
          <span className="text-white/60 text-sm ml-1">• Excellent</span>
        </div>
      </div>

      {/* Secure Payment Badge */}
      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="text-white text-sm">Secure Payments</span>
      </div>

      {/* Best Price Guarantee */}
      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-white text-sm">Best Price Guarantee</span>
      </div>

      {/* 24/7 Support */}
      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span className="text-white text-sm">24/7 Support</span>
      </div>
    </div>
  );
}

export function TrustSection() {
  return (
    <section className="py-16 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Trusted by Thousands of Travellers
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Review Card 1 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p className="text-white/80 text-sm mb-4">
              "Found an amazing deal on a 5-star hotel in Dubai. Saved over £200 compared to other sites. Will definitely use again!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                JD
              </div>
              <div>
                <p className="text-white font-medium text-sm">James D.</p>
                <p className="text-white/50 text-xs">Verified Booking</p>
              </div>
            </div>
          </div>

          {/* Review Card 2 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p className="text-white/80 text-sm mb-4">
              "Super easy booking process. The hotel was exactly as described and the price was unbeatable. Highly recommend!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                SM
              </div>
              <div>
                <p className="text-white font-medium text-sm">Sarah M.</p>
                <p className="text-white/50 text-xs">Verified Booking</p>
              </div>
            </div>
          </div>

          {/* Review Card 3 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex mb-4">
              {[1, 2, 3, 4, 5].map((star, i) => (
                <svg key={star} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400' : 'text-yellow-400/50'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p className="text-white/80 text-sm mb-4">
              "Great selection of luxury hotels. Found a fantastic boutique hotel in Barcelona that wasn't on other booking sites."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                RK
              </div>
              <div>
                <p className="text-white font-medium text-sm">Robert K.</p>
                <p className="text-white/50 text-xs">Verified Booking</p>
              </div>
            </div>
          </div>
        </div>

        <TrustBadges />
      </div>
    </section>
  );
}

