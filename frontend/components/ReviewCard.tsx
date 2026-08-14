export default function ReviewCard({
  rating,
  comment,
  userName,
}: {
  rating: number;
  comment?: string | null;
  userName?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium text-slate-900">{userName ?? "Guest"}</div>
        <div className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">★ {rating}.0</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{comment ?? "Excellent stay."}</p>
    </div>
  );
}
