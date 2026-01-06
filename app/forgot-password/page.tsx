'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email');
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4">
        <GlassCard className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
          <p className="text-white/70 mb-6">
            If an account exists for {email}, you will receive a password reset link shortly.
          </p>
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Back to Login
          </Link>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
        <p className="text-white/70 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <Button type="submit" fullWidth loading={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <div className="text-center pt-4">
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
              Back to Login
            </Link>
          </div>
        </form>
      </GlassCard>
    </main>
  );
}

