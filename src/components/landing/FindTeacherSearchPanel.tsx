'use client';

import Link from 'next/link';
import { MapPin, Search } from 'lucide-react';

export function FindTeacherSearchPanel() {
  return (
    <div className="w-full max-w-xl">
      <p className="mb-3 text-sm font-medium text-blue-100/90">
        Encontre educadores compatíveis com o seu perfil
      </p>
      <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-blue-950/20 ring-1 ring-white/10 sm:flex-row sm:items-stretch">
        <div className="flex min-h-[52px] flex-1 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/90 px-4 py-3">
          <MapPin className="size-5 shrink-0 text-slate-400" aria-hidden />
          <span className="text-left text-sm text-slate-500">
            Modalidade, objetivo ou cidade — refinamos na próxima etapa
          </span>
        </div>
        <Link
          href="/descobrir"
          className="inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.99] sm:px-8"
        >
          <Search className="size-4 opacity-90" aria-hidden />
          Encontrar professor
        </Link>
      </div>
      <p className="mt-3 text-xs text-blue-200/80">
        Ajuste cidade ou use a localização; a busca interpreta o texto com IA quando configurada.
      </p>
    </div>
  );
}
