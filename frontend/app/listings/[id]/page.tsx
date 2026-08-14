'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ImageGallery from '@/components/ImageGallery';
import GuestSelector from '@/components/GuestSelector';
import BookingCard from '@/components/BookingCard';
import ReviewCard from '@/components/ReviewCard';
import { EmptyState, ErrorState, LoadingState, Toast } from '@/components/StayoraUI';
import { bookingsApi, favoritesApi, listingsApi, reviewsApi, MOCK_GUEST_ID, formatCurrency, formatDate, type Listing, type Review } from '@/lib/api';

const addDays = (value: string, days: number) => {
  if (!value) return '';
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const listingId = Number(params?.id ?? 0);
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  useEffect(() => {
    if (!listingId) return;

    const load = async () => {
      setLoading(true);
      try {
        const [detail, reviewList] = await Promise.all([
          listingsApi.get(listingId),
          reviewsApi.list(listingId).catch(() => []),
        ]);

        setListing(detail);
        setReviews(reviewList);
        setGuests(Math.min(detail.max_guests, 2));
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() + 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 3);
        setCheckIn(start.toISOString().slice(0, 10));
        setCheckOut(end.toISOString().slice(0, 10));

        const favoritesResponse = await favoritesApi.list(MOCK_GUEST_ID);
        setFavorite(favoritesResponse.data.some((item) => item.listing_id === detail.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load listing');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [listingId]);

  const handleFavoriteToggle = async () => {
    if (!listing) return;
    try {
      if (favorite) {
        await favoritesApi.remove(MOCK_GUEST_ID, listing.id);
        setFavorite(false);
        setToast('Removed from wishlist');
      } else {
        await favoritesApi.add(MOCK_GUEST_ID, listing.id);
        setFavorite(true);
        setToast('Saved to wishlist');
      }
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Unable to update wishlist');
    }
  };

  const averageRating = useMemo(() => {
    if (!reviews.length) return listing?.average_rating ?? 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [listing, reviews]);

  const handleBooking = () => {
    if (!listing) return;
    if (!checkIn || !checkOut) {
      setToast('Select check-in and check-out dates');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setToast('Check-out must be after check-in');
      return;
    }
    router.push(`/booking/${listing.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  if (loading) return <><Navbar /><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><LoadingState label="Loading listing..." /></main></>;
  if (error || !listing) return <><Navbar /><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><ErrorState message={error ?? 'Listing not found'} /></main></>;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {toast ? <div className="mb-6"><Toast message={toast} /></div> : null}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 text-sm font-medium uppercase tracking-[0.22em] text-emerald-700">{listing.property_type ?? 'Stay'}</div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{listing.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleFavoriteToggle}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {favorite ? '♥ Saved' : '♡ Save'}
            </button>
            <Link href="/" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Back to homes
            </Link>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <span>📍 {listing.location ?? listing.city ?? 'Location unavailable'}</span>
          <span>⭐ {averageRating ? averageRating.toFixed(1) : 'New'} · {reviews.length} reviews</span>
          <span>👥 Up to {listing.max_guests} guests</span>
        </div>

        <ImageGallery images={listing.images} title={listing.title} />

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-8">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">About this place</h2>
              <p className="mt-4 leading-7 text-slate-600">{listing.description ?? 'A beautiful home designed for relaxed, memorable stays.'}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {listing.amenities?.length ? listing.amenities.map((amenity) => (
                  <div key={amenity} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                    ✓ {amenity}
                  </div>
                )) : <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">No listed amenities</div>}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Host</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white">
                  H
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900">Stayora Host</div>
                  <div className="text-sm text-slate-500">Superhost · 4.9 rating</div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Choose your dates</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Check-in</span>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent text-sm text-slate-800 outline-none" />
                </label>
                <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Check-out</span>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent text-sm text-slate-800 outline-none" />
                </label>
              </div>
              <div className="mt-5">
                <GuestSelector value={guests} maxGuests={listing.max_guests} onChange={setGuests} />
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Reviews</h2>
              <div className="mt-5 space-y-4">
                {reviews.length ? reviews.map((review) => (
                  <ReviewCard key={review.id} rating={review.rating} comment={review.comment} userName={`Guest ${review.user_id}`} />
                )) : <EmptyState title="No reviews yet" message="This listing is brand new to the market." />}
              </div>
            </section>
          </div>

          <div className="lg:pt-2">
            <BookingCard
              pricePerNight={listing.price_per_night}
              cleaningFee={500}
              serviceFee={250}
              guests={guests}
              checkIn={checkIn}
              checkOut={checkOut}
              maxGuests={listing.max_guests}
              onBook={handleBooking}
              disabled={!checkIn || !checkOut}
            />
          </div>
        </div>
      </main>
    </>
  );
}
