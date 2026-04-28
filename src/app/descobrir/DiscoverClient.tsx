'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  Heart,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import type { ProfessionalResponseDTO } from '../../application/dtos/professional/ProfessionalDTO';
import type { InterpretedProfessionalSearch } from '../../lib/interpretProfessionalSearch';

function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

function formatMoney(min: number, max: number, cur: string): string {
  try {
    const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: cur });
    return `${fmt.format(min)} – ${fmt.format(max)}`;
  } catch {
    return `${min} – ${max} ${cur}`;
  }
}

export function DiscoverClient() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [radiusKm, setRadiusKm] = useState(50);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geoHint, setGeoHint] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interpreted, setInterpreted] = useState<InterpretedProfessionalSearch | null>(null);
  const [items, setItems] = useState<ProfessionalResponseDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

  const loadFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/favorites');
      const body = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(body.professionalIds)) {
        setFavorites(new Set(body.professionalIds as string[]));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const useMyLocation = () => {
    setGeoHint(null);
    if (!navigator.geolocation) {
      setGeoHint('Geolocalização não disponível neste navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGeoHint('Localização atual aplicada ao raio de busca.');
      },
      () => setGeoHint('Não foi possível obter a localização. Informe cidade e UF.'),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 12_000 },
    );
  };

  const runSearch = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/professionals/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          query,
          city: city.trim() || undefined,
          state: state.trim().toUpperCase().slice(0, 2) || undefined,
          lat: lat ?? undefined,
          lng: lng ?? undefined,
          radiusKm,
          page: 1,
          limit: 24,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof body.error === 'string' ? body.error : 'Falha na busca.');
        setItems([]);
        setInterpreted(null);
        return;
      }
      setInterpreted(body.interpreted ?? null);
      setItems(Array.isArray(body.data) ? body.data : []);
      setTotal(typeof body.total === 'number' ? body.total : 0);
    } catch {
      setError('Sem ligação ao servidor.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (professionalId: string) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ professionalId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return;
      setFavorites((prev) => {
        const next = new Set(prev);
        if (body.favorited) next.add(professionalId);
        else next.delete(professionalId);
        return next;
      });
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
      <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-800">
        ← Início
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Encontrar professor
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Combine <strong>localização</strong> com uma descrição em linguagem natural. Com{' '}
          <code className="rounded bg-slate-100 px-1 text-sm">AI_API_KEY</code> a interpretação usa IA;
          caso contrário, usamos palavras-chave inteligentes.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5 text-sm lg:col-span-2">
            <span className="font-medium text-slate-800">Cidade</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex.: São Paulo"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-800">UF</span>
            <input
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="SP"
              maxLength={2}
              className="rounded-xl border border-slate-200 px-3 py-2.5 uppercase text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-800">Raio (km)</span>
            <input
              type="number"
              min={5}
              max={200}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value) || 50)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-1.5 text-sm">
          <span className="flex items-center gap-2 font-medium text-slate-800">
            <Sparkles className="size-4 text-blue-600" aria-hidden />
            O que procura? (IA + palavras-chave)
          </span>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            placeholder="Ex.: yoga online barata, personal funcional perto do centro, pilates para iniciante…"
            className="resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={useMyLocation}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <Navigation className="size-4" aria-hidden />
            Usar minha localização
          </button>
          {lat != null && lng != null && (
            <span className="text-xs text-slate-500">
              Lat {lat.toFixed(3)}, Lng {lng.toFixed(3)}
            </span>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() => runSearch()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60 sm:flex-none sm:px-10"
          >
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Search className="size-4" aria-hidden />}
            Buscar
          </button>
        </div>
        {geoHint && <p className="mt-2 text-xs text-slate-500">{geoHint}</p>}
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </section>

      {interpreted && (
        <p className="mt-6 rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-slate-700">
          <strong className="text-blue-800">Interpretação:</strong> {interpreted.summary}
        </p>
      )}

      {total > 0 && (
        <p className="mt-4 text-sm text-slate-600">
          <strong>{total}</strong> profissionais encontrados
        </p>
      )}

      <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <li
            key={p.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <button
              type="button"
              onClick={() => void toggleFavorite(p.id)}
              className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm ring-1 ring-slate-200/80 transition hover:text-red-500"
              aria-label={favorites.has(p.id) ? 'Remover dos favoritos' : 'Favoritar'}
              title={favorites.has(p.id) ? 'Remover dos favoritos' : 'Favoritar'}
            >
              <Heart
                className={`size-5 ${favorites.has(p.id) ? 'fill-red-500 text-red-500' : ''}`}
                strokeWidth={1.75}
                aria-hidden
              />
            </button>

            <div className="flex h-36 items-end bg-gradient-to-br from-slate-700 to-slate-900 px-4 pb-3">
              <div className="flex size-14 items-center justify-center rounded-xl bg-white/15 text-lg font-bold text-white backdrop-blur-sm">
                {p.displayName
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="ml-3 min-w-0 pb-0.5">
                <p className="truncate font-bold text-white">{p.displayName}</p>
                <p className="flex items-center gap-1 truncate text-xs text-white/80">
                  <MapPin className="size-3 shrink-0" aria-hidden />
                  {p.location.city}, {p.location.state}
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
              <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{p.bio}</p>
              <div className="flex flex-wrap gap-1">
                {p.specializations.slice(0, 4).map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                  >
                    {formatEnum(s)}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  {p.averageRating != null ? (
                    <>
                      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
                      <span className="font-semibold text-slate-800">{p.averageRating.toFixed(1)}</span>
                      <span>({p.totalReviews})</span>
                    </>
                  ) : (
                    <span>Sem avaliações</span>
                  )}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {formatMoney(p.sessionPrice.min, p.sessionPrice.max, p.sessionPrice.currency)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {!loading && items.length === 0 && interpreted === null && (
        <p className="mt-10 text-center text-sm text-slate-500">
          Preencha cidade ou use a localização e clique em <strong>Buscar</strong>.
        </p>
      )}

      {!loading && items.length === 0 && interpreted !== null && (
        <p className="mt-10 text-center text-sm text-slate-500">
          Nenhum resultado com estes filtros. Tente ampliar o raio ou mudar a descrição.
        </p>
      )}

      <p className="mt-10 text-center text-sm text-slate-500">
        Já tem ranking por IA?{' '}
        <Link href="/recomendacoes" className="font-semibold text-blue-600 hover:underline">
          Ver as suas recomendações
        </Link>
      </p>
    </main>
  );
}
