'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  WifiOff,
  X,
  Dumbbell,
  Waves,
  Wind,
  PersonStanding,
  FlameKindling,
  Activity,
  Zap,
  HeartPulse,
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
    if (min === max) return fmt.format(min);
    return `${fmt.format(min)} – ${fmt.format(max)}`;
  } catch {
    return `${min} – ${max} ${cur}`;
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const SPECIALTY_CHIPS = [
  { label: 'Personal Trainer', value: 'personal trainer', icon: Dumbbell },
  { label: 'Pilates', value: 'pilates', icon: PersonStanding },
  { label: 'CrossFit', value: 'crossfit', icon: FlameKindling },
  { label: 'Yoga', value: 'yoga', icon: Wind },
  { label: 'Musculação', value: 'musculação', icon: Dumbbell },
  { label: 'Funcional', value: 'funcional', icon: Zap },
  { label: 'Natação', value: 'natação', icon: Waves },
  { label: 'Reabilitação', value: 'reabilitação', icon: HeartPulse },
  { label: 'Corrida', value: 'corrida', icon: Activity },
];

const CARD_GRADIENTS = [
  'from-emerald-400 to-teal-600',
  'from-violet-400 to-purple-600',
  'from-orange-400 to-amber-600',
  'from-sky-400 to-blue-600',
  'from-rose-400 to-pink-600',
  'from-indigo-400 to-blue-700',
  'from-green-400 to-emerald-600',
  'from-fuchsia-400 to-violet-600',
];

function CardSkeleton() {
  return (
    <li className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="h-44 animate-pulse bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
    </li>
  );
}

function ProfessionalCard({
  p,
  idx,
  isFav,
  onToggleFav,
}: {
  p: ProfessionalResponseDTO;
  idx: number;
  isFav: boolean;
  onToggleFav: (id: string) => void;
}) {
  const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];
  const initials = getInitials(p.displayName);

  return (
    <li className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
      {/* Card visual header */}
      <div className={`relative bg-gradient-to-br ${gradient} h-44 flex items-end`}>
        {/* Overlay avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-white/20 text-3xl font-extrabold text-white ring-4 ring-white/30 backdrop-blur-sm">
            {initials}
          </div>
        </div>

        {/* Gradient overlay at bottom for text */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-8">
          <p className="truncate font-bold text-white drop-shadow">{p.displayName}</p>
          <p className="flex items-center gap-1 text-xs text-white/80 drop-shadow">
            <MapPin className="size-3 shrink-0" aria-hidden />
            {p.location.city}, {p.location.state}
          </p>
        </div>

        {/* Favorite button */}
        <button
          type="button"
          onClick={() => onToggleFav(p.id)}
          className={`absolute right-3 top-3 flex size-8 items-center justify-center rounded-full shadow transition ${
            isFav
              ? 'bg-rose-500 text-white hover:bg-rose-600'
              : 'bg-white/90 text-slate-400 hover:text-rose-500'
          }`}
          aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            className={`size-4 ${isFav ? 'fill-white' : ''}`}
            strokeWidth={isFav ? 0 : 1.75}
            aria-hidden
          />
        </button>

        {/* Verified badge */}
        {p.isVerified && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            ✓ Verificado
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Bio */}
        {p.bio && (
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{p.bio}</p>
        )}

        {/* Tags: areas + modalities */}
        <div className="flex flex-wrap gap-1.5">
          {p.areas.slice(0, 2).map((a) => (
            <span
              key={a.id}
              className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
            >
              {a.nome}
            </span>
          ))}
          {p.modalities.slice(0, 2).map((m) => (
            <span
              key={m}
              className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
            >
              {m.toLowerCase().includes('online') ? (
                <Wifi className="size-2.5" aria-hidden />
              ) : (
                <WifiOff className="size-2.5" aria-hidden />
              )}
              {formatEnum(m)}
            </span>
          ))}
        </div>

        {/* Footer: rating + price */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1 text-xs">
            {p.averageRating != null ? (
              <>
                <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
                <span className="font-semibold text-slate-800">{p.averageRating.toFixed(1)}</span>
                <span className="text-slate-400">({p.totalReviews})</span>
              </>
            ) : (
              <span className="text-slate-400 text-[11px]">Sem avaliações</span>
            )}
          </span>
          <span className="text-sm font-bold text-slate-900">
            {formatMoney(p.sessionPrice.min, p.sessionPrice.max, p.sessionPrice.currency)}
          </span>
        </div>
      </div>
    </li>
  );
}

export function DiscoverClient() {
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [radiusKm, setRadiusKm] = useState(50);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geoHint, setGeoHint] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interpreted, setInterpreted] = useState<InterpretedProfessionalSearch | null>(null);
  const [items, setItems] = useState<ProfessionalResponseDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const loadFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/favorites');
      const body = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(body.professionalIds)) {
        setFavorites(new Set(body.professionalIds as string[]));
      }
    } catch { /* ignore */ }
  }, []);

  const runSearch = useCallback(async (overrideQuery?: string, isInitial?: boolean) => {
    setError(null);
    if (!isInitial) setLoading(true);
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
      setHasSearched(true);
    } catch {
      setError('Sem ligação ao servidor.');
      setItems([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [query, city, state, lat, lng, radiusKm]);

  // Auto-load all professionals on mount
  useEffect(() => {
    void Promise.all([loadFavorites(), runSearch('', true)]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleChip = (value: string) => {
    if (activeChip === value) {
      // Deselect chip → show all
      setActiveChip(null);
      setQuery('');
      void runSearch('');
    } else {
      setActiveChip(value);
      setQuery(value);
      void runSearch(value);
    }
  };

  const handleSearch = () => {
    setActiveChip(null);
    void runSearch();
  };

  const clearSearch = () => {
    setQuery('');
    setActiveChip(null);
    void runSearch('');
    inputRef.current?.focus();
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

  const showSkeletons = initialLoading;
  const showResults = !initialLoading && (items.length > 0 || hasSearched);

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">

      {/* ===== Hero search section ===== */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-4 py-12 text-center sm:px-6 sm:py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Encontre o professor perfeito
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-emerald-100">
          Busque por especialidade, objetivo ou localização e comece a treinar.
        </p>

        {/* Search bar */}
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="flex overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/20">
            <div className="relative flex flex-1 items-center gap-3 px-4">
              <Sparkles className="size-4 shrink-0 text-violet-500" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Personal trainer, pilates online, yoga em SP…"
                className="flex-1 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                aria-label="O que procura?"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="shrink-0 text-slate-300 hover:text-slate-500"
                  aria-label="Limpar busca"
                >
                  <X className="size-4" aria-hidden />
                </button>
              )}
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleSearch}
              className="flex shrink-0 items-center gap-2 bg-emerald-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Search className="size-4" aria-hidden />
              )}
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </div>
        </div>

        {/* Specialty chips */}
        <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
          {SPECIALTY_CHIPS.map((chip) => {
            const Icon = chip.icon;
            const isActive = activeChip === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => handleChip(chip.value)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'border-white bg-white text-emerald-700 shadow'
                    : 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Icon className="size-3" aria-hidden />
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== Content area ===== */}
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">

        {/* Filters + AI link row */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${showFilters ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}`}
              aria-pressed={showFilters}
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              Filtros
            </button>

            {!initialLoading && total > 0 && (
              <p className="text-sm text-slate-500">
                <strong className="text-slate-900">{total}</strong>{' '}
                profissional{total !== 1 ? 'is' : ''} encontrado{total !== 1 ? 's' : ''}
                {activeChip && (
                  <span className="ml-1.5 text-emerald-600">· {activeChip}</span>
                )}
              </p>
            )}
          </div>

          <Link
            href="/recomendacoes"
            className="flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
          >
            <Sparkles className="size-3.5" aria-hidden />
            Ranking por IA
          </Link>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
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
            {geoHint && <p className="mt-2 text-xs text-slate-500">{geoHint}</p>}
          </div>
        )}

        {/* AI interpretation */}
        {interpreted?.summary && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-violet-600" aria-hidden />
            <p className="text-sm text-slate-700">
              <strong className="font-semibold text-violet-800">Interpretação da IA:</strong>{' '}
              {interpreted.summary}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* ===== Skeletons while loading ===== */}
        {showSkeletons && (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </ul>
        )}

        {/* ===== Results grid ===== */}
        {!showSkeletons && items.length > 0 && (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, idx) => (
              <ProfessionalCard
                key={p.id}
                p={p}
                idx={idx}
                isFav={favorites.has(p.id)}
                onToggleFav={(id) => void toggleFavorite(id)}
              />
            ))}
          </ul>
        )}

        {/* ===== Empty state ===== */}
        {!showSkeletons && items.length === 0 && hasSearched && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search className="size-8" aria-hidden />
            </div>
            <div>
              <p className="font-extrabold text-slate-900">Nenhum resultado</p>
              <p className="mt-1 max-w-xs text-sm text-slate-500">
                Tente ampliar o raio de busca, mudar a cidade ou usar uma descrição diferente.
              </p>
            </div>
            <button
              type="button"
              onClick={clearSearch}
              className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Ver todos os professores
            </button>
          </div>
        )}

        {/* ===== AI recommendation CTA ===== */}
        {!showSkeletons && (
          <div className="mt-10 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 p-6 text-center">
            <Sparkles className="mx-auto mb-2 size-6 text-violet-500" aria-hidden />
            <p className="font-bold text-violet-900">Quer uma lista personalizada para você?</p>
            <p className="mt-1 text-sm text-violet-600">
              A IA analisa seu perfil e monta um ranking explicado em português.
            </p>
            <Link
              href="/recomendacoes"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              <Sparkles className="size-4" aria-hidden />
              Ver recomendações por IA
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
