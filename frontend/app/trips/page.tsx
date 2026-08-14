'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { EmptyState, ErrorState, LoadingState } from '@/components/StayoraUI';
import { bookingsApi, MOCK_GUEST_ID, formatCurrency, formatDate, type Booking } from '@/lib/api';

export default function TripsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await bookingsApi.list(MOCK_GUEST_ID);
        setBookings(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load trips');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) return <><Navbar /><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><LoadingState label="Loading your trips..." /></main></>;
  if (error) return <><Navbar /><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><ErrorState message={error} /></main></>;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">My trips</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Upcoming and recent stays</h1>
          </div>
        </div>

        {bookings.length === 0 ? (
          <EmptyState title="No trips yet" message="Book a home to start your Stayora journey." />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <article key={booking.id} className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
                    alt={booking.listing_title ?? 'Property'}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{booking.listing_title ?? 'Stayora listing'}</h2>
                    <p className="mt-1 text-sm text-slate-500">{booking.listing_city ?? 'Location'}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                      <span>Check-in: {formatDate(booking.check_in)}</span>
                      <span>Check-out: {formatDate(booking.check_out)}</span>
                    </div>
                    <div className="mt-1 text-sm text-slate-600">Guests: {booking.guests}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:flex-col md:items-end">
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Total</div>
                    <div className="text-xl font-bold text-slate-900">{formatCurrency(booking.total_price)}</div>
                  </div>
                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-700">
                    {booking.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
