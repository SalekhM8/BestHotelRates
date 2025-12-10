import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Travel Blog - Best Hotel Rates',
  description: 'Discover travel tips, destination guides, and hotel booking advice from Best Hotel Rates.',
};

const blogPosts = [
  {
    id: 1,
    title: '10 Tips for Finding the Best Hotel Deals',
    excerpt: 'Discover insider secrets to booking hotels at unbeatable prices and getting the most value for your money.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
    date: '2025-01-15',
    category: 'Travel Tips',
  },
  {
    id: 2,
    title: 'Top 10 Luxury Hotels in London',
    excerpt: 'Explore the finest luxury accommodations London has to offer, from historic palaces to modern penthouses.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop',
    date: '2025-01-12',
    category: 'Destination Guides',
  },
  {
    id: 3,
    title: 'Dubai Travel Guide 2025',
    excerpt: 'Everything you need to know about visiting Dubai, including best hotels, attractions, and local tips.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop',
    date: '2025-01-10',
    category: 'Destination Guides',
  },
  {
    id: 4,
    title: 'How to Book Hotels Like a Pro',
    excerpt: 'Master the art of hotel booking with our comprehensive guide to getting the best rooms at the best prices.',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop',
    date: '2025-01-08',
    category: 'Travel Tips',
  },
];

export default function BlogPage() {
  return (
    <main className="relative min-h-screen pb-32 md:pb-24 pt-24">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
          Travel Blog
        </h1>
        <p className="text-white/80 text-lg mb-12">
          Tips, guides, and insights for savvy travelers
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts.map((post) => (
            <Link href={`/blog/${post.id}`} key={post.id}>
              <GlassCard className="p-0 hover:scale-[1.02] transition-all cursor-pointer">
                <div className="relative h-48 rounded-t-3xl overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 glass-card-small px-3 py-1.5 text-xs font-bold">
                    {post.category}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-white/60 text-sm mb-2">{post.date}</p>
                  <h2 className="text-2xl font-bold text-white mb-3">{post.title}</h2>
                  <p className="text-white/80 leading-relaxed">{post.excerpt}</p>
                  <div className="mt-4 text-white font-semibold flex items-center gap-2">
                    Read More
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

