'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const handleAuthClick = () => {
    if (session) {
      setShowUserMenu(!showUserMenu);
    } else {
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
    setShowUserMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] px-4 md:px-6 py-4 md:py-5 bg-gradient-to-b from-black/20 to-transparent backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between relative">
        <Link href="/" className="text-lg md:text-2xl font-bold text-white drop-shadow-2xl hover:opacity-80 transition-opacity">
          Best Hotel Rates
        </Link>

        <div className="relative">
          {status === 'loading' ? (
            <Button size="sm" disabled>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </Button>
          ) : session ? (
            <>
              <Button size="sm" onClick={handleAuthClick} className="cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="hidden md:inline">{session.user?.name || 'Account'}</span>
              </Button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 top-full mt-3 w-56 p-3 shadow-2xl rounded-2xl border-2 border-[rgba(135,206,250,0.3)] z-[9999]"
                  style={{
                    background: 'rgba(20, 30, 70, 0.98)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-white text-sm font-medium hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/bookings"
                    className="block px-4 py-3 text-white text-sm font-medium hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Bookings
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block px-4 py-3 text-white text-sm font-medium hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Wishlist
                  </Link>
                  <hr className="my-2 border-white/20" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-white text-sm font-medium hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <Button size="sm" onClick={handleAuthClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span className="hidden md:inline">Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

