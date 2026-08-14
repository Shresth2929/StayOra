export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const MOCK_GUEST_ID = 4;
export const MOCK_HOST_ID = 1;

export type Listing = {
  id: number;
  host_id: number;
  title: string;
  description?: string | null;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  price_per_night: number;
  property_type?: string | null;
  max_guests: number;
  images: string[];
  amenities: string[];
  average_rating?: number | null;
  reviews_count?: number;
  created_at?: string;
};

export type Booking = {
  id: number;
  listing_id: number;
  listing_title?: string | null;
  listing_city?: string | null;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  nightly_price: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: string;
  created_at: string;
};

export type Review = {
  id: number;
  listing_id: number;
  user_id: number;
  rating: number;
  comment?: string | null;
  created_at: string;
};

export type FavoriteItem = {
  id: number;
  listing_id: number;
  listing_title?: string | null;
  created_at?: string;
};

export type HostStats = {
  listing_count: number;
  booking_count: number;
  confirmed_booking_count: number;
  total_booking_value: number;
};

async function request<T>(path: string, init: RequestInit = {}, query?: Record<string, string | number | undefined | null>): Promise<T> {
  const base = API_URL.replace(/\/$/, "");
  const url = new URL(`${base}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.detail ?? payload?.message ?? "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export const listingsApi = {
  list: (params: Record<string, string | number | undefined | null> = {}) =>
    request<{ data: Listing[]; meta: { total: number; page: number; limit: number; pages: number } }>("/api/listings", { method: "GET" }, params),
  get: (id: number) => request<Listing>(`/api/listings/${id}`),
  create: (payload: Partial<Listing> & { host_id: number; images?: string[]; amenities?: string[] }) =>
    request<Listing>("/api/listings/", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number, payload: Partial<Listing> & { images?: string[]; amenities?: string[] }, hostId: number) =>
    request<Listing>(`/api/listings/${id}?host_id=${hostId}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: number, hostId: number) => request<void>(`/api/listings/${id}?host_id=${hostId}`, { method: "DELETE" }),
};

export const bookingsApi = {
  create: (payload: { listing_id: number; guest_id: number; check_in: string; check_out: string; guests: number }) =>
    request<Booking>("/api/bookings/", { method: "POST", body: JSON.stringify(payload) }),
  list: (guestId?: number) => request<{ data: Booking[] }>("/api/bookings/", { method: "GET" }, guestId ? { guest_id: guestId } : {}),
};

export const hostApi = {
  stats: (hostId: number) => request<HostStats>("/api/host/stats", { method: "GET" }, { host_id: hostId }),
  listings: (hostId: number) => request<{ data: Listing[] }>("/api/host/listings", { method: "GET" }, { host_id: hostId }),
  bookings: (hostId: number) => request<{ data: Booking[] }>("/api/host/bookings", { method: "GET" }, { host_id: hostId }),
};

export const reviewsApi = {
  list: (listingId: number) => request<Review[]>(`/api/listings/${listingId}/reviews`),
  create: (payload: { listing_id: number; user_id: number; rating: number; comment?: string }) =>
    request<Review>("/api/reviews", { method: "POST", body: JSON.stringify(payload) }),
};

export const favoritesApi = {
  list: (userId: number) => request<{ data: FavoriteItem[] }>("/api/favorites/", { method: "GET" }, { user_id: userId }),
  add: (userId: number, listingId: number) =>
    request<{ id: number; listing_id: number }>(`/api/favorites/?user_id=${userId}&listing_id=${listingId}`, { method: "POST" }),
  remove: (userId: number, listingId: number) => request<void>(`/api/favorites/${listingId}?user_id=${userId}`, { method: "DELETE" }),
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value?: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function calculateNights(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return diff > 0 ? Math.ceil(diff / 86400000) : 0;
}
