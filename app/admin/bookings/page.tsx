'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalPages: 1,
    totalCount: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, searchQuery, page, pageSize]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', page.toString());
      params.set('pageSize', pageSize.toString());

      const response = await fetch(`/api/admin/bookings?${params.toString()}`);

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      const data = await response.json();
      setBookings(data.bookings || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
      if (data.stats) {
        setStats(data.stats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Convert bookings to CSV
    const headers = ['Reference', 'Guest', 'Email', 'Hotel', 'Check-in', 'Check-out', 'Amount', 'Status', 'Date'];
    const rows = bookings.map(b => [
      b.bookingReference,
      b.guestName,
      b.guestEmail,
      b.hotelName,
      formatDate(b.checkIn),
      formatDate(b.checkOut),
      b.totalAmount,
      b.status,
      formatDate(b.createdAt),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchBookings(); // Refresh list
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const pageSummary = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize + 1;
    const end = Math.min(pagination.totalCount, start + pagination.pageSize - 1);
    if (pagination.totalCount === 0) return '0 results';
    return `${start.toLocaleString()} – ${end.toLocaleString()} of ${pagination.totalCount.toLocaleString()}`;
  }, [pagination]);

  return (
    <main className="relative min-h-screen pb-24 pt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <h1 className="text-4xl font-bold text-white drop-shadow-2xl">
            All Bookings
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="glass-card-small px-5 py-2.5 text-white font-semibold hover:bg-white/20"
            >
              Dashboard
            </button>
            <button
              onClick={handleExportCSV}
              className="glass-card-small px-5 py-2.5 text-white font-semibold hover:bg-white/20"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8">
          <Input
            placeholder="Search by reference, guest, hotel..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            }
          />

          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`glass-card-small px-4 py-2 text-sm font-semibold transition-all ${
                  statusFilter === status ? 'bg-white/25 border border-white/40' : 'border border-transparent'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 justify-end">
            <label className="text-white/60 text-sm">Rows per page</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="glass-input px-3 py-2 text-sm"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Pending', value: stats.pending },
            { label: 'Confirmed', value: stats.confirmed },
            { label: 'Cancelled', value: stats.cancelled },
            { label: 'Completed', value: stats.completed },
          ].map((stat) => (
            <div key={stat.label} className="glass-card text-center py-3">
              <p className="text-white/60 text-xs uppercase tracking-[0.3em] mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Bookings Table */}
        <GlassCard>
          {loading ? (
            <p className="text-white/70 text-center py-8">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="text-white/70 text-center py-8">No bookings found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/70 text-sm font-semibold pb-3 pr-4">Reference</th>
                    <th className="text-left text-white/70 text-sm font-semibold pb-3 pr-4">Guest</th>
                    <th className="text-left text-white/70 text-sm font-semibold pb-3 pr-4">Hotel</th>
                    <th className="text-left text-white/70 text-sm font-semibold pb-3 pr-4">Dates</th>
                    <th className="text-left text-white/70 text-sm font-semibold pb-3 pr-4">Amount</th>
                    <th className="text-left text-white/70 text-sm font-semibold pb-3 pr-4">Status</th>
                    <th className="text-left text-white/70 text-sm font-semibold pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4 text-white font-mono text-xs pr-4">{booking.bookingReference}</td>
                      <td className="py-4 text-white text-sm pr-4">
                        <div>{booking.guestName}</div>
                        <div className="text-white/60 text-xs">{booking.guestEmail}</div>
                      </td>
                      <td className="py-4 text-white text-sm pr-4">
                        <div>{booking.hotelName}</div>
                        <div className="text-white/60 text-xs">{booking.hotelLocation}</div>
                      </td>
                      <td className="py-4 text-white text-sm pr-4">
                        <div>{formatDate(booking.checkIn)}</div>
                        <div className="text-white/60 text-xs">to {formatDate(booking.checkOut)}</div>
                      </td>
                      <td className="py-4 text-white font-semibold pr-4">{formatCurrency(booking.totalAmount)}</td>
                      <td className="py-4 pr-4">
                        <select
                          value={booking.status}
                          onChange={(e) => handleUpdateStatus(booking.id, e.target.value)}
                          className="glass-input px-2 py-1 text-xs font-bold"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="CANCELLED">CANCELLED</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                          className="text-white/80 hover:text-white text-sm font-semibold"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
        <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
          <p className="text-white/60 text-sm">{pageSummary}</p>
          <div className="flex items-center gap-2">
            <button
              className="glass-card-small px-4 py-2 text-white disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={pagination.page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <span className="text-white/70 text-sm">
              Page {pagination.page} / {pagination.totalPages}
            </span>
            <button
              className="glass-card-small px-4 py-2 text-white disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

