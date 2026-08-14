import ListingCard from "@/components/ListingCard";
import type { Listing } from "@/lib/api";

export default function ListingGrid({
  listings,
  favorites,
  onToggleFavorite,
}: {
  listings: Listing[];
  favorites: number[];
  onToggleFavorite?: (listingId: number) => void;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          favorite={favorites.includes(listing.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
