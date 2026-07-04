'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ProfessionalResponseDTO } from '../../application/dtos/professional/ProfessionalDTO';
import { DiscoverCardSkeleton } from '../descobrir/DiscoverCardSkeleton';
import { DiscoverProfessionalCard } from '../descobrir/DiscoverProfessionalCard';

const SKELETON_CARD_COUNT = 3;

export function FavoritosClient() {
  const [professionals, setProfessionals] = useState<ProfessionalResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/api/favorites/professionals');
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok) {
          setErrorMessage('Não foi possível carregar seus favoritos.');
          return;
        }
        setProfessionals(Array.isArray(payload.data) ? payload.data : []);
      } catch {
        if (!cancelled) setErrorMessage('Não foi possível carregar seus favoritos.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleRemoveFavorite(professionalId: string) {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ professionalId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) return;
      if (!payload.favorited) {
        setProfessionals((prev) => prev.filter((p) => p.id !== professionalId));
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-10">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900">Favoritos</h1>
          <p className="mt-1 text-sm text-slate-500">Profissionais que você salvou para ver depois.</p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {errorMessage}
          </div>
        )}

        {isLoading && (
          <ul className="flex flex-col gap-4">
            {Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
              <DiscoverCardSkeleton key={i} />
            ))}
          </ul>
        )}

        {!isLoading && !errorMessage && professionals.length === 0 && (
          <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Heart className="size-7" aria-hidden />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">Você ainda não tem favoritos</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                Toque no coração de um profissional para salvá-lo aqui e comparar depois.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/descobrir"
                className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Descobrir profissionais
              </Link>
              <Link
                href="/profissionais"
                className="rounded-md border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Ver diretório completo
              </Link>
            </div>
          </div>
        )}

        {!isLoading && professionals.length > 0 && (
          <ul className="flex flex-col gap-4">
            {professionals.map((professional, cardIndex) => (
              <DiscoverProfessionalCard
                key={professional.id}
                professional={professional}
                cardIndex={cardIndex}
                isFavorite
                onToggleFavorite={(id) => void handleRemoveFavorite(id)}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
