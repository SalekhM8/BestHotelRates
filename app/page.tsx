import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SearchBar } from '@/components/hotel/SearchBar';
import { HotelCardGrid } from '@/components/hotel/HotelCardGrid';
import { getFeaturedHotelsByCity } from '@/lib/hotels-data';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force dynamic to prevent prerendering
export const dynamic = 'force-dynamic';

const trendingDestinations = [
  { name: 'London', country: 'United Kingdom', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop' },
  { name: 'Manchester', country: 'United Kingdom', image: 'https://images.unsplash.com/photo-1515861461225-1488dfdaf0a8?w=800&h=600&fit=crop' },
  { name: 'Edinburgh', country: 'United Kingdom', image: 'https://images.unsplash.com/photo-1566041510639-8d95a2490bfb?w=800&h=600&fit=crop' },
  { name: 'Birmingham', country: 'United Kingdom', image: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=800&h=600&fit=crop' },
  { name: 'Liverpool', country: 'United Kingdom', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
];

const browseByType = [
  { name: 'Hotels', count: '2,847', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop' },
  { name: 'Apartments', count: '1,543', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop' },
  { name: 'Resorts', count: '428', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop' },
  { name: 'Villas', count: '892', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop' },
  { name: 'B&Bs', count: '1,267', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop' },
];

const quickCategories = [
  { name: 'Beach', href: '/search?category=beach' },
  { name: 'City Break', href: '/search?category=city' },
  { name: 'Romantic', href: '/search?category=romantic' },
  { name: 'Family', href: '/search?category=family' },
  { name: 'Luxury', href: '/search?category=luxury' },
  { name: 'Budget', href: '/search?category=budget' },
  { name: 'Spa & Wellness', href: '/search?category=spa' },
  { name: 'Business', href: '/search?category=business' },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  // Fetch featured hotels
  let londonHotels: Awaited<ReturnType<typeof getFeaturedHotelsByCity>> = [];
  try {
    londonHotels = await getFeaturedHotelsByCity('London', 4);
  } catch (err) {
    console.error('Failed to fetch hotels:', err);
  }

  const userName = session?.user?.name?.split(' ')[0] || null;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search */}
      <section className="bg-[#5DADE2] pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Personalized Greeting */}
          <div className="py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
              {userName ? `Where to next, ${userName}?` : 'Find your next stay'}
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Search deals on hotels, homes, and much more...
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar />
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Quick Trip Planner */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick and easy trip planner</h2>
          <p className="text-gray-600 mb-6">Pick a vibe and explore the top destinations in the United Kingdom</p>
          
          {/* Category Tabs */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-6 hide-scrollbar">
            {quickCategories.map((cat, idx) => (
              <Link
                key={cat.name}
                href={cat.href}
                className={`px-4 py-2 rounded-full border whitespace-nowrap transition-colors font-medium text-sm ${
                  idx === 0 
                    ? 'bg-[#5DADE2] text-white border-[#5DADE2]' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#5DADE2]'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Destination Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingDestinations.slice(0, 6).map((dest) => (
              <Link 
                key={dest.name}
                href={`/search?destination=${dest.name}`}
                className="group"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-2">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-gray-900">{dest.name}</h3>
                <p className="text-sm text-gray-500">45 miles away</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Destinations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trending destinations</h2>
          <p className="text-gray-600 mb-6">Most popular choices for travellers from the United Kingdom</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Large Cards */}
            {trendingDestinations.slice(0, 2).map((dest) => (
              <Link
                key={dest.name}
                href={`/search?destination=${dest.name}`}
                className="relative aspect-[16/9] md:aspect-[2/1] rounded-xl overflow-hidden group"
              >
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold">{dest.name}</h3>
                  <p className="text-sm text-white/80">{dest.country}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Smaller Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {trendingDestinations.slice(2, 5).map((dest) => (
              <Link
                key={dest.name}
                href={`/search?destination=${dest.name}`}
                className="relative aspect-[16/9] rounded-xl overflow-hidden group"
              >
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{dest.name}</h3>
                  <p className="text-sm text-white/80">{dest.country}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by Property Type */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by property type</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {browseByType.map((type) => (
              <Link
                key={type.name}
                href={`/search?type=${type.name.toLowerCase()}`}
                className="group"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                  <Image
                    src={type.image}
                    alt={type.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-gray-900">{type.name}</h3>
                <p className="text-sm text-gray-500">{type.count} properties</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Hotels */}
        {londonHotels.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Homes guests love</h2>
                <p className="text-gray-600">Popular hotels in London</p>
              </div>
              <Link 
                href="/search?destination=London"
                className="text-[#5DADE2] hover:underline font-medium"
              >
                View all →
              </Link>
            </div>
            
            <HotelCardGrid hotels={londonHotels} />
          </section>
        )}

        {/* Explore Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Explore United Kingdom</h2>
          <p className="text-gray-600 mb-6">These popular destinations have a lot to offer</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { city: 'London', properties: '2,847' },
              { city: 'Manchester', properties: '1,293' },
              { city: 'Edinburgh', properties: '987' },
              { city: 'Birmingham', properties: '654' },
            ].map((item) => (
              <Link
                key={item.city}
                href={`/search?destination=${item.city}`}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-[#5DADE2] hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                  🏨
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{item.city}</h3>
                  <p className="text-sm text-gray-500">{item.properties} properties</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Sign Up Banner */}
        {!session && (
          <section className="mb-12">
            <div className="bg-[#5DADE2] rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Save time, save money!
              </h2>
              <p className="text-white/90 mb-6 max-w-xl mx-auto">
                Sign up and we'll send the best deals to you
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50"
                />
                <Link
                  href="/register"
                  className="px-6 py-3 bg-[#3498DB] hover:bg-[#2980B9] text-white font-semibold rounded-lg transition-colors"
                >
                  Subscribe
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>

    </div>
  );
}
