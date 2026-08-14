import { formatCurrency, calculateNights } from "@/lib/api";

export default function BookingCard({
  pricePerNight,
  cleaningFee,
  serviceFee,
  guests,
  checkIn,
  checkOut,
  maxGuests,
  onBook,
  disabled,
}: {
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
  guests: number;
  checkIn: string;
  checkOut: string;
  maxGuests: number;
  onBook: () => void;
  disabled?: boolean;
}) {
  const nights = calculateNights(checkIn, checkOut);
  const subtotal = nights * pricePerNight;
  const total = subtotal + cleaningFee + serviceFee;

  return (
    <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_22px_40px_-24px_rgba(15,23,42,0.25)]">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-slate-900">{formatCurrency(pricePerNight)}</span>
          <span className="ml-1 text-sm text-slate-500">/ night</span>
        </div>
        <div className="text-sm text-slate-600">{maxGuests} guests</div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Check-in</div>
            <div className="mt-1 text-sm font-medium text-slate-800">{checkIn || "Select date"}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Check-out</div>
            <div className="mt-1 text-sm font-medium text-slate-800">{checkOut || "Select date"}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Guests: <span className="font-semibold text-slate-900">{guests}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onBook}
        disabled={disabled}
        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Reserve now
      </button>

      <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>{formatCurrency(pricePerNight)} × {nights} nights</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Cleaning fee</span>
          <span>{formatCurrency(cleaningFee)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Service fee</span>
          <span>{formatCurrency(serviceFee)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </aside>
  );
}
