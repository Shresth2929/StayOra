"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import ListingGrid from "@/components/ListingGrid";
import { EmptyState, ErrorState, LoadingState, Toast } from "@/components/StayoraUI";
import { listingsApi, favoritesApi, MOCK_GUEST_ID, type Listing } from "@/lib/api";

const pageSize = 12;

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 0 });
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [toast, setToast] = useState<string | null>(null);

  const fetchListings = async (nextPage = page) => {
    try {
      setLoading(true);
      const response = await listingsApi.list({
        location: location || undefined,
        property_type: propertyType || undefined,
        guests: guests || undefined,
        page: nextPage,
        limit: pageSize,
      });
      setListings(response.data);
      setMeta(response.meta);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await favoritesApi.list(MOCK_GUEST_ID);
      setFavorites(response.data.map((item) => item.listing_id));
    } catch {
      setFavorites([]);
    }
  };

  useEffect(() => {
    void fetchListings();
    void fetchFavorites();
  }, []);

  const handleSearch = () => {
    setPage(1);
    void fetchListings(1);
  };

  const toggleFavorite = async (listingId: number) => {
    const isListed = favorites.includes(listingId);
    try {
      if (isListed) {
        await favoritesApi.remove(MOCK_GUEST_ID, listingId);
        setFavorites((prev) => prev.filter((id) => id !== listingId));
      } else {
        await favoritesApi.add(MOCK_GUEST_ID, listingId);
        setFavorites((prev) => [...prev, listingId]);
      }
      setToast(isListed ? "Removed from wishlist" : "Saved to wishlist");
    } catch (err) {
      setToast(err instanceof Error ? err.message : "Unable to update wishlist");
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <section className="rounded-4xl bg-linear-to-br from-emerald-50 via-white to-sky-50 p-5 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Stayora</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Find your next perfect stay.
              </h1>
            </div>
          </div>

          <SearchBar
            location={location}
            setLocation={setLocation}
            checkIn={checkIn}
            setCheckIn={setCheckIn}
            checkOut={checkOut}
            setCheckOut={setCheckOut}
            guests={guests}
            setGuests={setGuests}
            onSearch={handleSearch}
          />
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Popular stays</h2>
            <span className="text-sm text-slate-500">{meta.total} homes</span>
          </div>
          <FilterBar value={propertyType} onSelect={setPropertyType} />
        </section>

        {toast ? (
          <div className="mt-6">
            <Toast message={toast} />
          </div>
        ) : null}

        <section className="mt-8">
          {error ? <ErrorState message={error} /> : null}
          {loading ? <LoadingState label="Loading listings..." /> : null}
          {!loading && listings.length === 0 ? (
            <EmptyState title="No stays match your search" message="Try another location or date range." />
          ) : null}
          {!loading && listings.length > 0 ? (
            <ListingGrid listings={listings} favorites={favorites} onToggleFavorite={toggleFavorite} />
          ) : null}
        </section>

        {meta.pages > 1 && !loading ? (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                const next = Math.max(1, page - 1);
                setPage(next);
                void fetchListings(next);
              }}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">Page {page} of {meta.pages}</span>
            <button
              type="button"
              disabled={page >= meta.pages}
              onClick={() => {
                const next = Math.min(meta.pages, page + 1);
                setPage(next);
                void fetchListings(next);
              }}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </main>
    </>
  );
}
