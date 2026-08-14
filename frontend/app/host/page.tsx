'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { EmptyState, ErrorState, LoadingState } from '@/components/StayoraUI';
import { formatCurrency, hostApi, listingsApi, MOCK_HOST_ID, type Booking, type Listing } from '@/lib/api';

export default function HostPage() {
  const [stats, setStats] = useState({ listing_count: 0, booking_count: 0, confirmed_booking_count: 0, total_booking_value: 0 });
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsResponse, listingsResponse, bookingsResponse] = await Promise.all([
          hostApi.stats(MOCK_HOST_ID),
          hostApi.listings(MOCK_HOST_ID),
          hostApi.bookings(MOCK_HOST_ID),
        ]);
        setStats(statsResponse);
        setListings(listingsResponse.data);
        setBookings(bookingsResponse.data.slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load host dashboard');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const removeListing = async (listingId: number) => {
    try {
      await listingsApi.remove(listingId, MOCK_HOST_ID);
      setListings((prev) => prev.filter((listing) => listing.id !== listingId));
    } catch {
      setError('Unable to delete listing');
    }
  };

  if (loading) return <><Navbar /><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><LoadingState label="Loading host dashboard..." /></main></>;
  if (error) return <><Navbar /><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><ErrorState message={error} /></main></>;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">Host dashboard</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Your property performance</h1>
          </div>
          <Link href="/host/listings/new" className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Create Listing
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total listings', value: stats.listing_count },
            { label: 'Total bookings', value: stats.booking_count },
            { label: 'Confirmed bookings', value: stats.confirmed_booking_count },
            { label: 'Total booking value', value: formatCurrency(stats.total_booking_value) },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">{item.label}</div>
              <div className="mt-3 text-3xl font-bold text-slate-900">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Owned listings</h2>
              <span className="text-sm text-slate-500">{listings.length} active</span>
            </div>
            {listings.length === 0 ? <EmptyState title="No listings yet" message="Create a listing to begin hosting." /> : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <img src={listing.images[0] ?? 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'} alt={listing.title} className="h-16 w-16 rounded-2xl object-cover" />
                      <div>
                        <div className="font-semibold text-slate-900">{listing.title}</div>
                        <div className="text-sm text-slate-500">{listing.city ?? listing.location ?? 'Location'}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/host/listings/${listing.id}/edit`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">Edit</Link>
                      <button type="button" onClick={() => removeListing(listing.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100">Delete</button>
                      <Link href={`/host/listings/${listing.id}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">View bookings</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Recent bookings</h2>
            {bookings.length === 0 ? <div className="mt-6"><EmptyState title="No bookings yet" message="Your recent guest reservations will appear here." /></div> : (
              <div className="mt-5 space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-900">{booking.listing_title ?? 'Listing'}</div>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">{booking.status}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">Guests: {booking.guests}</div>
                    <div className="mt-1 text-sm text-slate-600">{booking.check_in} → {booking.check_out}</div>
                    <div className="mt-2 text-sm font-medium text-slate-800">{formatCurrency(booking.total_price)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
