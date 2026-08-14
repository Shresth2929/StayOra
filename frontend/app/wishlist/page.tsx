'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { EmptyState, ErrorState, LoadingState } from '@/components/StayoraUI';
import { favoritesApi, listingsApi, MOCK_GUEST_ID, type Listing } from '@/lib/api';

export default function WishlistPage() {
  const [favorites, setFavorites] = useState<Array<{ id: number; listing_id: number; listing_title?: string | null }>>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const response = await favoritesApi.list(MOCK_GUEST_ID);
      setFavorites(response.data);
      const detailed = await Promise.all(
        response.data.map(async (favorite) => listingsApi.get(favorite.listing_id).catch(() => null)),
      );
      setListings(detailed.filter(Boolean) as Listing[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const removeFavorite = async (listingId: number) => {
    try {
      await favoritesApi.remove(MOCK_GUEST_ID, listingId);
      setFavorites((prev) => prev.filter((item) => item.listing_id !== listingId));
      setListings((prev) => prev.filter((listing) => listing.id !== listingId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove favorite');
    }
  };

  if (loading) return <><Navbar /><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><LoadingState label="Loading wishlist..." /></main></>;
  if (error) return <><Navbar /><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><ErrorState message={error} /></main></>;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">Wishlist</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Saved stays</h1>
        </div>

        {listings.length === 0 ? (
          <EmptyState title="No saved stays yet" message="Save homes you like to revisit later." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <article key={listing.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <img src={listing.images[0] ?? 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'} alt={listing.title} className="h-60 w-full object-cover" />
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{listing.title}</h2>
                      <p className="text-sm text-slate-500">{listing.location ?? listing.city ?? 'Location'}</p>
                    </div>
                    <button type="button" onClick={() => removeFavorite(listing.id)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      Remove
                    </button>
                  </div>
                  <Link href={`/listings/${listing.id}`} className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                    View listing
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
