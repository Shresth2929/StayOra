'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PriceBreakdown from '@/components/PriceBreakdown';
import { ErrorState, LoadingState, Toast } from '@/components/StayoraUI';
import { bookingsApi, listingsApi, MOCK_GUEST_ID, formatCurrency, type Listing } from '@/lib/api';

export default function BookingPage() {
  const params = useParams<{ listingId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const listingId = Number(params?.listingId ?? 0);
  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const guests = Number(searchParams.get('guests') ?? 2);

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [booking, setBooking] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!listingId) return;

    const load = async () => {
      try {
        const detail = await listingsApi.get(listingId);
        setListing(detail);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load listing');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [listingId]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  }, [checkIn, checkOut]);

  const priceTotal = listing ? listing.price_per_night * nights + 500 + 250 : 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!listing) return;
    setSubmitting(true);
    try {
      const created = await bookingsApi.create({
        listing_id: listing.id,
        guest_id: MOCK_GUEST_ID,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      });
      setBooking(created);
      setSuccess('Booking confirmed. Your trip details are ready below.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <><Navbar /><main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><LoadingState label="Preparing booking..." /></main></>;
  if (error || !listing) return <><Navbar /><main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"><ErrorState message={error ?? 'Listing not found'} /></main></>;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {success ? <div className="mb-6"><Toast message={success} type="success" /></div> : null}
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">Stayora booking</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Complete your reservation</h1>
          </div>
          <button type="button" onClick={() => router.push(`/listings/${listing.id}`)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Change dates
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Guest details</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Full name
                  <input defaultValue="Kunal Guest" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                  <input defaultValue="kunal@stayora.com" type="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300" />
                </label>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">Payment</h2>
              <div className="mt-4 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Card number
                  <input placeholder="4242 4242 4242 4242" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300" />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Expiry
                    <input placeholder="MM / YY" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300" />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    CVC
                    <input placeholder="123" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300" />
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? 'Confirming...' : 'Confirm booking'}
            </button>
          </form>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <img src={listing.images[0] ?? 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'} alt={listing.title} className="h-52 w-full object-cover" />
              <div className="p-5">
                <div className="text-sm text-slate-500">{listing.property_type ?? 'Property'}</div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">{listing.title}</h2>
                <p className="mt-2 text-sm text-slate-500">{listing.location ?? listing.city ?? 'Location'}</p>
              </div>
            </div>

            <PriceBreakdown nights={nights} nightlyPrice={listing.price_per_night} cleaningFee={500} serviceFee={250} total={priceTotal} />

            {booking ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                <h3 className="text-lg font-semibold text-emerald-900">Booking confirmed</h3>
                <div className="mt-3 space-y-2 text-sm text-emerald-800">
                  <div>Stay: {listing.title}</div>
                  <div>Dates: {checkIn} → {checkOut}</div>
                  <div>Guests: {booking.guests ?? guests}</div>
                  <div>Total: {formatCurrency(booking.total_price ?? priceTotal)}</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}
