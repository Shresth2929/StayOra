export default function GuestSelector({
  value,
  maxGuests,
  onChange,
}: {
  value: number;
  maxGuests: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div>
        <div className="text-sm font-medium text-slate-900">Guests</div>
        <div className="text-xs text-slate-500">Up to {maxGuests} guests</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-lg"
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-medium text-slate-800">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(maxGuests, value + 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}
