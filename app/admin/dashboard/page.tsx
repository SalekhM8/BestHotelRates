'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Stats {
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  paidBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotelStats, setHotelStats] = useState<any>(null);
  const [transferStats, setTransferStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [legacyRes, hotelRes, transferRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/stats/hotels'),
        fetch('/api/admin/stats/transfers'),
      ]);

      if (legacyRes.status === 401 || hotelRes.status === 401 || transferRes.status === 401) {
        router.push('/admin/login');
        return;
      }

      const legacyData = await legacyRes.json();
      const hotelData = await hotelRes.json();
      const transferData = await transferRes.json();

      setStats(legacyData.stats);
      setRecentBookings(legacyData.recentBookings || []);
      setHotelStats(hotelData.stats);
      setTransferStats(transferData.stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'admin-token=; path=/admin; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <main className="relative min-h-screen pb-24 pt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-white">Loading dashboard...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen pb-24 pt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-2xl">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/bookings')}
              className="glass-card-small px-5 py-2.5 text-white font-semibold hover:bg-white/20"
            >
              All Bookings
            </button>
            <button
              onClick={handleLogout}
              className="glass-card-small px-5 py-2.5 text-white font-semibold hover:bg-white/20"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <GlassCard>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white/70 text-sm font-semibold">Total Revenue</h3>
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">
              {formatCurrency(stats?.totalRevenue || 0)}
            </p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white/70 text-sm font-semibold">Total Bookings</h3>
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">{stats?.totalBookings || 0}</p>
            <p className="text-sm text-white/60 mt-2">
              {stats?.paidBookings || 0} paid · {stats?.pendingBookings || 0} pending
            </p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white/70 text-sm font-semibold">Total Users</h3>
              <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">{stats?.totalUsers || 0}</p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white/70 text-sm font-semibold">Cancelled</h3>
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">{stats?.cancelledBookings || 0}</p>
          </GlassCard>
        </div>

        {/* Recent Bookings */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Bookings</h2>
            <button
              onClick={() => router.push('/admin/bookings')}
              className="text-white/80 hover:text-white text-sm font-semibold"
            >
              View all →
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-white/70 text-center py-8">No bookings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/70 text-sm font-semibold pb-3">Reference</th>
                    <th className="text-left text-white/70 text-sm font-semibold pb-3">Guest</th>
                    <th className="text-left text-white/70 text-sm font-semibold pb-3">Hotel</th>
                    <th className="text-left text-white/70 text-sm font-semibold pb-3">Amount</th>
                    <th className="text-left text-white/70 text-sm font-semibold pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-white/10">
                      <td className="py-4 text-white font-mono text-sm">{booking.bookingReference}</td>
                      <td className="py-4 text-white text-sm">{booking.user?.name || booking.guestName}</td>
                      <td className="py-4 text-white text-sm">{booking.hotelName}</td>
                      <td className="py-4 text-white font-semibold">{formatCurrency(booking.totalAmount)}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          booking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-300' :
                          booking.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                          booking.status === 'CANCELLED' ? 'bg-red-500/20 text-red-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-[0.4em]">Hotels</p>
              <h2 className="text-3xl font-bold text-white">Inventory overview</h2>
            </div>
            <button
              onClick={() => router.push('/admin/bookings')}
              className="glass-card-small px-4 py-2 text-white font-semibold hover:bg-white/20"
            >
              Manage hotels →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsTile label="All" value={hotelStats?.total ?? 0} />
            <StatsTile label="Upcoming" value={hotelStats?.upcoming ?? 0} highlight />
            <StatsTile label="Active" value={hotelStats?.active ?? 0} />
            <StatsTile label="Completed" value={hotelStats?.completed ?? 0} />
            <StatsTile label="Cancelled" value={hotelStats?.cancelled ?? 0} tone="danger" />
            <StatsTile label="Unpaid" value={hotelStats?.unpaid ?? 0} tone="warning" />
            <StatsTile label="Free cancellation" value={hotelStats?.freeCancellation ?? 0} />
            <StatsTile label="Automatic cancellation" value={hotelStats?.automaticCancellation ?? 0} />
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-[0.4em]">Transfers & car hire</p>
              <h2 className="text-3xl font-bold text-white">Ground services</h2>
            </div>
            <button
              onClick={() => router.push('/admin/bookings?service=transfer')}
              className="glass-card-small px-4 py-2 text-white font-semibold hover:bg-white/20"
            >
              Manage transfers →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatsTile label="All" value={transferStats?.total ?? 0} />
            <StatsTile label="Upcoming" value={transferStats?.upcoming ?? 0} highlight />
            <StatsTile label="Completed" value={transferStats?.completed ?? 0} />
            <StatsTile label="Cancelled" value={transferStats?.cancelled ?? 0} tone="danger" />
            <StatsTile label="Unpaid" value={transferStats?.unpaid ?? 0} tone="warning" />
          </div>
        </section>
      </div>
    </main>
  );
}

const StatsTile = ({
  label,
  value,
  highlight,
  tone,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  tone?: 'danger' | 'warning';
}) => (
  <GlassCard>
    <p className="text-white/60 text-xs uppercase tracking-[0.4em] mb-2">{label}</p>
    <p
      className={`text-3xl font-bold ${
        tone === 'danger'
          ? 'text-red-300'
          : tone === 'warning'
            ? 'text-amber-300'
            : highlight
              ? 'text-emerald-300'
              : 'text-white'
      }`}
    >
      {value}
    </p>
  </GlassCard>
);

