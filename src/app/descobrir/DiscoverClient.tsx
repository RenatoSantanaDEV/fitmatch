'use client';

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
  Wifi,
  Monitor,
  Users,
  X,
  ChevronDown,
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

type ModalityFilter = 'ONLINE' | 'IN_PERSON' | 'HYBRID' | null;

const MODALITY_OPTIONS: { value: ModalityFilter; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'ONLINE',    label: 'Online',     icon: Wifi,     desc: 'Aulas por videochamada, de qualquer lugar' },
  { value: 'IN_PERSON', label: 'Presencial', icon: Users,    desc: 'Aulas na sua cidade, com localização' },
  { value: 'HYBRID',    label: 'Híbrido',    icon: Monitor,  desc: 'Online e presencial combinados' },
];

function needsLocation(m: ModalityFilter) {
  return m === 'IN_PERSON' || m === 'HYBRID';
}

const SPECIALTY_CHIPS = [
  { label: 'Personal Trainer', value: 'personal trainer', icon: Dumbbell },
  { label: 'Pilates',          value: 'pilates',          icon: PersonStanding },
  { label: 'CrossFit',         value: 'crossfit',         icon: FlameKindling },
  { label: 'Yoga',             value: 'yoga',             icon: Wind },
  { label: 'Musculação',       value: 'musculação',       icon: Dumbbell },
  { label: 'Funcional',        value: 'funcional',        icon: Zap },
  { label: 'Natação',          value: 'natação',          icon: Waves },
  { label: 'Reabilitação',     value: 'reabilitação',     icon: HeartPulse },
  { label: 'Corrida',          value: 'corrida',          icon: Activity },
];

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
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

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
    <li className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="size-24 shrink-0 animate-pulse rounded-xl bg-slate-200 sm:size-32" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
        <div className="mt-auto flex gap-2">
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

  const modalityLabel = p.modalities.length > 0
    ? p.modalities.map((m) => {
        if (m === 'ONLINE') return 'Online';
        if (m === 'IN_PERSON') return 'Presencial';
        return 'Híbrido';
      }).join(' · ')
    : null;

  return (
    <li className="group flex cursor-pointer gap-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
      {/* Photo */}
      <div className={`relative shrink-0 bg-gradient-to-br ${gradient} w-28 sm:w-36`}>
        <div className="absolute inset-0 flex items-center justify-center">
          {p.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/profile/avatar/${p.userId}`}
              alt={p.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl font-extrabold text-white/90">{initials}</span>
          )}
        </div>
        {p.isVerified && (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white shadow">
            ✓ Verificado
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-slate-900 leading-tight">{p.displayName}</p>
            <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <MapPin className="size-3 shrink-0" aria-hidden />
              {p.location.city}, {p.location.state}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onToggleFav(p.id)}
            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border transition ${
              isFav
                ? 'border-rose-200 bg-rose-50 text-rose-500'
                : 'border-slate-200 bg-white text-slate-300 hover:border-rose-200 hover:text-rose-400'
            }`}
            aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart className={`size-3.5 ${isFav ? 'fill-rose-500' : ''}`} strokeWidth={isFav ? 0 : 1.75} aria-hidden />
          </button>
        </div>

        {/* Rating + modality */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {p.averageRating != null ? (
            <span className="flex items-center gap-1 font-semibold text-amber-500">
              <Star className="size-3 fill-amber-400" aria-hidden />
              {p.averageRating.toFixed(1)}
              <span className="font-normal text-slate-400">({p.totalReviews})</span>
            </span>
          ) : (
            <span className="text-slate-400">Sem avaliações</span>
          )}
          {modalityLabel && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
              {modalityLabel}
            </span>
          )}
        </div>

        {/* Areas */}
        {p.areas.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {p.areas.slice(0, 3).map((a) => (
              <span key={a.id} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                {a.nome}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {p.bio && (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{p.bio}</p>
        )}

        {/* Price */}
        <p className="mt-auto text-sm font-bold text-slate-900">
          {formatMoney(p.sessionPrice.min, p.sessionPrice.max, p.sessionPrice.currency)}
          <span className="ml-1 text-xs font-normal text-slate-400">/sessão</span>
        </p>
      </div>
    </li>
  );
}

export function DiscoverClient() {
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [modality, setModality] = useState<ModalityFilter>(null);
  const [showModalityMenu, setShowModalityMenu] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoHint, setGeoHint] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interpreted, setInterpreted] = useState<InterpretedProfessionalSearch | null>(null);
  const [items, setItems] = useState<ProfessionalResponseDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalityMenuRef = useRef<HTMLDivElement>(null);

  // Close modality menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modalityMenuRef.current && !modalityMenuRef.current.contains(e.target as Node)) {
        setShowModalityMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/favorites');
      const body = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(body.professionalIds)) {
        setFavorites(new Set(body.professionalIds as string[]));
      }
    } catch { /* ignore */ }
  }, []);

  const runSearch = useCallback(async (
    overrideQuery?: string,
    isInitial?: boolean,
    overrideLocation?: { city?: string; state?: string; lat?: number | null; lng?: number | null },
    overrideModality?: ModalityFilter,
  ) => {
    setError(null);
    if (!isInitial) setLoading(true);
    const q = overrideQuery !== undefined ? overrideQuery : query;
    const effectiveCity = overrideLocation?.city !== undefined ? overrideLocation.city : city;
    const effectiveState = overrideLocation?.state !== undefined ? overrideLocation.state : state;
    const effectiveLat = overrideLocation?.lat !== undefined ? overrideLocation.lat : lat;
    const effectiveLng = overrideLocation?.lng !== undefined ? overrideLocation.lng : lng;
    const effectiveModality = overrideModality !== undefined ? overrideModality : modality;

    // Build query string: append modality keyword so AI/search understands it
    let searchQuery = q;
    if (effectiveModality === 'ONLINE') searchQuery = `${q} online`.trim();
    else if (effectiveModality === 'IN_PERSON') searchQuery = `${q} presencial`.trim();
    else if (effectiveModality === 'HYBRID') searchQuery = `${q} híbrido`.trim();

    try {
      const res = await fetch('/api/professionals/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          query: searchQuery,
          city: effectiveCity.trim() || undefined,
          state: effectiveState.trim().toUpperCase().slice(0, 2) || undefined,
          lat: effectiveLat ?? undefined,
          lng: effectiveLng ?? undefined,
          radiusKm: 50,
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
  }, [query, city, state, lat, lng, modality]);

  useEffect(() => {
    void Promise.all([loadFavorites(), runSearch('', true)]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChip = (value: string) => {
    if (activeChip === value) {
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
    setLocationError(null);
    if (needsLocation(modality) && !city.trim() && lat == null) {
      setLocationError('Informe a cidade ou use a sua localização para buscar aulas presenciais.');
      return;
    }
    void runSearch();
  };

  const useMyLocation = () => {
    setGeoHint(null);
    setLocationError(null);
    if (!navigator.geolocation) {
      setGeoHint('Geolocalização não disponível neste navegador.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        setGeoHint('Obtendo cidade...');

        let geoCity = city;
        let geoState = state;
        try {
          const res = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`);
          const data: { city?: string; state?: string } = await res.json().catch(() => ({}));
          if (res.ok && data.city) {
            geoCity = data.city;
            geoState = data.state ?? geoState;
            setCity(geoCity);
            setState(geoState);
          }
        } catch { /* fallback */ }

        setGeoLoading(false);
        setGeoHint(`${geoCity || 'Localização obtida'}${geoState ? `, ${geoState}` : ''}`);
        void runSearch(undefined, false, { city: geoCity, state: geoState, lat: latitude, lng: longitude });
      },
      () => {
        setGeoLoading(false);
        setGeoHint('Não foi possível obter a localização. Informe a cidade manualmente.');
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 12_000 },
    );
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

  const selectedModality = MODALITY_OPTIONS.find((o) => o.value === modality);
  const showLocation = needsLocation(modality);

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">

      {/* ── Hero / Search ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-4 py-14 text-center sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Encontre o professor perfeito
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-emerald-100">
          Escolha a modalidade, informe sua especialidade e comece agora.
        </p>

        {/* Main search bar */}
        <div className="mx-auto mt-8 max-w-2xl">
          {/* overflow-visible so the modality dropdown is not clipped */}
          <div className="flex rounded-2xl bg-white shadow-xl shadow-black/20">
            {/* Specialty input */}
            <div className="relative flex flex-1 items-center gap-3 rounded-l-2xl border-r border-slate-100 px-4">
              <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveChip(null); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ex.: Personal trainer, pilates, yoga…"
                className="flex-1 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                aria-label="Especialidade"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setActiveChip(null); }} className="shrink-0 text-slate-300 hover:text-slate-500">
                  <X className="size-4" aria-hidden />
                </button>
              )}
            </div>

            {/* Modality picker */}
            <div className="relative" ref={modalityMenuRef}>
              <button
                type="button"
                onClick={() => setShowModalityMenu((v) => !v)}
                className="flex h-full items-center gap-2 border-r border-slate-100 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                aria-haspopup="listbox"
                aria-expanded={showModalityMenu}
              >
                {selectedModality ? (
                  <>
                    <selectedModality.icon className="size-4 shrink-0 text-emerald-600" aria-hidden />
                    <span className="hidden sm:inline">{selectedModality.label}</span>
                  </>
                ) : (
                  <>
                    <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden />
                    <span className="hidden sm:inline text-slate-400">Tipo de aula</span>
                  </>
                )}
                <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${showModalityMenu ? 'rotate-180' : ''}`} aria-hidden />
              </button>

              {showModalityMenu && (
                <div className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
                  {/* Clear option */}
                  {modality && (
                    <button
                      type="button"
                      onClick={() => { setModality(null); setShowModalityMenu(false); }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-slate-400 hover:bg-slate-50"
                    >
                      <X className="size-3.5" aria-hidden />
                      Qualquer modalidade
                    </button>
                  )}
                  {MODALITY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={modality === opt.value}
                        onClick={() => { setModality(opt.value); setShowModalityMenu(false); setLocationError(null); }}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${modality === opt.value ? 'bg-emerald-50' : ''}`}
                      >
                        <Icon className={`mt-0.5 size-4 shrink-0 ${modality === opt.value ? 'text-emerald-600' : 'text-slate-400'}`} aria-hidden />
                        <div>
                          <p className={`text-sm font-semibold ${modality === opt.value ? 'text-emerald-700' : 'text-slate-700'}`}>{opt.label}</p>
                          <p className="text-[11px] text-slate-400">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Search button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleSearch}
              className="flex shrink-0 items-center gap-2 rounded-r-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Search className="size-4" aria-hidden />}
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </div>

          {/* Location row — only for presencial/híbrido */}
          {showLocation && (
            <div className="mt-3 overflow-hidden rounded-2xl bg-white/95 px-4 py-3 shadow-lg shadow-black/10">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
                  <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden />
                  <input
                    value={city}
                    onChange={(e) => { setCity(e.target.value); setLocationError(null); }}
                    placeholder="Cidade"
                    className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <input
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="UF"
                    maxLength={2}
                    className="w-10 bg-transparent text-center text-sm uppercase text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={geoLoading}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  {geoLoading
                    ? <Loader2 className="size-4 animate-spin text-emerald-600" aria-hidden />
                    : <Navigation className="size-4 text-emerald-600" aria-hidden />
                  }
                  {geoLoading ? 'Localizando…' : 'Usar minha localização'}
                </button>
              </div>
              {locationError && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <X className="size-3.5" aria-hidden /> {locationError}
                </p>
              )}
              {geoHint && !locationError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600">
                  <Navigation className="size-3" aria-hidden /> {geoHint}
                </p>
              )}
            </div>
          )}

          {/* Specialty chips */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
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
      </div>

      {/* ── Results ───────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">

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
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {/* Results header */}
        {!initialLoading && hasSearched && total > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              <strong className="text-slate-900">{total}</strong>{' '}
              professor{total !== 1 ? 'es' : ''} encontrado{total !== 1 ? 's' : ''}
              {modality && selectedModality && (
                <span className="ml-1.5 inline-flex items-center gap-1 text-emerald-600 font-medium">
                  · <selectedModality.icon className="size-3.5" aria-hidden />{selectedModality.label}
                </span>
              )}
            </p>
            <Link
              href="/recomendacoes"
              className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              <Sparkles className="size-3.5" aria-hidden />
              Ranking por IA
            </Link>
          </div>
        )}

        {/* Skeletons */}
        {initialLoading && (
          <ul className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
          </ul>
        )}

        {/* Cards */}
        {!initialLoading && items.length > 0 && (
          <ul className="flex flex-col gap-3">
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

        {/* Empty state */}
        {!initialLoading && items.length === 0 && hasSearched && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search className="size-8" aria-hidden />
            </div>
            <div>
              <p className="font-extrabold text-slate-900">Nenhum professor encontrado</p>
              <p className="mt-1 max-w-xs text-sm text-slate-500">
                {showLocation
                  ? 'Tente ampliar a cidade ou mudar a modalidade para Online.'
                  : 'Tente mudar a especialidade ou escolher outra modalidade.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setQuery(''); setModality(null); setCity(''); setState(''); void runSearch('', false, { city: '', state: '', lat: null, lng: null }, null); }}
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Ver todos os professores
            </button>
          </div>
        )}

        {/* AI upsell */}
        {!initialLoading && (
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
