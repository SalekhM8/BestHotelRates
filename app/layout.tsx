import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { VideoBackground } from '@/components/layout/VideoBackground';
import { SessionProvider } from '@/components/auth/SessionProvider';

export const metadata: Metadata = {
  title: 'Best Hotel Rates - Find Your Perfect Stay',
  description: 'Discover unbeatable hotel deals worldwide. Search, compare, and book the best hotel rates with confidence.',
  keywords: 'hotel booking, cheap hotels, hotel deals, accommodation, travel',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {/* Video Background - Now Active! */}
          <VideoBackground />
          <Header />
          {children}
          <Footer />
          <BottomNav />
        </SessionProvider>
      </body>
    </html>
  );
}
