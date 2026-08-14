export default function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const primary = images[0] ?? "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";
  const secondary = images[1] ?? primary;
  const tertiary = images[2] ?? primary;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <img src={primary} alt={title} className="h-80 w-full rounded-[26px] object-cover md:col-span-2" />
      <div className="grid gap-3">
        <img src={secondary} alt={title} className="h-38 w-full rounded-[26px] object-cover" />
        <img src={tertiary} alt={title} className="h-38 w-full rounded-[26px] object-cover" />
      </div>
    </div>
  );
}
