import Link from "next/link";
import { formatCurrency } from "@/lib/api";
import type { Listing } from "@/lib/api";

export default function ListingCard({
  listing,
  favorite,
  onToggleFavorite,
}: {
  listing: Listing;
  favorite: boolean;
  onToggleFavorite?: (listingId: number) => void;
}) {
  const image = listing.images?.[0] ?? "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";

  return (
    <article className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <Link href={`/listings/${listing.id}`} className="block">
          <img src={image} alt={listing.title} className="h-64 w-full object-cover transition duration-300 group-hover:scale-105" />
        </Link>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleFavorite?.(listing.id);
          }}
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/80 text-lg shadow-sm backdrop-blur-sm transition hover:bg-white"
          aria-label={favorite ? "Remove from wishlist" : "Add to wishlist"}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{listing.title}</h3>
            <p className="text-sm text-slate-500">{listing.location ?? listing.city ?? "Location"}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
            ★ {listing.average_rating?.toFixed(1) ?? "New"}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>{listing.property_type ?? "Stay"}</span>
          <span>•</span>
          <span>{listing.max_guests} guests</span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <div>
            <span className="text-lg font-semibold text-slate-900">{formatCurrency(listing.price_per_night)}</span>
            <span className="text-sm text-slate-500"> / night</span>
          </div>
          <Link
            href={`/listings/${listing.id}`}
            className="rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
