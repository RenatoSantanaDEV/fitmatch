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
  SlidersHorizontal,
  Wifi,
  X,
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

const SPECIALTY_CHIPS = [
  { label: 'Personal Trainer', value: 'personal trainer' },
  { label: 'Pilates', value: 'pilates' },
  { label: 'CrossFit', value: 'crossfit' },
  { label: 'Yoga', value: 'yoga' },
  { label: 'Musculação', value: 'musculação' },
  { label: 'Funcional', value: 'funcional' },
  { label: 'Natação', value: 'natação' },
  { label: 'Reabilitação', value: 'reabilitação' },
];

const CARD_GRADIENTS = [
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-orange-500 to-amber-600',
  'from-sky-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-700',
];

export function DiscoverClient() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [radiusKm, setRadiusKm] = useState(50);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geoHint, setGeoHint] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { void loadFavorites(); }, [loadFavorites]);

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
        setGeoHint('Localização aplicada ao raio de busca.');
      },
      () => setGeoHint('Não foi possível obter localização. Informe cidade e UF.'),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 12_000 },
    );
  };

  const runSearch = async (overrideQuery?: string) => {
    setError(null);
    setLoading(true);
    const q = overrideQuery !== undefined ? overrideQuery : query;
    try {
      const res = await fetch('/api/professionals/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          query: q,
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

  const handleChip = (value: string) => {
    setQuery(value);
    void runSearch(value);
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
    } catch { /* ignore */ }
  };

  return (
    <main className="flex flex-1 flex-col bg-slate-50">

      {/* ===== Page header ===== */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-700"
          >
            ← Início
          </Link>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                Busca de professores
              </span>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Encontrar professor
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Use texto livre ou filtros para encontrar o profissional certo para você.
              </p>
            </div>
            <Link
              href="/recomendacoes"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 sm:mt-0"
            >
              <Sparkles className="size-4" aria-hidden />
              Ver ranking por IA
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">

        {/* ===== Search panel ===== */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Main search row */}
          <div className="flex items-stretch gap-3 p-4">
            <div className="relative flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
              <Sparkles className="size-4 shrink-0 text-violet-500" aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void runSearch()}
                placeholder='Ex.: personal trainer funcional perto do centro, pilates online…'
                className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                aria-label="O que procura?"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="shrink-0 text-slate-400 hover:text-slate-600"
                  aria-label="Limpar busca"
                >
                  <X className="size-4" aria-hidden />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${showFilters ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              aria-pressed={showFilters}
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              <span className="hidden sm:inline">Filtros</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => void runSearch()}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Search className="size-4" aria-hidden />
              )}
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </div>

          {/* Specialty chips */}
          <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 pb-3 pt-3">
            {SPECIALTY_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => handleChip(chip.value)}
                className={`rounded-full border px-3.5 py-1 text-xs font-semibold transition ${
                  query === chip.value
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <div className="border-t border-slate-100 p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-semibold text-slate-700">Cidade</span>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex.: São Paulo"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-semibold text-slate-700">Estado (UF)</span>
                  <input
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="SP"
                    maxLength={2}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm uppercase text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-semibold text-slate-700">Raio (km)</span>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value) || 50)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <Navigation className="size-4" aria-hidden />
                  Usar minha localização
                </button>
                {lat != null && lng != null && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    ✓ Localização ativa
                  </span>
                )}
              </div>

              {geoHint && (
                <p className="mt-2 text-xs text-slate-500">{geoHint}</p>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* AI interpretation */}
        {interpreted && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-violet-600" aria-hidden />
            <p className="text-sm text-slate-700">
              <strong className="font-semibold text-violet-800">Interpretação da IA:</strong>{' '}
              {interpreted.summary}
            </p>
          </div>
        )}

        {/* Results count */}
        {total > 0 && (
          <p className="mt-5 text-sm font-medium text-slate-600">
            <strong className="text-slate-900">{total}</strong> profissional{total !== 1 ? 'is' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        )}

        {/* ===== Results grid ===== */}
        <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, idx) => {
            const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
            const isFav = favorites.has(p.id);
            return (
              <li
                key={p.id}
                className="card-lift group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
              >
                {/* Favorite button */}
                <button
                  type="button"
                  onClick={() => void toggleFavorite(p.id)}
                  className={`absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full shadow-sm ring-1 transition ${
                    isFav
                      ? 'bg-rose-500 text-white ring-rose-500/20 hover:bg-rose-600'
                      : 'bg-white/90 text-slate-400 ring-slate-200/80 hover:text-rose-500'
                  }`}
                  aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <Heart
                    className={`size-4 ${isFav ? 'fill-white' : ''}`}
                    strokeWidth={isFav ? 0 : 1.75}
                    aria-hidden
                  />
                </button>

                {/* Card header with gradient */}
                <div className={`bg-gradient-to-br ${gradient} flex items-end gap-3 px-5 pb-4 pt-10`}>
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/20 text-lg font-extrabold text-white backdrop-blur-sm ring-2 ring-white/20">
                    {p.displayName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0 pb-0.5">
                    <p className="truncate font-bold text-white">{p.displayName}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-white/80">
                      <MapPin className="size-3 shrink-0" aria-hidden />
                      {p.location.city}, {p.location.state}
                    </p>
                  </div>
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  {p.bio && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{p.bio}</p>
                  )}

                  {/* Áreas de atuação */}
                  <div className="flex flex-wrap gap-1.5">
                    {p.areas.slice(0, 3).map((a) => (
                      <span
                        key={a.id}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
                      >
                        {a.nome}
                      </span>
                    ))}
                    {p.modalities.slice(0, 2).map((m) => (
                      <span
                        key={m}
                        className="flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700"
                      >
                        <Wifi className="size-2.5" aria-hidden />
                        {formatEnum(m)}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1 text-xs">
                      {p.averageRating != null ? (
                        <>
                          <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
                          <span className="font-semibold text-slate-800">{p.averageRating.toFixed(1)}</span>
                          <span className="text-slate-400">({p.totalReviews})</span>
                        </>
                      ) : (
                        <span className="text-slate-400">Sem avaliações</span>
                      )}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatMoney(p.sessionPrice.min, p.sessionPrice.max, p.sessionPrice.currency)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Empty states */}
        {!loading && items.length === 0 && interpreted === null && (
          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Search className="size-8" aria-hidden />
            </div>
            <div>
              <p className="font-extrabold text-slate-900">Busque seu professor</p>
              <p className="mt-1 max-w-xs text-sm text-slate-500">
                Digite uma especialidade, objetivo ou cidade e clique em <strong>Buscar</strong>.
                Você também pode escolher uma das sugestões acima.
              </p>
            </div>
          </div>
        )}

        {!loading && items.length === 0 && interpreted !== null && (
          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search className="size-8" aria-hidden />
            </div>
            <div>
              <p className="font-extrabold text-slate-900">Nenhum resultado</p>
              <p className="mt-1 max-w-xs text-sm text-slate-500">
                Tente ampliar o raio de busca, mudar a cidade ou usar uma descrição diferente.
              </p>
            </div>
          </div>
        )}

        {/* Link to AI recommendations */}
        <div className="mt-10 rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center">
          <p className="text-sm font-semibold text-violet-900">
            Quer uma lista personalizada?{' '}
            <Link href="/recomendacoes" className="font-bold text-violet-700 underline underline-offset-2 hover:text-violet-900">
              Ver recomendações por IA →
            </Link>
          </p>
          <p className="mt-1 text-xs text-violet-600">
            A IA analisa seu perfil e monta um ranking explicado em português.
          </p>
        </div>
      </div>
    </main>
  );
}
