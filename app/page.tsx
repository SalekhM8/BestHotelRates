import React, { Suspense } from 'react';
import Link from 'next/link';
import { AdvancedSearchBar } from '@/components/hotel/AdvancedSearchBar';
import { HotelCardDynamic } from '@/components/hotel/HotelCardDynamic';
import { RecentlyViewedSection } from '@/components/hotel/RecentlyViewedSection';
import { GlassCard } from '@/components/ui/GlassCard';
import { getFeaturedHotelsByCity } from '@/lib/hotels-data';
import { SupplierHotelSummary } from '@/lib/suppliers/types';
import Image from 'next/image';

// Force dynamic to prevent prerendering (requires database connection)
export const dynamic = 'force-dynamic';

const toCardProps = (hotel: SupplierHotelSummary) => {
  const tags = Array.isArray(hotel.tags)
    ? hotel.tags.filter((tag): tag is string => typeof tag === 'string')
    : undefined;

  return {
    id: hotel.id,
    slug: hotel.slug,
    name: hotel.name,
    location: hotel.location,
    rating: hotel.rating,
    startingRate: hotel.startingRate,
    currency: hotel.currency,
    image: hotel.primaryImage ?? hotel.heroImage,
    highlight: hotel.minRatePlan?.name,
    badge: hotel.categories[0]?.replace(/-/g, ' '),
    tags,
  };
};

// Loading skeleton
function HotelCardSkeleton() {
  return (
    <div className="glass-card p-0 animate-pulse">
      <div className="h-56 sm:h-64 md:h-72 bg-white/10 rounded-t-2xl md:rounded-t-3xl" />
      <div className="p-3 sm:p-4 space-y-3">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
        <div className="h-4 bg-white/10 rounded w-1/4" />
      </div>
    </div>
  );
}

export default async function HomePage() {
  // Try to fetch hotels, but handle API failures gracefully
  // REDUCED: Only fetch ONE city on homepage to conserve API quota
  let hotelsLondon: Awaited<ReturnType<typeof getFeaturedHotelsByCity>> = [];
  let apiError: string | null = null;

  try {
    // Only fetch London - reduces API calls from 3 to 1
    hotelsLondon = await getFeaturedHotelsByCity('London');
  } catch (err: any) {
    console.error('Failed to fetch hotels:', err.message);
    apiError = 'Hotel listings temporarily unavailable. Please try searching directly.';
  }
  
  // Empty arrays for other cities - not fetching to save API quota
  const hotelsDubai: typeof hotelsLondon = [];
  const hotelsParis: typeof hotelsLondon = [];

  return (
    <main className="relative min-h-screen pb-32 md:pb-24">
      {/* Advanced Search Bar with Calendars & Guest Picker */}
      <AdvancedSearchBar />

      {/* Quick Categories */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 mb-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative z-10">
          <Link href="/categories">
            <div className="glass-card p-4 md:p-6 text-center cursor-pointer hover:bg-white/20 transition-all">
              <svg className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-white font-bold text-xs md:text-sm">All Hotels</p>
            </div>
          </Link>
          <Link href="/categories">
            <div className="glass-card p-4 md:p-6 text-center cursor-pointer hover:bg-white/20 transition-all">
              <svg className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <p className="text-white font-bold text-xs md:text-sm">Luxury</p>
            </div>
          </Link>
          <Link href="/categories">
            <div className="glass-card p-4 md:p-6 text-center cursor-pointer hover:bg-white/20 transition-all">
              <svg className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <p className="text-white font-bold text-xs md:text-sm">Boutique</p>
            </div>
          </Link>
          <Link href="/categories">
            <div className="glass-card p-4 md:p-6 text-center cursor-pointer hover:bg-white/20 transition-all">
              <svg className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              <p className="text-white font-bold text-xs md:text-sm">Beach</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recently Viewed Hotels */}
      <RecentlyViewedSection />

      {/* API Error Alert */}
      {apiError && (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 mb-8">
          <div className="glass-card p-6 border-2 border-red-500/50 bg-red-500/10">
            <div className="flex items-start gap-4">
              <div className="text-red-400 text-3xl">⚠️</div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">HotelBeds API Error</h3>
                <p className="text-white/80 mb-3">{apiError}</p>
                <p className="text-white/60 text-sm">
                  The HotelBeds sandbox has quota limits. Options:
                </p>
                <ul className="text-white/60 text-sm list-disc list-inside mt-2">
                  <li>Wait for quota to reset (usually daily)</li>
                  <li>Get production API credentials</li>
                  <li>Set DEFAULT_SUPPLIER=LOCAL in .env to use seeded database</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Listings - Featured Only (Lazy Loaded) */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 relative z-0">
        {/* London Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-2xl">
              Popular in London
            </h2>
            <Link href="/search?destination=London" className="text-white/80 hover:text-white text-sm font-semibold">
              View all →
            </Link>
          </div>
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1,2,3,4].map(i => <HotelCardSkeleton key={i} />)}
            </div>
          }>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {hotelsLondon.map((hotel) => (
                <HotelCardDynamic key={hotel.id} {...toCardProps(hotel)} />
              ))}
            </div>
          </Suspense>
        </section>

        {/* Dubai Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-2xl">
              Dubai this Weekend
            </h2>
            <Link href="/search?destination=Dubai" className="text-white/80 hover:text-white text-sm font-semibold">
              View all →
            </Link>
          </div>
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1,2,3,4].map(i => <HotelCardSkeleton key={i} />)}
            </div>
          }>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {hotelsDubai.map((hotel) => (
                <HotelCardDynamic key={hotel.id} {...toCardProps(hotel)} />
              ))}
            </div>
          </Suspense>
        </section>

        {/* Paris Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-2xl">
              Romantic Paris
            </h2>
            <Link href="/search?destination=Paris" className="text-white/80 hover:text-white text-sm font-semibold">
              View all →
            </Link>
          </div>
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1,2,3,4].map(i => <HotelCardSkeleton key={i} />)}
            </div>
          }>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {hotelsParis.map((hotel) => (
                <HotelCardDynamic key={hotel.id} {...toCardProps(hotel)} />
              ))}
            </div>
          </Suspense>
        </section>

        {/* About Section */}
        <section className="mb-12">
          <GlassCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">Why Best Hotel Rates?</h2>
                <p className="text-white/90 leading-relaxed mb-4">
                  We search thousands of hotels worldwide to bring you exclusive deals and unbeatable prices. 
                  Our platform combines cutting-edge technology with personalized service.
                </p>
                <Link href="/about" className="glass-card-small inline-block px-6 py-3 text-white font-semibold hover:bg-white/20">
                  Learn More
                </Link>
              </div>
              <div className="relative h-64 rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop"
                  alt="About us"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Blog Teaser */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-2xl">
              Travel Tips & Guides
            </h2>
            <Link href="/blog" className="text-white/80 hover:text-white text-sm font-semibold">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Link href="/blog">
              <GlassCard className="p-0 hover:scale-[1.02] transition-all cursor-pointer">
                <div className="p-5">
                  <div className="text-white/60 text-xs mb-2">TRAVEL TIPS</div>
                  <h3 className="text-xl font-bold text-white mb-2">10 Tips for Finding Best Hotel Deals</h3>
                  <p className="text-white/70 text-sm">Master the art of booking hotels at unbeatable prices...</p>
                </div>
              </GlassCard>
            </Link>
            <Link href="/blog">
              <GlassCard className="p-0 hover:scale-[1.02] transition-all cursor-pointer">
                <div className="p-5">
                  <div className="text-white/60 text-xs mb-2">DESTINATION GUIDE</div>
                  <h3 className="text-xl font-bold text-white mb-2">Top Luxury Hotels in Dubai</h3>
                  <p className="text-white/70 text-sm">Explore the finest accommodations in the UAE...</p>
                </div>
              </GlassCard>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
