'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  FlameKindling,
  Heart,
  HeartPulse,
  Loader2,
  MapPin,
  Monitor,
  PersonStanding,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  Waves,
  Wind,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import type { ProfessionalResponseDTO } from '../../../application/dtos/professional/ProfessionalDTO';

/* ─────────────────────────────────────────────────── types */

type ModalityFilter = 'ONLINE' | 'IN_PERSON' | 'HYBRID' | null;

type CategoryEntry = {
  label: string;
  query: string;
  headline: string;
  sub: string;
  gradient: string;
  icon: React.ElementType;
};

/* ──────────────────────────────────────── category config */

const CATEGORY_CONFIG: Record<string, CategoryEntry> = {
  'personal-trainer': {
    label: 'Personal Trainer',
    query: 'personal trainer',
    headline: 'Os melhores personal trainers do Brasil',
    sub: 'Treinamento personalizado para emagrecer, hipertrofiar, ganhar condicionamento e transformar sua saúde.',
    gradient: 'from-slate-900 via-emerald-950 to-teal-900',
    icon: Dumbbell,
  },
  pilates: {
    label: 'Pilates',
    query: 'pilates',
    headline: 'Professores de Pilates qualificados perto de você',
    sub: 'Fortaleça o core, melhore a postura e alcance o bem-estar com professores especializados.',
    gradient: 'from-slate-900 via-violet-950 to-indigo-900',
    icon: PersonStanding,
  },
  yoga: {
    label: 'Yoga',
    query: 'yoga',
    headline: 'Professores de Yoga para transformar seu bem-estar',
    sub: 'Equilíbrio entre corpo e mente com os melhores professores de yoga do Brasil.',
    gradient: 'from-slate-900 via-orange-950 to-amber-900',
    icon: Wind,
  },
  funcional: {
    label: 'Funcional',
    query: 'treino funcional',
    headline: 'Treinamento Funcional de alto desempenho',
    sub: 'Melhore força, mobilidade e condicionamento com especialistas em treino funcional.',
    gradient: 'from-slate-900 via-green-950 to-emerald-900',
    icon: Zap,
  },
  musculacao: {
    label: 'Musculação',
    query: 'musculação hipertrofia',
    headline: 'Especialistas em Musculação e Hipertrofia',
    sub: 'Treinos personalizados de hipertrofia e musculação para maximizar seus resultados.',
    gradient: 'from-slate-900 via-slate-800 to-zinc-900',
    icon: Dumbbell,
  },
  crossfit: {
    label: 'CrossFit',
    query: 'crossfit',
    headline: 'Coaches de CrossFit certificados',
    sub: 'Treinamento de alta intensidade com acompanhamento profissional especializado.',
    gradient: 'from-slate-900 via-red-950 to-rose-900',
    icon: FlameKindling,
  },
  natacao: {
    label: 'Natação',
    query: 'natação',
    headline: 'Professores de Natação para todas as idades',
    sub: 'Aprenda ou aprimore sua técnica com professores de natação especializados.',
    gradient: 'from-slate-900 via-sky-950 to-blue-900',
    icon: Waves,
  },
  reabilitacao: {
    label: 'Reabilitação',
    query: 'reabilitação',
    headline: 'Especialistas em Reabilitação Física',
    sub: 'Recuperação segura e eficaz com profissionais de reabilitação especializados.',
    gradient: 'from-slate-900 via-teal-950 to-cyan-900',
    icon: HeartPulse,
  },
  corrida: {
    label: 'Corrida',
    query: 'corrida',
    headline: 'Treinadores de Corrida para todos os níveis',
    sub: 'Da primeira corrida à maratona, encontre o treinador ideal para evoluir.',
    gradient: 'from-slate-900 via-orange-950 to-yellow-900',
    icon: Activity,
  },
};

const ALL_CATEGORIES = Object.entries(CATEGORY_CONFIG).map(([slug, c]) => ({
  slug,
  label: c.label,
  icon: c.icon,
}));

const LIMIT = 20;

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

/* ────────────────────────────────────────────── helpers */

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

/* ──────────────────────────────────── sub-components */

function CardSkeleton() {
  return (
    <li className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="aspect-[4/3] skeleton" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="mt-0.5 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 w-3 skeleton rounded-sm" />
          ))}
          <div className="ml-1 h-3 w-16 skeleton rounded" />
        </div>
        <div className="h-3.5 w-full skeleton rounded" />
        <div className="h-3.5 w-3/4 skeleton rounded" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 skeleton rounded-full" />
          <div className="h-5 w-20 skeleton rounded-full" />
        </div>
        <div className="mt-0.5 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="h-4 w-24 skeleton rounded" />
          <div className="h-8 w-24 skeleton rounded-full" />
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
  const modalityLabel =
    p.modalities.length > 0
      ? p.modalities
          .map((m) => {
            if (m === 'ONLINE') return 'Online';
            if (m === 'IN_PERSON') return 'Presencial';
            return 'Híbrido';
          })
          .join(' & ')
      : null;
  const isTopPro = p.averageRating != null && p.averageRating >= 4.5 && p.totalReviews >= 3;

  return (
    <li className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Photo */}
      <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${gradient}`}>
        {p.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/profile/avatar/${p.userId}`}
            alt={p.displayName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex select-none items-center justify-center">
            <span className="text-6xl font-extrabold text-white/70">{initials}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-12">
          <p className="text-base font-bold leading-tight text-white drop-shadow-sm">
            {p.displayName}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-white/80">
            <MapPin className="size-3 shrink-0" aria-hidden />
            {p.location.city}
            {modalityLabel ? ` · ${modalityLabel}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleFav(p.id)}
          className={`absolute right-3 top-3 flex size-8 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-all ${
            isFav
              ? 'scale-110 bg-rose-500 text-white'
              : 'bg-white/90 text-slate-400 hover:bg-white hover:text-rose-400'
          }`}
          aria-label={isFav ? 'Remover favorito' : 'Salvar favorito'}
        >
          <Heart
            className={`size-3.5 ${isFav ? 'fill-white' : ''}`}
            strokeWidth={isFav ? 0 : 1.75}
            aria-hidden
          />
        </button>
        {p.isVerified && (
          <div className="absolute left-3 top-3">
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="size-2.5" aria-hidden />
              Verificado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          {p.averageRating != null ? (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`size-3.5 ${
                      n <= Math.round(p.averageRating!)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-200'
                    }`}
                    aria-hidden
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {p.averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">({p.totalReviews})</span>
            </div>
          ) : (
            <span className="text-xs italic text-slate-400">Sem avaliações</span>
          )}
          {isTopPro && (
            <span className="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
              <Sparkles className="size-2.5" aria-hidden />
              Top
            </span>
          )}
        </div>
        {p.bio && (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{p.bio}</p>
        )}
        {p.areas.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {p.areas.slice(0, 3).map((a) => (
              <span
                key={a.id}
                className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
              >
                {a.nome}
              </span>
            ))}
            {p.areas.length > 3 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-500">
                +{p.areas.length - 3}
              </span>
            )}
          </div>
        )}
        <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {formatMoney(p.sessionPrice.min, p.sessionPrice.max, p.sessionPrice.currency)}
              <span className="ml-1 text-xs font-normal text-slate-400">/sessão</span>
            </p>
            {p.isAcceptingClients && (
              <p className="mt-0.5 text-[11px] font-medium text-emerald-600">
                ✓ Aceita novos alunos
              </p>
            )}
          </div>
          <Link
            href={`/perfil/${p.userId}`}
            className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
          >
            Ver perfil
            <ArrowRight className="size-3" aria-hidden />
          </Link>
        </div>
      </div>
    </li>
  );
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

  const from = (page - 1) * LIMIT + 1;
  const to = Math.min(page * LIMIT, total);

  // Build visible page numbers with ellipsis
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
        <strong className="text-slate-800">{from}–{to}</strong> de{' '}
        <strong className="text-slate-800">{total}</strong> profissionais
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

/* ─────────────────────────────────── main component */

export function ListingClient({ categoria }: { categoria: string }) {
  const category: CategoryEntry = CATEGORY_CONFIG[categoria] ?? {
    label: categoria,
    query: categoria,
    headline: `Profissionais de ${categoria}`,
    sub: 'Encontre o profissional ideal para você.',
    gradient: 'from-slate-900 via-emerald-950 to-teal-900',
    icon: Dumbbell,
  };

  const [page, setPage] = useState(1);
  const [modality, setModality] = useState<ModalityFilter>(null);
  const [items, setItems] = useState<ProfessionalResponseDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const resultsTopRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(total / LIMIT);
  const CategoryIcon = category.icon;

  /* ── data fetching ── */

  const fetchData = useCallback(
    async (p: number, m: ModalityFilter) => {
      setError(null);
      setLoading(true);
      let q = category.query;
      if (m === 'ONLINE') q = `${q} online`;
      else if (m === 'IN_PERSON') q = `${q} presencial`;
      else if (m === 'HYBRID') q = `${q} híbrido`;

      try {
        const res = await fetch('/api/professionals/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ query: q, page: p, limit: LIMIT }),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          setItems(Array.isArray(body.data) ? body.data : []);
          setTotal(typeof body.total === 'number' ? body.total : 0);
        } else {
          setError(typeof body.error === 'string' ? body.error : 'Falha na busca.');
        }
      } catch {
        setError('Sem conexão com o servidor.');
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [category.query],
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
    void Promise.all([fetchData(1, null), loadFavorites()]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── handlers ── */

  const changePage = (newPage: number) => {
    setPage(newPage);
    resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    void fetchData(newPage, modality);
  };

  const changeModality = (m: ModalityFilter) => {
    const next = modality === m ? null : m;
    setModality(next);
    setPage(1);
    void fetchData(1, next);
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

  /* ── render ── */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero section ──────────────────────────────────── */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${category.gradient} px-4 pb-12 pt-12 sm:px-6`}>
        {/* Decorative glows */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          {/* Back link */}
          <Link
            href="/descobrir"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Voltar para busca
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              {/* Category badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                <CategoryIcon className="size-4 text-white/80" aria-hidden />
                <span className="text-xs font-semibold text-white/90">{category.label}</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {category.headline}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-white/70 sm:text-lg">{category.sub}</p>
            </div>

            {/* Stats */}
            {!initialLoading && total > 0 && (
              <div className="flex shrink-0 flex-wrap gap-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm lg:flex-col lg:gap-4">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">{total}+</p>
                  <p className="text-xs text-white/60">profissionais</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">4.9</p>
                  <p className="text-xs text-white/60">avaliação média</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-white">100%</p>
                  <p className="text-xs text-white/60">verificados</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter bar ────────────────────────────────────── */}
      <div className="sticky top-[68px] z-10 border-b border-slate-100 bg-white/98 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-3 sm:px-6">
          {/* Modality quick filters */}
          <div className="flex shrink-0 items-center gap-1.5">
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
                  onClick={() => changeModality(opt.value)}
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
                onClick={() => changeModality(null)}
                className="ml-1 flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-500 transition hover:border-slate-300"
                aria-label="Remover filtro"
              >
                <X className="size-3" aria-hidden />
              </button>
            )}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {/* Mobile filter button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:hidden"
            >
              <SlidersHorizontal className="size-3.5" aria-hidden />
              Filtros
            </button>

            {/* AI ranking link */}
            <Link
              href="/recomendacoes"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              <Sparkles className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">Ranking por IA</span>
              <span className="sm:hidden">IA</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* Results top anchor + header */}
        <div ref={resultsTopRef} className="mb-6 flex items-center justify-between">
          {!initialLoading && (
            <p className="text-sm text-slate-500">
              {loading ? (
                <span className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Buscando…
                </span>
              ) : (
                <>
                  <strong className="text-slate-900">{total}</strong>{' '}
                  profissional{total !== 1 ? 'is' : ''} encontrado{total !== 1 ? 's' : ''}
                  {modality && (
                    <span className="ml-1.5 font-medium text-emerald-600">
                      · {modality === 'ONLINE' ? 'Online' : modality === 'IN_PERSON' ? 'Presencial' : 'Híbrido'}
                    </span>
                  )}
                </>
              )}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {/* Skeletons */}
        {initialLoading && (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </ul>
        )}

        {/* Loading overlay on subsequent fetches */}
        {!initialLoading && loading && (
          <ul className="grid grid-cols-1 gap-5 opacity-50 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </ul>
        )}

        {/* Cards */}
        {!initialLoading && !loading && items.length > 0 && (
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

        {/* Empty state */}
        {!initialLoading && !loading && items.length === 0 && (
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <CategoryIcon className="size-9" aria-hidden />
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-900">
                Nenhum profissional de {category.label} encontrado
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                Tente remover os filtros ou explore outras modalidades.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {modality && (
                <button
                  type="button"
                  onClick={() => changeModality(null)}
                  className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Remover filtros
                </button>
              )}
              <Link
                href="/descobrir"
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Busca geral
              </Link>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!initialLoading && !loading && (
          <PaginationBar
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={changePage}
          />
        )}

        {/* Other categories */}
        {!initialLoading && (
          <div className="mt-12">
            <h2 className="mb-4 text-base font-bold text-slate-900">
              Explorar outras modalidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.filter((c) => c.slug !== categoria).map((c) => {
                const Icon = c.icon;
                return (
                  <Link
                    key={c.slug}
                    href={`/profissionais/${c.slug}`}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {c.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* AI upsell banner */}
        {!initialLoading && (
          <div className="mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-center text-white shadow-xl shadow-violet-500/20">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Sparkles className="size-6 text-white" aria-hidden />
            </div>
            <p className="text-xl font-extrabold">
              Quer uma lista personalizada para você?
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-violet-200">
              A IA analisa seu perfil e objetivos para montar um ranking explicado com os
              melhores profissionais de {category.label} para você.
            </p>
            <Link
              href="/recomendacoes"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
            >
              <Sparkles className="size-4" aria-hidden />
              Ver recomendações por IA
            </Link>
          </div>
        )}
      </div>

      {/* ── Mobile filter drawer ─────────────────────────── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
            aria-hidden
          />
          <div className="relative rounded-t-3xl bg-white px-5 pb-8 pt-5 shadow-2xl">
            <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-slate-200" />
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Filtros</h3>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="flex size-8 items-center justify-center rounded-full border border-slate-200 text-slate-500"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Modalidade
            </p>
            <div className="flex flex-col gap-2">
              {(
                [
                  { value: 'ONLINE' as const, label: 'Online', desc: 'Aulas por videochamada', icon: Wifi },
                  { value: 'IN_PERSON' as const, label: 'Presencial', desc: 'Aulas na sua cidade', icon: Users },
                  { value: 'HYBRID' as const, label: 'Híbrido', desc: 'Online e presencial', icon: Monitor },
                ] as const
              ).map((opt) => {
                const Icon = opt.icon;
                const active = modality === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      changeModality(opt.value);
                      setShowMobileFilters(false);
                    }}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-slate-100 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <Icon
                      className={`size-5 shrink-0 ${active ? 'text-emerald-600' : 'text-slate-400'}`}
                      aria-hidden
                    />
                    <div>
                      <p className={`text-sm font-semibold ${active ? 'text-emerald-700' : 'text-slate-800'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-400">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {modality && (
              <button
                type="button"
                onClick={() => {
                  changeModality(null);
                  setShowMobileFilters(false);
                }}
                className="mt-4 w-full rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Remover filtros
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
