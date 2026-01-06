'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to an API endpoint
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="relative min-h-screen pt-28 pb-24 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <GlassCard className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
            <p className="text-white/70">
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
          </GlassCard>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen pt-28 pb-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-white/70 text-lg mb-8">
          Have a question or need help with your booking? We're here to assist you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Smith"
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
              <Input
                label="Subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Booking enquiry"
                required
              />
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              <Button type="submit" fullWidth>
                Send Message
              </Button>
            </form>
          </GlassCard>

          {/* Contact Information */}
          <div className="space-y-6">
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <a href="mailto:support@besthotelrates.co.uk" className="text-white/70 hover:text-white transition-colors">
                      support@besthotelrates.co.uk
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Response Time</p>
                    <p className="text-white/70">Within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Location</p>
                    <p className="text-white/70">United Kingdom</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
              <ul className="space-y-3">
                <li>
                  <a href="/faq" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                    <span>→</span> Frequently Asked Questions
                  </a>
                </li>
                <li>
                  <a href="/cancellation" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                    <span>→</span> Cancellation Policy
                  </a>
                </li>
                <li>
                  <a href="/help" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                    <span>→</span> Help Centre
                  </a>
                </li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}
