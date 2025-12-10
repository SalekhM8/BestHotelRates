'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import Image from 'next/image';

const categories = [
  {
    id: 'luxury',
    name: 'Luxury Hotels',
    description: '5-star accommodations with world-class amenities',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
    count: 120,
  },
  {
    id: 'business',
    name: 'Business Hotels',
    description: 'Perfect for corporate travelers and meetings',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop',
    count: 85,
  },
  {
    id: 'boutique',
    name: 'Boutique Hotels',
    description: 'Unique, stylish properties with character',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop',
    count: 65,
  },
  {
    id: 'beach',
    name: 'Beach Resorts',
    description: 'Seaside paradise with stunning ocean views',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop',
    count: 95,
  },
  {
    id: 'budget',
    name: 'Budget-Friendly',
    description: 'Great value without compromising quality',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop',
    count: 150,
  },
  {
    id: 'family',
    name: 'Family Hotels',
    description: 'Kid-friendly accommodations for the whole family',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
    count: 78,
  },
];

export default function CategoriesPage() {
  const router = useRouter();

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/search?category=${categoryId}`);
  };

  return (
    <main className="relative min-h-screen pb-32 md:pb-24 pt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
          Browse by Category
        </h1>
        <p className="text-white/80 text-lg mb-12">
          Find the perfect hotel type for your travel needs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <GlassCard
              key={category.id}
              className="p-0 cursor-pointer group hover:scale-[1.02] transition-all"
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="relative h-56 rounded-t-3xl overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-white mb-1">{category.name}</h2>
                  <p className="text-white/90 text-sm">{category.count}+ hotels</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-white/80 leading-relaxed mb-4">{category.description}</p>
                <div className="flex items-center text-white font-semibold gap-2">
                  Explore
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </main>
  );
}

