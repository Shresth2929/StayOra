type SearchBarProps = {
  location: string;
  setLocation: (value: string) => void;
  checkIn: string;
  setCheckIn: (value: string) => void;
  checkOut: string;
  setCheckOut: (value: string) => void;
  guests: number;
  setGuests: (value: number) => void;
  onSearch: () => void;
};

export default function SearchBar({
  location,
  setLocation,
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  guests,
  setGuests,
  onSearch,
}: SearchBarProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.25)] ring-1 ring-white/80">
      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_auto]">
        <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">Where</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Goa, Jaipur, Mumbai..."
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </label>

        <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">Check in</span>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 outline-none"
          />
        </label>

        <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">Check out</span>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-800 outline-none"
          />
        </label>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">Guests</span>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700"
            >
              −
            </button>
            <span className="text-sm font-medium text-slate-800">{guests}</span>
            <button
              type="button"
              onClick={() => setGuests(guests + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onSearch}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Search
        </button>
      </div>
    </div>
  );
}
