'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';

const quickSearches = ['Personal Trainer', 'Pilates', 'CrossFit', 'Yoga', 'Funcional'];

export function FindTeacherSearchPanel() {
  return (
    <div className="w-full max-w-xl">
      <p className="mb-3 text-sm font-medium text-slate-500">
        Encontre educadores compatíveis com o seu perfil
      </p>

      {/* Search bar */}
      <div className="flex items-stretch gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
        <label className="flex min-h-[46px] flex-1 cursor-text items-center gap-3 rounded-lg px-4">
          <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
          <input
            type="text"
            aria-label="Modalidade, objetivo ou especialidade"
            placeholder="Modalidade, objetivo ou especialidade…"
            className="w-full bg-transparent text-left text-sm text-slate-700 placeholder-slate-400 outline-none"
          />
        </label>
        <Link
          href="/descobrir"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.99]"
        >
          Buscar
        </Link>
      </div>

      {/* Quick search chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {quickSearches.map((label) => (
          <Link
            key={label}
            href={`/descobrir?q=${encodeURIComponent(label)}`}
            className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:border-slate-300"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
