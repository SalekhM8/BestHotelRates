'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const faqs = [
  {
    category: 'Booking',
    questions: [
      {
        q: 'How do I make a booking?',
        a: 'Simply search for your destination, select your dates and number of guests, choose a hotel and room, enter your details, and complete the payment. You\'ll receive a confirmation email immediately.',
      },
      {
        q: 'Can I book for someone else?',
        a: 'Yes, you can book on behalf of someone else. Just enter their name as the guest name during checkout. Make sure to provide an email address where they can receive the confirmation.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards including Visa, Mastercard, and American Express. Payments are processed securely through Stripe.',
      },
      {
        q: 'Do I need to pay in full at the time of booking?',
        a: 'This depends on the rate you choose. Some rates require full payment upfront, while others allow you to pay at the property. Check the rate details before booking.',
      },
    ],
  },
  {
    category: 'Cancellations & Refunds',
    questions: [
      {
        q: 'Can I cancel my booking?',
        a: 'This depends on the cancellation policy of your booking. Many of our rates offer free cancellation up to a certain date. Check your booking confirmation for specific terms.',
      },
      {
        q: 'How do I cancel a booking?',
        a: 'Go to "My Bookings" in your account, find the booking you want to cancel, and click "Cancel booking". Follow the prompts to complete the cancellation.',
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are typically processed within 5-10 business days, depending on your bank. You\'ll receive an email confirmation once the refund has been initiated.',
      },
    ],
  },
  {
    category: 'Account',
    questions: [
      {
        q: 'Do I need an account to book?',
        a: 'No, you can book as a guest. However, creating an account allows you to manage your bookings, save favourites, and access exclusive member deals.',
      },
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot password" on the login page, enter your email address, and we\'ll send you a link to reset your password.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-[#5DADE2] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Frequently Asked Questions</h1>
          <p className="text-white/90">Find answers to common questions about booking with us</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {faqs.map((section) => (
          <div key={section.category} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{section.category}</h2>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {section.questions.map((faq, index) => {
                const key = `${section.category}-${index}`;
                const isOpen = openIndex === key;
                return (
                  <div key={key} className="border-b border-gray-100 last:border-b-0">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : key)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{faq.q}</span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-600">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Still need help? */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-4">Our support team is here to help</p>
          <Link
            href="/contact"
            className="inline-block px-6 py-2.5 bg-[#5DADE2] text-white font-semibold rounded-lg hover:bg-[#3498DB] transition-colors"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
