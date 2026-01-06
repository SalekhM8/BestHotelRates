import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { VideoBackground } from '@/components/layout/VideoBackground';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { CookieConsent } from '@/components/ui/CookieConsent';
import { GoogleAnalytics, SentryInit } from '@/components/analytics/Analytics';

export const metadata: Metadata = {
  title: 'Best Hotel Rates - Find Your Perfect Stay',
  description: 'Discover unbeatable hotel deals worldwide. Search, compare, and book the best hotel rates with confidence.',
  keywords: 'hotel booking, cheap hotels, hotel deals, accommodation, travel',
  openGraph: {
    title: 'Best Hotel Rates - Find Your Perfect Stay',
    description: 'Discover unbeatable hotel deals worldwide.',
    type: 'website',
    locale: 'en_GB',
    siteName: 'Best Hotel Rates',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Hotel Rates',
    description: 'Find unbeatable hotel deals worldwide.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body>
        <GoogleAnalytics />
        <SentryInit />
        <SessionProvider>
          <VideoBackground />
          <Header />
          {children}
          <Footer />
          <BottomNav />
          <CookieConsent />
        </SessionProvider>
      </body>
    </html>
  );
}
