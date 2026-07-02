'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import type { ProfessionalResponseDTO } from '../../application/dtos/professional/ProfessionalDTO';
import type { InterpretedProfessionalSearch } from '../../lib/interpretProfessionalSearch';
import { modalityRequiresLocation } from './discoverFormatters';
import { augmentQueryWithModalityFilter } from './discoverSearchQuery';
import type { ModalityFilter, SearchLocationOverrides } from './discoverSearchTypes';
import { DiscoverCardSkeleton } from './DiscoverCardSkeleton';
import { DiscoverProfessionalCard } from './DiscoverProfessionalCard';
import { FilterSidebar } from './FilterSidebar';
import { SPECIALTY_CHIP_CONFIGS } from './discoverUiConstants';
import { SmartMatchModal } from '../profissionais/SmartMatchModal';
import { FeaturedProfessionalsCarousel } from '../../components/professional/FeaturedProfessionalsCarousel';

const SKELETON_CARD_COUNT = 5;
const SEARCH_RADIUS_KM = 50;
const SEARCH_PAGE = 1;
const SEARCH_PAGE_SIZE = 24;
const GEOLOCATION_TIMEOUT_MS = 12_000;
const GEOLOCATION_MAXIMUM_AGE_MS = 60_000;

interface DiscoverClientProps {
  defaultCity?: string;
  defaultState?: string;
}

export function DiscoverClient({ defaultCity, defaultState }: DiscoverClientProps) {
  // Search query
  const [query, setQuery] = useState('');
  const [activeSpecialtyValue, setActiveSpecialtyValue] = useState<string | null>(null);

  // Location state
  const [cityInput, setCityInput] = useState(defaultCity ?? '');
  const [stateInput, setStateInput] = useState(defaultState ?? '');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [geoHintMessage, setGeoHintMessage] = useState<string | null>(null);
  const [locationValidationError, setLocationValidationError] = useState<string | null>(null);

  // Modality
  const [modalityFilter, setModalityFilter] = useState<ModalityFilter>(null);

  // Client-side filters
  const [minRating, setMinRating] = useState<number | null>(null);
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  // Mobile drawer
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Search state
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isInitialSearchLoading, setIsInitialSearchLoading] = useState(true);
  const [searchErrorMessage, setSearchErrorMessage] = useState<string | null>(null);
  const [interpretedSearch, setInterpretedSearch] = useState<InterpretedProfessionalSearch | null>(null);
  const [professionals, setProfessionals] = useState<ProfessionalResponseDTO[]>([]);
  const [totalMatchCount, setTotalMatchCount] = useState(0);
  const [favoriteProfessionalIds, setFavoriteProfessionalIds] = useState(() => new Set<string>());
  const [hasCompletedAtLeastOneSearch, setHasCompletedAtLeastOneSearch] = useState(false);

  // Smart match modal
  const [showModal, setShowModal] = useState(false);
  const [smartMatchIds, setSmartMatchIds] = useState<string[]>([]);
  const [searchContext, setSearchContext] = useState('');

  // Featured (boosted) professionals — shown regardless of the current search/filters.
  const [featuredProfessionals, setFeaturedProfessionals] = useState<ProfessionalResponseDTO[]>([]);

  useEffect(() => {
    fetch('/api/professionals/featured?limit=6')
      .then((r) => r.json())
      .then((body: { data?: ProfessionalResponseDTO[] }) => setFeaturedProfessionals(body.data ?? []))
      .catch(() => {});
  }, []);

  const router = useRouter();
  const specialtySearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        specialtySearchInputRef.current?.focus();
        specialtySearchInputRef.current?.select();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Computed: apply client-side filters
  const maxPrice = maxPriceInput.trim() ? parseFloat(maxPriceInput) : null;
  const visibleProfessionals = professionals.filter((p) => {
    if (minRating != null && (p.averageRating ?? 0) < minRating) return false;
    if (maxPrice != null && !isNaN(maxPrice) && p.sessionPrice.min > maxPrice) return false;
    if (acceptingOnly && !p.isAcceptingClients) return false;
    return true;
  });

  function prepareSmartMatch(pros: ProfessionalResponseDTO[], ctx: string) {
    if (pros.length === 0) return;
    setSmartMatchIds(pros.map((p) => p.id).slice(0, 20));
    setSearchContext(ctx);
  }

  const loadFavoriteProfessionalIds = useCallback(async () => {
    try {
      const response = await fetch('/api/favorites');
      const payload = await response.json().catch(() => ({}));
      if (response.ok && Array.isArray(payload.professionalIds)) {
        setFavoriteProfessionalIds(new Set(payload.professionalIds as string[]));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const runProfessionalSearch = useCallback(
    async (
      queryOverride?: string,
      isInitialLoad?: boolean,
      locationOverrides?: SearchLocationOverrides,
      modalityFilterOverride?: ModalityFilter,
      showAll?: boolean,
    ): Promise<ProfessionalResponseDTO[]> => {
      setSearchErrorMessage(null);
      if (!isInitialLoad) setIsSearchLoading(true);

      const effectiveQuery = queryOverride !== undefined ? queryOverride : query;
      const effectiveCity = locationOverrides?.city !== undefined ? locationOverrides.city : cityInput;
      const effectiveState = locationOverrides?.state !== undefined ? locationOverrides.state : stateInput;
      const effectiveLatitude = locationOverrides?.lat !== undefined ? locationOverrides.lat : latitude;
      const effectiveLongitude = locationOverrides?.lng !== undefined ? locationOverrides.lng : longitude;
      const effectiveModalityFilter = modalityFilterOverride !== undefined ? modalityFilterOverride : modalityFilter;

      const requestQuery = augmentQueryWithModalityFilter(effectiveQuery, effectiveModalityFilter);

      try {
        const response = await fetch('/api/professionals/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            query: requestQuery,
            city: effectiveCity.trim() || undefined,
            state: effectiveState.trim().toUpperCase().slice(0, 2) || undefined,
            lat: effectiveLatitude ?? undefined,
            lng: effectiveLongitude ?? undefined,
            radiusKm: SEARCH_RADIUS_KM,
            page: SEARCH_PAGE,
            limit: SEARCH_PAGE_SIZE,
            showAll: showAll ?? false,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          setSearchErrorMessage(typeof payload.error === 'string' ? payload.error : 'Falha na busca.');
          setProfessionals([]);
          setInterpretedSearch(null);
          return [];
        }
        const fetched: ProfessionalResponseDTO[] = Array.isArray(payload.data) ? payload.data : [];
        setInterpretedSearch(payload.interpreted ?? null);
        setProfessionals(fetched);
        setTotalMatchCount(typeof payload.total === 'number' ? payload.total : 0);
        setHasCompletedAtLeastOneSearch(true);
        return fetched;
      } catch {
        setSearchErrorMessage('Sem ligação ao servidor.');
        setProfessionals([]);
        return [];
      } finally {
        setIsSearchLoading(false);
        setIsInitialSearchLoading(false);
      }
    },
    [query, cityInput, stateInput, latitude, longitude, modalityFilter],
  );

  const searchParams = useSearchParams();

  useEffect(() => {
    const initialQuery = searchParams.get('q') ?? '';
    if (initialQuery) {
      setQuery(initialQuery);
      const matchingChip = SPECIALTY_CHIP_CONFIGS.find(
        (c) => c.value.toLowerCase() === initialQuery.toLowerCase(),
      );
      if (matchingChip) setActiveSpecialtyValue(matchingChip.value);
    }
    void (async () => {
      const [fetched] = await Promise.all([
        runProfessionalSearch(initialQuery, true, {
          city: defaultCity ?? '',
          state: defaultState ?? '',
          lat: null,
          lng: null,
        }),
        loadFavoriteProfessionalIds(),
      ]);
      if (fetched.length > 0) {
        const ctx = [initialQuery, defaultCity].filter(Boolean).join(' · ');
        prepareSmartMatch(fetched, ctx);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSpecialtyChipClick(chipValue: string) {
    if (activeSpecialtyValue === chipValue) {
      setActiveSpecialtyValue(null);
      setQuery('');
      void runProfessionalSearch('');
    } else {
      setActiveSpecialtyValue(chipValue);
      setQuery(chipValue);
      void (async () => {
        const fetched = await runProfessionalSearch(chipValue);
        if (fetched.length > 0) prepareSmartMatch(fetched, chipValue);
      })();
    }
  }

  function handleSubmitSearch() {
    setLocationValidationError(null);
    if (modalityRequiresLocation(modalityFilter) && !cityInput.trim() && latitude == null) {
      setLocationValidationError('Informe a cidade ou use a sua localização para buscar aulas presenciais.');
      return;
    }
    void (async () => {
      const fetched = await runProfessionalSearch();
      if (fetched.length > 0) {
        const ctx = [query, modalityFilter ? modalityFilter.replace('_', ' ') : '', cityInput]
          .filter(Boolean)
          .join(' · ');
        prepareSmartMatch(fetched, ctx);
      }
    })();
  }

  function handleUseMyLocation() {
    setGeoHintMessage(null);
    setLocationValidationError(null);
    if (!navigator.geolocation) {
      setGeoHintMessage('Geolocalização não disponível neste navegador.');
      return;
    }
    setIsGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: coordsLat, longitude: coordsLng } = position.coords;
        setLatitude(coordsLat);
        setLongitude(coordsLng);
        setGeoHintMessage('Obtendo cidade...');

        let resolvedCity = cityInput;
        let resolvedState = stateInput;
        try {
          const res = await fetch(`/api/geocode/reverse?lat=${coordsLat}&lng=${coordsLng}`);
          const geo: { city?: string; state?: string } = await res.json().catch(() => ({}));
          if (res.ok && geo.city) {
            resolvedCity = geo.city;
            resolvedState = geo.state ?? resolvedState;
            setCityInput(resolvedCity);
            setStateInput(resolvedState);
          }
        } catch { /* fallback */ }

        setIsGeoLoading(false);
        setGeoHintMessage(
          `${resolvedCity || 'Localização obtida'}${resolvedState ? `, ${resolvedState}` : ''}`,
        );
        void (async () => {
          const fetched = await runProfessionalSearch(undefined, false, {
            city: resolvedCity,
            state: resolvedState,
            lat: coordsLat,
            lng: coordsLng,
          });
          if (fetched.length > 0) {
            prepareSmartMatch(fetched, [query, resolvedCity].filter(Boolean).join(' · '));
          }
        })();
      },
      () => {
        setIsGeoLoading(false);
        setGeoHintMessage('Não foi possível obter a localização. Informe a cidade manualmente.');
      },
      { enableHighAccuracy: false, maximumAge: GEOLOCATION_MAXIMUM_AGE_MS, timeout: GEOLOCATION_TIMEOUT_MS },
    );
  }

  async function toggleFavoriteProfessional(professionalId: string) {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ professionalId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) return;
      setFavoriteProfessionalIds((prev) => {
        const next = new Set(prev);
        if (payload.favorited) next.add(professionalId);
        else next.delete(professionalId);
        return next;
      });
    } catch { /* ignore */ }
  }

  function handleClearFilters() {
    setCityInput('');
    setStateInput('');
    setLatitude(null);
    setLongitude(null);
    setModalityFilter(null);
    setMinRating(null);
    setMaxPriceInput('');
    setAcceptingOnly(false);
    setGeoHintMessage(null);
    setLocationValidationError(null);
  }

  const sharedSidebarProps = {
    cityInput,
    stateInput,
    onCityChange: (v: string) => { setCityInput(v); setLocationValidationError(null); },
    onStateChange: setStateInput,
    isGeoLoading,
    geoHint: geoHintMessage,
    locationError: locationValidationError,
    onUseMyLocation: handleUseMyLocation,
    modalityFilter,
    onModalityChange: (v: ModalityFilter) => {
      setModalityFilter(v);
      setLocationValidationError(null);
      setFilterDrawerOpen(false);
      void (async () => {
        const fetched = await runProfessionalSearch(undefined, false, undefined, v);
        if (fetched.length > 0) {
          const ctx = [query, v ? v.replace('_', ' ') : '', cityInput].filter(Boolean).join(' · ');
          prepareSmartMatch(fetched, ctx);
        }
      })();
    },
    minRating,
    onMinRatingChange: setMinRating,
    maxPrice: maxPriceInput,
    onMaxPriceChange: setMaxPriceInput,
    acceptingOnly,
    onAcceptingOnlyChange: setAcceptingOnly,
    onClear: handleClearFilters,
  };

  const activeFilterCount = [
    modalityFilter !== null,
    minRating !== null,
    maxPriceInput.trim() !== '',
    acceptingOnly,
    cityInput.trim() !== '',
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-slate-50">
      <SmartMatchModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        professionalIds={smartMatchIds}
        professionals={professionals}
        searchContext={searchContext}
      />

      {/* Mobile filter drawer */}
      <FilterSidebar
        {...sharedSidebarProps}
        isDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      />

      {/* Sticky search bar */}
      <div className="sticky top-[57px] z-30 border-b border-slate-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1320px] items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:px-10">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-100">
            <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
            <input
              ref={specialtySearchInputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveSpecialtyValue(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitSearch()}
              placeholder="Especialidade, objetivo ou modalidade…"
              className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              aria-label="Buscar profissionais"
            />
            {query ? (
              <button
                type="button"
                onClick={() => { setQuery(''); setActiveSpecialtyValue(null); }}
                className="shrink-0 text-slate-300 hover:text-slate-500"
                aria-label="Limpar busca"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            ) : (
              <kbd className="hidden select-none items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:flex">
                <span className="text-[11px]">⌘</span>K
              </kbd>
            )}
          </div>

          {/* Mobile: filter button */}
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="relative flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 lg:hidden"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            disabled={isSearchLoading}
            onClick={handleSubmitSearch}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSearchLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Search className="size-4" aria-hidden />
            )}
            <span className="hidden sm:inline">Buscar</span>
          </button>
        </div>
      </div>

      {/* Page content */}
      <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-10">
        <div className="flex gap-7 lg:gap-8">

          {/* Desktop sidebar */}
          <aside className="hidden w-[260px] shrink-0 lg:block">
            <div className="sticky top-[116px]">
              <FilterSidebar {...sharedSidebarProps} />
            </div>
          </aside>

          {/* Results column */}
          <div className="min-w-0 flex-1">

            {/* Featured (boosted) professionals — always visible, independent of search */}
            {featuredProfessionals.length > 0 && (
              <div className="mb-6">
                <FeaturedProfessionalsCarousel professionals={featuredProfessionals} />
              </div>
            )}

            {/* Specialty chips */}
            <div className="mb-4 flex flex-wrap gap-2">
              {SPECIALTY_CHIP_CONFIGS.map((chip) => {
                const ChipIcon = chip.icon;
                const isActive = activeSpecialtyValue === chip.value;
                return (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => handleSpecialtyChipClick(chip.value)}
                    className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-700'
                    }`}
                  >
                    <ChipIcon className="size-3" aria-hidden />
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Results header */}
            {!isInitialSearchLoading && hasCompletedAtLeastOneSearch && totalMatchCount > 0 && (
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {visibleProfessionals.length !== totalMatchCount
                      ? `${visibleProfessionals.length} de ${totalMatchCount} profissional${totalMatchCount !== 1 ? 'is' : ''}`
                      : `${totalMatchCount} profissional${totalMatchCount !== 1 ? 'is' : ''} encontrado${totalMatchCount !== 1 ? 's' : ''}`
                    }
                  </p>
                  {interpretedSearch?.summary && (
                    <p className="mt-0.5 text-xs text-slate-400 italic">{interpretedSearch.summary}</p>
                  )}
                </div>
                {smartMatchIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                  >
                    <Sparkles className="size-3.5" aria-hidden />
                    Melhores para você
                  </button>
                )}
              </div>
            )}

            {/* Error */}
            {searchErrorMessage && (
              <div
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {searchErrorMessage}
              </div>
            )}

            {/* Skeleton */}
            {isInitialSearchLoading && (
              <ul className="flex flex-col gap-4">
                {Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
                  <DiscoverCardSkeleton key={i} />
                ))}
              </ul>
            )}

            {/* Results list */}
            {!isInitialSearchLoading && visibleProfessionals.length > 0 && (
              <ul className="flex flex-col gap-4">
                {visibleProfessionals.map((professional, cardIndex) => (
                  <DiscoverProfessionalCard
                    key={professional.id}
                    professional={professional}
                    cardIndex={cardIndex}
                    isFavorite={favoriteProfessionalIds.has(professional.id)}
                    onToggleFavorite={(id) => void toggleFavoriteProfessional(id)}
                  />
                ))}
              </ul>
            )}

            {/* Empty state */}
            {!isInitialSearchLoading && professionals.length === 0 && hasCompletedAtLeastOneSearch && (
              <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Search className="size-7" aria-hidden />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">Nenhum profissional encontrado</p>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                    {modalityRequiresLocation(modalityFilter)
                      ? 'Tente ampliar a cidade ou mudar a modalidade para Online.'
                      : 'Tente mudar a especialidade ou escolher outra modalidade.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const matchingChip = SPECIALTY_CHIP_CONFIGS.find(
                      (c) => c.value.toLowerCase() === query.trim().toLowerCase(),
                    );
                    if (matchingChip) {
                      const params = new URLSearchParams();
                      if (modalityFilter) params.set('modality', modalityFilter);
                      router.push(`/profissionais/${matchingChip.slug}${params.size > 0 ? `?${params.toString()}` : ''}`);
                    } else {
                      const params = new URLSearchParams();
                      if (query.trim()) params.set('q', query.trim());
                      if (modalityFilter) params.set('modality', modalityFilter);
                      router.push(`/profissionais${params.size > 0 ? `?${params.toString()}` : ''}`);
                    }
                  }}
                  className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Ver todos os profissionais
                </button>
              </div>
            )}

            {/* Filtered empty state (results exist but all filtered out) */}
            {!isInitialSearchLoading && professionals.length > 0 && visibleProfessionals.length === 0 && (
              <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                <p className="text-sm font-semibold text-slate-900">Nenhum resultado com os filtros atuais</p>
                <p className="text-xs text-slate-500">Tente ajustar o preço máximo, a avaliação mínima ou remover o filtro de disponibilidade.</p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
