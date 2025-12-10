'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export const BottomNav: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (path: string) => {
    if (path === '/wishlist' || path === '/bookings' || path === '/profile') {
      if (!session) {
        router.push('/login');
        return;
      }
    }
    router.push(path);
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  const navItems = [
    {
      id: 'explore',
      label: 'Explore',
      path: '/',
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      ),
    },
    {
      id: 'favorites',
      label: 'Favorites',
      path: '/wishlist',
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      ),
    },
    {
      id: 'trips',
      label: 'Trips',
      path: '/bookings',
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: (active: boolean) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
    },
  ];

  return (
    <nav className="glass-card fixed bottom-3 left-1/2 transform -translate-x-1/2 flex items-center justify-between px-3 py-2.5 w-[calc(100%-32px)] max-w-[480px] md:hidden z-50 shadow-2xl">
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.path)}
            className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all flex-1 min-w-0 ${
              active ? 'text-white bg-white/15' : 'text-white/60 hover:text-white'
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              {item.icon(active)}
            </div>
            <span className="text-[8px] font-bold uppercase tracking-tight leading-none whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

