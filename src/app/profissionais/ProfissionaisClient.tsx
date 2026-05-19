'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Monitor,
  Search,
  Sparkles,
  Users,
  Wifi,
  X,
} from 'lucide-react';
import { DiscoverProfessionalCard } from '../descobrir/DiscoverProfessionalCard';
import { DiscoverCardSkeleton } from '../descobrir/DiscoverCardSkeleton';
import { SPECIALTY_CHIP_CONFIGS } from '../descobrir/discoverUiConstants';
import { augmentQueryWithModalityFilter } from '../descobrir/discoverSearchQuery';
import type { ModalityFilter } from '../descobrir/discoverSearchTypes';
import type { ProfessionalResponseDTO } from '../../application/dtos/professional/ProfessionalDTO';
import { SmartMatchModal } from './SmartMatchModal';

const PAGE_SIZE = 20;
const SKELETON_COUNT = 9;

interface Props {
  initialQuery: string;
  initialModality: string;
  defaultCity?: string;
  defaultState?: string;
}

function toModalityFilter(raw: string): ModalityFilter {
  if (raw === 'ONLINE' || raw === 'IN_PERSON' || raw === 'HYBRID') return raw;
  return null;
}

function buildTitle(query: string, modality: ModalityFilter): string {
  const modalityLabel =
    modality === 'ONLINE'
      ? 'online'
      : modality === 'IN_PERSON'
        ? 'presenciais'
        : modality === 'HYBRID'
          ? 'híbridos'
          : null;

  const parts: string[] = ['Profissionais'];
  if (query) parts.push(`de ${query}`);
  if (modalityLabel) parts.push(modalityLabel);
  parts.push('próximos a você');
  return parts.join(' ');
}

function buildSearchContext(query: string, modality: ModalityFilter, city: string): string {
  const parts: string[] = [];
  if (query) parts.push(query);
  if (modality === 'ONLINE') parts.push('Online');
  else if (modality === 'IN_PERSON') parts.push('Presencial');
  else if (modality === 'HYBRID') parts.push('Híbrido');
  if (city) parts.push(city);
  return parts.join(' · ');
}

function PaginationBar({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('…');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <p className="text-sm text-slate-500">
        Mostrando{' '}
        <strong className="text-slate-800">
          {from}–{to}
        </strong>{' '}
        de <strong className="text-slate-800">{total}</strong> profissionais
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span
              key={`ellipsis-${i}`}
              className="flex size-9 items-center justify-center text-sm text-slate-400"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                p === page
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
          aria-label="Próxima página"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function ProfissionaisClient({
  initialQuery,
  initialModality,
  defaultCity,
  defaultState,
}: Props) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [modality, setModality] = useState<ModalityFilter>(toModalityFilter(initialModality));
  const [cityInput, setCityInput] = useState(defaultCity ?? '');
  const [stateInput, setStateInput] = useState(defaultState ?? '');

  const [professionals, setProfessionals] = useState<ProfessionalResponseDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

  // Smart match modal
  const [showModal, setShowModal] = useState(false);
  const [smartMatchIds, setSmartMatchIds] = useState<string[]>([]);
  const [searchContext, setSearchContext] = useState('');

  const resultsTopRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const title = buildTitle(query, modality);

  function prepareSmartMatch(pros: ProfessionalResponseDTO[], ctx: string) {
    if (pros.length === 0) return;
    setSmartMatchIds(pros.map((p) => p.id).slice(0, 20));
    setSearchContext(ctx);
  }

  /* ── Data fetching ─────────────────────────────────────────────── */

  const fetchProfessionals = useCallback(
    async (
      q: string,
      mod: ModalityFilter,
      city: string,
      state: string,
      p: number,
    ): Promise<ProfessionalResponseDTO[]> => {
      setError(null);
      setIsLoading(true);
      const requestQuery = augmentQueryWithModalityFilter(q, mod);
      try {
        const res = await fetch('/api/professionals/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            query: requestQuery,
            city: city.trim() || undefined,
            state: state.trim().toUpperCase().slice(0, 2) || undefined,
            page: p,
            limit: PAGE_SIZE,
            showAll: true,
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          const fetched: ProfessionalResponseDTO[] = Array.isArray(body.data) ? body.data : [];
          setProfessionals(fetched);
          setTotal(typeof body.total === 'number' ? body.total : 0);
          return fetched;
        } else {
          setError(typeof body.error === 'string' ? body.error : 'Falha na busca.');
          setProfessionals([]);
          return [];
        }
      } catch {
        setError('Sem conexão com o servidor.');
        setProfessionals([]);
        return [];
      } finally {
        setIsLoading(false);
        setIsInitialLoading(false);
      }
    },
    [],
  );

  const loadFavorites = useCallback(async () => {
    try {
      const res = await fetch('/api/favorites');
      const body = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(body.professionalIds)) {
        setFavorites(new Set(body.professionalIds as string[]));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const init = async () => {
      const [fetched] = await Promise.all([
        fetchProfessionals(
          initialQuery,
          toModalityFilter(initialModality),
          defaultCity ?? '',
          defaultState ?? '',
          1,
        ),
        loadFavorites(),
      ]);
      if (fetched.length > 0) {
        const ctx = buildSearchContext(
          initialQuery,
          toModalityFilter(initialModality),
          defaultCity ?? '',
        );
        prepareSmartMatch(fetched, ctx);
      }
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Handlers ──────────────────────────────────────────────────── */

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const newQuery = draftQuery.trim();
    setQuery(newQuery);
    setPage(1);
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (modality) params.set('modality', modality);
    router.replace(`/profissionais${params.size > 0 ? `?${params.toString()}` : ''}`, {
      scroll: false,
    });
    const fetched = await fetchProfessionals(newQuery, modality, cityInput, stateInput, 1);
    if (fetched.length > 0) {
      const ctx = buildSearchContext(newQuery, modality, cityInput);
      prepareSmartMatch(fetched, ctx);
    }
  }

  async function handleModalityChange(next: ModalityFilter) {
    const newMod = modality === next ? null : next;
    setModality(newMod);
    setPage(1);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (newMod) params.set('modality', newMod);
    router.replace(`/profissionais${params.size > 0 ? `?${params.toString()}` : ''}`, {
      scroll: false,
    });
    const fetched = await fetchProfessionals(query, newMod, cityInput, stateInput, 1);
    if (fetched.length > 0) {
      const ctx = buildSearchContext(query, newMod, cityInput);
      prepareSmartMatch(fetched, ctx);
    }
  }

  function handleSpecialtyChip(_chipValue: string, chipSlug: string) {
    router.push(`/profissionais/${chipSlug}`);
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
    resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    void fetchProfessionals(query, modality, cityInput, stateInput, newPage);
  }

  async function toggleFavorite(professionalId: string) {
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
  }

  /* ── Render ────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Smart Match Modal */}
      <SmartMatchModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        professionalIds={smartMatchIds}
        professionals={professionals}
        searchContext={searchContext}
      />

      {/* ── Page header ───────────────────────────────────── */}
      <div className="border-b border-slate-100 bg-white px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/descobrir"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-700"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Voltar para busca
          </Link>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {!isInitialLoading && total > 0 && (
            <p className="mt-1 text-sm text-slate-500">
              {total} profissional{total !== 1 ? 'is' : ''} encontrado{total !== 1 ? 's' : ''}
            </p>
          )}

          {/* Search bar */}
          <form onSubmit={(e) => void handleSearch(e)} className="mt-5 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
              <Search className="size-4 shrink-0 text-slate-400" aria-hidden />
              <input
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                placeholder="Especialidade, nome ou objetivo…"
                className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                aria-label="Buscar profissional"
              />
              {draftQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraftQuery('');
                    setQuery('');
                    setPage(1);
                    router.replace('/profissionais', { scroll: false });
                    void fetchProfessionals('', modality, cityInput, stateInput, 1);
                  }}
                  className="text-slate-300 hover:text-slate-500"
                >
                  <X className="size-4" aria-hidden />
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-emerald-400 focus-within:bg-white">
              <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden />
              <input
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Cidade"
                className="w-28 bg-transparent py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:w-36"
              />
              <input
                value={stateInput}
                onChange={(e) => setStateInput(e.target.value.toUpperCase().slice(0, 2))}
                placeholder="UF"
                maxLength={2}
                className="w-8 bg-transparent py-2.5 text-center text-sm uppercase text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Search className="size-4" aria-hidden />
              )}
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </form>
        </div>
      </div>

      {/* ── Filter bar ────────────────────────────────────── */}
      <div className="sticky top-[68px] z-10 border-b border-slate-100 bg-white/98 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {/* Modality filters */}
          {(
            [
              { value: 'ONLINE' as const, label: 'Online', icon: Wifi },
              { value: 'IN_PERSON' as const, label: 'Presencial', icon: Users },
              { value: 'HYBRID' as const, label: 'Híbrido', icon: Monitor },
            ] as const
          ).map((opt) => {
            const Icon = opt.icon;
            const active = modality === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => void handleModalityChange(opt.value)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'border-emerald-300 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className="size-3.5" aria-hidden />
                {opt.label}
              </button>
            );
          })}

          {modality && (
            <button
              type="button"
              onClick={() => void handleModalityChange(null)}
              className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-500 transition hover:border-slate-300"
              aria-label="Remover filtro de modalidade"
            >
              <X className="size-3" aria-hidden />
            </button>
          )}

          <div className="mx-3 h-5 w-px shrink-0 bg-slate-200" aria-hidden />

          {/* Specialty chips */}
          {SPECIALTY_CHIP_CONFIGS.map((chip) => {
            const ChipIcon = chip.icon;
            return (
              <button
                key={chip.slug}
                type="button"
                onClick={() => handleSpecialtyChip(chip.value, chip.slug)}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <ChipIcon className="size-3.5" aria-hidden />
                {chip.label}
              </button>
            );
          })}

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {smartMatchIds.length > 0 && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                <Sparkles className="size-3.5" aria-hidden />
                Melhores para você
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────── */}
      <div ref={resultsTopRef} className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {error && (
          <div
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {isInitialLoading && (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <DiscoverCardSkeleton key={i} />
            ))}
          </ul>
        )}

        {!isInitialLoading && isLoading && (
          <ul className="grid grid-cols-1 gap-5 opacity-50 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <DiscoverCardSkeleton key={i} />
            ))}
          </ul>
        )}

        {!isInitialLoading && !isLoading && professionals.length > 0 && (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.map((p, idx) => (
              <DiscoverProfessionalCard
                key={p.id}
                professional={p}
                cardIndex={idx}
                isFavorite={favorites.has(p.id)}
                onToggleFavorite={(id) => void toggleFavorite(id)}
              />
            ))}
          </ul>
        )}

        {!isInitialLoading && !isLoading && professionals.length === 0 && (
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Search className="size-9" aria-hidden />
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-900">
                Nenhum profissional encontrado
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                Tente mudar a especialidade ou remover os filtros.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDraftQuery('');
                setQuery('');
                setModality(null);
                setCityInput('');
                setStateInput('');
                setPage(1);
                router.replace('/profissionais', { scroll: false });
                void fetchProfessionals('', null, '', '', 1);
              }}
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Ver todos os profissionais
            </button>
          </div>
        )}

        {!isInitialLoading && !isLoading && (
          <PaginationBar
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={handlePageChange}
          />
        )}

        {!isInitialLoading && (
          <div className="mt-12">
            <h2 className="mb-4 text-base font-bold text-slate-900">Explorar por modalidade</h2>
            <div className="flex flex-wrap gap-2">
              {SPECIALTY_CHIP_CONFIGS.map((chip) => {
                const Icon = chip.icon;
                return (
                  <Link
                    key={chip.slug}
                    href={`/profissionais/${chip.slug}`}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {chip.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
