'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Activity,
  ChevronDown,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import type { ProfessionalResponseDTO } from '../../application/dtos/professional/ProfessionalDTO';
import type { InterpretedProfessionalSearch } from '../../lib/interpretProfessionalSearch';
import { modalityRequiresLocation } from './discoverFormatters';
import { augmentQueryWithModalityFilter } from './discoverSearchQuery';
import type { ModalityFilter, SearchLocationOverrides } from './discoverSearchTypes';
import { DiscoverCardSkeleton } from './DiscoverCardSkeleton';
import { DiscoverProfessionalCard } from './DiscoverProfessionalCard';
import { MODALITY_MENU_OPTIONS, SPECIALTY_CHIP_CONFIGS } from './discoverUiConstants';
import { SmartMatchModal } from '../profissionais/SmartMatchModal';

const SKELETON_CARD_COUNT = 6;
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
  const [query, setQuery] = useState('');
  const [activeSpecialtyValue, setActiveSpecialtyValue] = useState<string | null>(
    null,
  );
  const [modalityFilter, setModalityFilter] = useState<ModalityFilter>(null);
  const [isModalityMenuOpen, setIsModalityMenuOpen] = useState(false);

  const [cityInput, setCityInput] = useState(defaultCity ?? '');
  const [stateInput, setStateInput] = useState(defaultState ?? '');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [geoHintMessage, setGeoHintMessage] = useState<string | null>(null);
  const [locationValidationError, setLocationValidationError] = useState<
    string | null
  >(null);

  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isInitialSearchLoading, setIsInitialSearchLoading] = useState(true);
  const [searchErrorMessage, setSearchErrorMessage] = useState<string | null>(
    null,
  );
  const [interpretedSearch, setInterpretedSearch] =
    useState<InterpretedProfessionalSearch | null>(null);
  const [professionals, setProfessionals] = useState<ProfessionalResponseDTO[]>(
    [],
  );
  const [totalMatchCount, setTotalMatchCount] = useState(0);
  const [favoriteProfessionalIds, setFavoriteProfessionalIds] = useState(
    () => new Set<string>(),
  );
  const [hasCompletedAtLeastOneSearch, setHasCompletedAtLeastOneSearch] =
    useState(false);

  // Smart match modal
  const [showModal, setShowModal] = useState(false);
  const [smartMatchIds, setSmartMatchIds] = useState<string[]>([]);
  const [searchContext, setSearchContext] = useState('');

  const router = useRouter();
  const specialtySearchInputRef = useRef<HTMLInputElement>(null);
  const modalityMenuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleDocumentMouseDown(event: MouseEvent) {
      if (
        modalityMenuContainerRef.current &&
        !modalityMenuContainerRef.current.contains(event.target as Node)
      ) {
        setIsModalityMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () =>
      document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, []);

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
        setFavoriteProfessionalIds(
          new Set(payload.professionalIds as string[]),
        );
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

      const effectiveQuery =
        queryOverride !== undefined ? queryOverride : query;
      const effectiveCity =
        locationOverrides?.city !== undefined
          ? locationOverrides.city
          : cityInput;
      const effectiveState =
        locationOverrides?.state !== undefined
          ? locationOverrides.state
          : stateInput;
      const effectiveLatitude =
        locationOverrides?.lat !== undefined
          ? locationOverrides.lat
          : latitude;
      const effectiveLongitude =
        locationOverrides?.lng !== undefined
          ? locationOverrides.lng
          : longitude;
      const effectiveModalityFilter =
        modalityFilterOverride !== undefined
          ? modalityFilterOverride
          : modalityFilter;

      const requestQuery = augmentQueryWithModalityFilter(
        effectiveQuery,
        effectiveModalityFilter,
      );

      try {
        const response = await fetch('/api/professionals/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            query: requestQuery,
            city: effectiveCity.trim() || undefined,
            state:
              effectiveState.trim().toUpperCase().slice(0, 2) || undefined,
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
          setSearchErrorMessage(
            typeof payload.error === 'string'
              ? payload.error
              : 'Falha na busca.',
          );
          setProfessionals([]);
          setInterpretedSearch(null);
          return [];
        }
        const fetched: ProfessionalResponseDTO[] = Array.isArray(payload.data) ? payload.data : [];
        setInterpretedSearch(payload.interpreted ?? null);
        setProfessionals(fetched);
        setTotalMatchCount(
          typeof payload.total === 'number' ? payload.total : 0,
        );
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
    if (
      modalityRequiresLocation(modalityFilter) &&
      !cityInput.trim() &&
      latitude == null
    ) {
      setLocationValidationError(
        'Informe a cidade ou use a sua localização para buscar aulas presenciais.',
      );
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
        const { latitude: coordsLatitude, longitude: coordsLongitude } =
          position.coords;
        setLatitude(coordsLatitude);
        setLongitude(coordsLongitude);
        setGeoHintMessage('Obtendo cidade...');

        let resolvedCity = cityInput;
        let resolvedState = stateInput;
        try {
          const reverseGeocodeResponse = await fetch(
            `/api/geocode/reverse?lat=${coordsLatitude}&lng=${coordsLongitude}`,
          );
          const geocodePayload: { city?: string; state?: string } =
            await reverseGeocodeResponse.json().catch(() => ({}));
          if (reverseGeocodeResponse.ok && geocodePayload.city) {
            resolvedCity = geocodePayload.city;
            resolvedState = geocodePayload.state ?? resolvedState;
            setCityInput(resolvedCity);
            setStateInput(resolvedState);
          }
        } catch {
          /* fallback: keep previous city/state */
        }

        setIsGeoLoading(false);
        setGeoHintMessage(
          `${resolvedCity || 'Localização obtida'}${
            resolvedState ? `, ${resolvedState}` : ''
          }`,
        );
        void (async () => {
          const fetched = await runProfessionalSearch(undefined, false, {
            city: resolvedCity,
            state: resolvedState,
            lat: coordsLatitude,
            lng: coordsLongitude,
          });
          if (fetched.length > 0) {
            const ctx = [query, resolvedCity].filter(Boolean).join(' · ');
            prepareSmartMatch(fetched, ctx);
          }
        })();
      },
      () => {
        setIsGeoLoading(false);
        setGeoHintMessage(
          'Não foi possível obter a localização. Informe a cidade manualmente.',
        );
      },
      {
        enableHighAccuracy: false,
        maximumAge: GEOLOCATION_MAXIMUM_AGE_MS,
        timeout: GEOLOCATION_TIMEOUT_MS,
      },
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
      setFavoriteProfessionalIds((previousIds) => {
        const nextIds = new Set(previousIds);
        if (payload.favorited) nextIds.add(professionalId);
        else nextIds.delete(professionalId);
        return nextIds;
      });
    } catch {
      /* ignore */
    }
  }

  const selectedModalityOption = MODALITY_MENU_OPTIONS.find(
    (option) => option.value === modalityFilter,
  );
  const shouldShowLocationFields = modalityRequiresLocation(modalityFilter);

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <SmartMatchModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        professionalIds={smartMatchIds}
        professionals={professionals}
        searchContext={searchContext}
      />
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900 px-4 pb-14 pt-16 text-center sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/5 blur-3xl" />
        </div>

        <div className="relative">
          <h1 className="animate-fade-up delay-100 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Encontre o profissional ideal
            <br />
            <span className="text-gradient-brand">
              para transformar sua saúde
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg animate-fade-up delay-200 text-base text-slate-300 sm:text-lg">
            Personal trainers, yoga, pilates, corrida, funcional e muito mais.
            Conecte-se com os melhores profissionais do Brasil.
          </p>

          <div className="mx-auto mt-8 max-w-2xl animate-fade-up delay-300">
            <div className="flex rounded-2xl bg-white shadow-2xl shadow-black/30">
              <div className="relative flex flex-1 items-center gap-3 rounded-l-2xl border-r border-slate-100 px-4">
                <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
                <input
                  ref={specialtySearchInputRef}
                  value={query}
                  onChange={(inputEvent) => {
                    setQuery(inputEvent.target.value);
                    setActiveSpecialtyValue(null);
                  }}
                  onKeyDown={(keyboardEvent) =>
                    keyboardEvent.key === 'Enter' && handleSubmitSearch()
                  }
                  placeholder="Ex.: Personal trainer, pilates, yoga…"
                  className="flex-1 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  aria-label="Especialidade"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setActiveSpecialtyValue(null);
                    }}
                    className="shrink-0 text-slate-300 hover:text-slate-500"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                ) : null}
              </div>

              <div className="relative" ref={modalityMenuContainerRef}>
                <button
                  type="button"
                  onClick={() =>
                    setIsModalityMenuOpen((wasOpen) => !wasOpen)
                  }
                  className="flex h-full items-center gap-2 border-r border-slate-100 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  aria-haspopup="listbox"
                  aria-expanded={isModalityMenuOpen}
                >
                  {selectedModalityOption ? (
                    <>
                      <selectedModalityOption.icon
                        className="size-4 shrink-0 text-emerald-600"
                        aria-hidden
                      />
                      <span className="hidden sm:inline">
                        {selectedModalityOption.label}
                      </span>
                    </>
                  ) : (
                    <>
                      <MapPin
                        className="size-4 shrink-0 text-slate-400"
                        aria-hidden
                      />
                      <span className="hidden text-slate-400 sm:inline">
                        Tipo de aula
                      </span>
                    </>
                  )}
                  <ChevronDown
                    className={`size-3.5 text-slate-400 transition-transform ${
                      isModalityMenuOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden
                  />
                </button>

                {isModalityMenuOpen ? (
                  <div className="header-dropdown-panel absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
                    {modalityFilter ? (
                      <button
                        type="button"
                        onClick={() => {
                          setModalityFilter(null);
                          setIsModalityMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-slate-400 hover:bg-slate-50"
                      >
                        <X className="size-3.5" aria-hidden />
                        Qualquer modalidade
                      </button>
                    ) : null}
                    {MODALITY_MENU_OPTIONS.map((modalityOption) => {
                      const ModalityIcon = modalityOption.icon;
                      const isOptionSelected =
                        modalityFilter === modalityOption.value;
                      return (
                        <button
                          key={modalityOption.value}
                          type="button"
                          role="option"
                          aria-selected={isOptionSelected}
                          onClick={() => {
                            setModalityFilter(modalityOption.value);
                            setIsModalityMenuOpen(false);
                            setLocationValidationError(null);
                          }}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                            isOptionSelected ? 'bg-emerald-50' : ''
                          }`}
                        >
                          <ModalityIcon
                            className={`mt-0.5 size-4 shrink-0 ${
                              isOptionSelected
                                ? 'text-emerald-600'
                                : 'text-slate-400'
                            }`}
                            aria-hidden
                          />
                          <div>
                            <p
                              className={`text-sm font-semibold ${
                                isOptionSelected
                                  ? 'text-emerald-700'
                                  : 'text-slate-700'
                              }`}
                            >
                              {modalityOption.label}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {modalityOption.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                disabled={isSearchLoading}
                onClick={handleSubmitSearch}
                className="flex shrink-0 items-center gap-2 rounded-r-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSearchLoading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Search className="size-4" aria-hidden />
                )}
                <span className="hidden sm:inline">Buscar</span>
              </button>
            </div>

            {shouldShowLocationFields ? (
              <div className="mt-3 overflow-hidden rounded-2xl bg-white/95 px-4 py-3 shadow-lg shadow-black/10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
                    <MapPin
                      className="size-4 shrink-0 text-slate-400"
                      aria-hidden
                    />
                    <input
                      value={cityInput}
                      onChange={(inputEvent) => {
                        setCityInput(inputEvent.target.value);
                        setLocationValidationError(null);
                      }}
                      placeholder="Cidade"
                      className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <input
                      value={stateInput}
                      onChange={(inputEvent) =>
                        setStateInput(
                          inputEvent.target.value.toUpperCase().slice(0, 2),
                        )
                      }
                      placeholder="UF"
                      maxLength={2}
                      className="w-10 bg-transparent text-center text-sm uppercase text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={isGeoLoading}
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    {isGeoLoading ? (
                      <Loader2
                        className="size-4 animate-spin text-emerald-600"
                        aria-hidden
                      />
                    ) : (
                      <Navigation
                        className="size-4 text-emerald-600"
                        aria-hidden
                      />
                    )}
                    {isGeoLoading ? 'Localizando…' : 'Usar minha localização'}
                  </button>
                </div>
                {locationValidationError ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <X className="size-3.5" aria-hidden />{' '}
                    {locationValidationError}
                  </p>
                ) : null}
                {geoHintMessage && !locationValidationError ? (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600">
                    <Navigation className="size-3" aria-hidden />{' '}
                    {geoHintMessage}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SPECIALTY_CHIP_CONFIGS.map((chipConfig) => {
                const ChipIcon = chipConfig.icon;
                const isChipActive = activeSpecialtyValue === chipConfig.value;
                return (
                  <button
                    key={chipConfig.value}
                    type="button"
                    onClick={() => handleSpecialtyChipClick(chipConfig.value)}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                      isChipActive
                        ? 'border-white bg-white text-emerald-700 shadow'
                        : 'border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20'
                    }`}
                  >
                    <ChipIcon className="size-3" aria-hidden />
                    {chipConfig.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-auto mt-10 flex max-w-lg flex-wrap items-center justify-center gap-x-8 gap-y-3 animate-fade-up delay-400">
            <div className="flex items-center gap-2 text-white/80">
              <Users className="size-4 text-emerald-400" aria-hidden />
              <span className="text-sm">
                <strong className="font-bold text-white">50+</strong>{' '}
                profissionais
              </span>
            </div>
            <div className="hidden h-3 w-px bg-white/20 sm:block" aria-hidden />
            <div className="flex items-center gap-2 text-white/80">
              <Activity className="size-4 text-emerald-400" aria-hidden />
              <span className="text-sm">
                <strong className="font-bold text-white">12</strong> modalidades
              </span>
            </div>
            <div className="hidden h-3 w-px bg-white/20 sm:block" aria-hidden />
            <div className="flex items-center gap-2 text-white/80">
              <Star
                className="size-4 fill-amber-400 text-amber-400"
                aria-hidden
              />
              <span className="text-sm">
                <strong className="font-bold text-white">4.9</strong> avaliação
                média
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {interpretedSearch?.summary ? (
          <p className="mb-5 text-sm italic text-slate-500">
            {interpretedSearch.summary}
          </p>
        ) : null}

        {searchErrorMessage ? (
          <div
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
            role="alert"
          >
            {searchErrorMessage}
          </div>
        ) : null}

        {!isInitialSearchLoading &&
        hasCompletedAtLeastOneSearch &&
        totalMatchCount > 0 ? (
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-slate-900">
                {totalMatchCount} profissional
                {totalMatchCount !== 1 ? 'is' : ''} encontrado
                {totalMatchCount !== 1 ? 's' : ''}
              </p>
              {modalityFilter && selectedModalityOption ? (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  <selectedModalityOption.icon
                    className="size-3.5"
                    aria-hidden
                  />
                  {selectedModalityOption.label}
                </p>
              ) : null}
            </div>
            {smartMatchIds.length > 0 && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                <Sparkles className="size-3.5" aria-hidden />
                Melhores para você
              </button>
            )}
          </div>
        ) : null}

        {isInitialSearchLoading ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_CARD_COUNT }).map(
              (_, skeletonIndex) => (
                <DiscoverCardSkeleton key={skeletonIndex} />
              ),
            )}
          </ul>
        ) : null}

        {!isInitialSearchLoading && professionals.length > 0 ? (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.slice(0, 6).map((professional, cardIndex) => (
              <DiscoverProfessionalCard
                key={professional.id}
                professional={professional}
                cardIndex={cardIndex}
                isFavorite={favoriteProfessionalIds.has(professional.id)}
                onToggleFavorite={(professionalId) =>
                  void toggleFavoriteProfessional(professionalId)
                }
              />
            ))}


            {professionals.slice(6).map((professional, cardIndex) => (
              <DiscoverProfessionalCard
                key={professional.id}
                professional={professional}
                cardIndex={cardIndex + 6}
                isFavorite={favoriteProfessionalIds.has(professional.id)}
                onToggleFavorite={(professionalId) =>
                  void toggleFavoriteProfessional(professionalId)
                }
              />
            ))}
          </ul>
        ) : null}

        {!isInitialSearchLoading &&
        professionals.length === 0 &&
        hasCompletedAtLeastOneSearch ? (
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Search className="size-9" aria-hidden />
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-900">
                Nenhum profissional encontrado
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                {shouldShowLocationFields
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
                  router.push(
                    `/profissionais/${matchingChip.slug}${params.size > 0 ? `?${params.toString()}` : ''}`,
                  );
                } else {
                  const params = new URLSearchParams();
                  if (query.trim()) params.set('q', query.trim());
                  if (modalityFilter) params.set('modality', modalityFilter);
                  router.push(
                    `/profissionais${params.size > 0 ? `?${params.toString()}` : ''}`,
                  );
                }
              }}
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Ver todos os profissionais
            </button>
          </div>
        ) : null}

      </div>
    </main>
  );
}
