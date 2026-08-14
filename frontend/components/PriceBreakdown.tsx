import { formatCurrency } from "@/lib/api";

export default function PriceBreakdown({
  nights,
  nightlyPrice,
  cleaningFee,
  serviceFee,
  total,
}: {
  nights: number;
  nightlyPrice: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Price breakdown</h3>
      <div className="mt-4 space-y-3 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>{formatCurrency(nightlyPrice)} × {nights} nights</span>
          <span>{formatCurrency(nights * nightlyPrice)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Cleaning fee</span>
          <span>{formatCurrency(cleaningFee)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Service fee</span>
          <span>{formatCurrency(serviceFee)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
