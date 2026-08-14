const propertyTypes = ["All", "Apartment", "Villa", "House", "Cabin", "Hotel"];

export default function FilterBar({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (type: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {propertyTypes.map((type) => {
        const selected = value === type || (type === "All" && value === "");
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type === "All" ? "" : type)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              selected
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
}
