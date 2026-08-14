import React from "react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-45 items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        {label}
      </div>
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-45 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>
  );
}

export function Toast({ message, type = "success" }: { message: string; type?: "success" | "error" | "info" }) {
  const tones = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-sky-200 bg-sky-50 text-sky-700",
  };

  return (
    <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${tones[type]}`}>
      {message}
    </div>
  );
}
