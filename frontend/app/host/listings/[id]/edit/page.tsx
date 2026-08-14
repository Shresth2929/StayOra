'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ErrorState, LoadingState, Toast } from '@/components/StayoraUI';
import { listingsApi, MOCK_HOST_ID, type Listing } from '@/lib/api';

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const listingId = Number(params?.id ?? 0);
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    city: '',
    country: '',
    price_per_night: '0',
    property_type: 'Apartment',
    max_guests: '2',
    images: '',
    amenities: '',
  });

  useEffect(() => {
    if (!listingId) return;

    const load = async () => {
      try {
        const detail = await listingsApi.get(listingId);
        setListing(detail);
        setForm({
          title: detail.title,
          description: detail.description ?? '',
          location: detail.location ?? '',
          city: detail.city ?? '',
          country: detail.country ?? '',
          price_per_night: String(detail.price_per_night),
          property_type: detail.property_type ?? 'Apartment',
          max_guests: String(detail.max_guests),
          images: (detail.images ?? []).join(', '),
          amenities: (detail.amenities ?? []).join(', '),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load listing');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [listingId]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      await listingsApi.update(
        listingId,
        {
          title: form.title,
          description: form.description,
          location: form.location,
          city: form.city,
          country: form.country,
          price_per_night: Number(form.price_per_night),
          property_type: form.property_type,
          max_guests: Number(form.max_guests),
          images: form.images.split(',').map((item) => item.trim()).filter(Boolean),
          amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
        },
        MOCK_HOST_ID,
      );
      setToast('Listing updated successfully');
      router.push('/host');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <><Navbar /><main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"><LoadingState label="Loading listing..." /></main></>;
  if (error || !listing) return <><Navbar /><main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"><ErrorState message={error ?? 'Listing not found'} /></main></>;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {toast ? <div className="mb-6"><Toast message={toast} type="success" /></div> : null}
        {error ? <div className="mb-6"><ErrorState message={error} /></div> : null}

        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">Host</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Edit listing</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              Title
              <input value={form.title} onChange={(e) => handleChange('title', e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300" required />
            </label>
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              Description
              <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300" required />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Location
              <input value={form.location} onChange={(e) => handleChange('location', e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300" required />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              City
              <input value={form.city} onChange={(e) => handleChange('city', e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300" required />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Country
              <input value={form.country} onChange={(e) => handleChange('country', e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300" required />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Price per night
              <input type="number" value={form.price_per_night} onChange={(e) => handleChange('price_per_night', e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300" required />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Property type
              <select value={form.property_type} onChange={(e) => handleChange('property_type', e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300">
                <option>Apartment</option>
                <option>Villa</option>
                <option>House</option>
                <option>Cabin</option>
                <option>Hotel</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Max guests
              <input type="number" value={form.max_guests} onChange={(e) => handleChange('max_guests', e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300" required />
            </label>
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              Image URLs
              <input value={form.images} onChange={(e) => handleChange('images', e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300" required />
            </label>
            <label className="block text-sm font-medium text-slate-700 md:col-span-2">
              Amenities
              <input value={form.amenities} onChange={(e) => handleChange('amenities', e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-300" required />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => router.push('/host')} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
