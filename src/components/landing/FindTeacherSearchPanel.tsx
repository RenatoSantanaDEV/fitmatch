'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';

const quickSearches = ['Personal Trainer', 'Pilates', 'CrossFit', 'Yoga', 'Funcional'];

export function FindTeacherSearchPanel() {
  return (
    <div className="w-full max-w-xl">
      <p className="mb-3 text-sm font-medium text-slate-300">
        Encontre educadores compatíveis com o seu perfil
      </p>

      {/* Search bar */}
      <div className="flex items-stretch gap-2 rounded-2xl bg-white p-1.5 shadow-xl shadow-slate-900/20 ring-1 ring-white/10">
        <div className="flex min-h-[50px] flex-1 items-center gap-3 rounded-xl px-4">
          <Search className="size-5 shrink-0 text-slate-400" aria-hidden />
          <span className="text-left text-sm text-slate-400">
            Modalidade, objetivo ou especialidade…
          </span>
        </div>
        <Link
          href="/descobrir"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.99]"
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
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
