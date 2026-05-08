'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  GraduationCap,
  Heart,
  MapPin,
  Monitor,
  Share2,
  Shield,
  Sparkles,
  Star,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import { AICompatibilitySection } from './AICompatibilitySection';

/* ────────────────────────────────────────────────────────── types */

export type ProfileData = {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  areas: { id: string; nome: string }[];
  modalities: string[];
  sessionPrice: { min: number; max: number; currency: string };
  yearsExperience: number;
  isVerified: boolean;
  isAcceptingClients: boolean;
  averageRating: number | null;
  totalReviews: number;
  city: string;
  state: string;
  crefNumber: string | null;
  classDynamics: string | null;
  sessionDurationMinutes: number | null;
  certifications: {
    id: string;
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate: string | null;
    isVerified: boolean;
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    studentName: string;
    studentAvatarUrl: string | null;
  }[];
};

/* ────────────────────────────────────────────────────── helpers */

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

function formatDateMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

const GRADIENT_BY_INDEX = [
  'from-emerald-400 to-teal-600',
  'from-violet-400 to-purple-600',
  'from-orange-400 to-amber-600',
  'from-sky-400 to-blue-600',
];

/* ────────────────────────────────────────────── sub-components */

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'size-5' : 'size-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${cls} ${
            n <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}

function ModalityPill({ modality }: { modality: string }) {
  if (modality === 'ONLINE') {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm">
        <Wifi className="size-4" aria-hidden />
        Online — por videochamada
      </span>
    );
  }
  if (modality === 'IN_PERSON') {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
        <MapPin className="size-4" aria-hidden />
        Presencial
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm">
      <Monitor className="size-4" aria-hidden />
      Online & Presencial
    </span>
  );
}

function ReviewCard({ review, idx }: { review: ProfileData['reviews'][0]; idx: number }) {
  const initials = getInitials(review.studentName);
  const gradient = GRADIENT_BY_INDEX[idx % GRADIENT_BY_INDEX.length];
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-xs font-bold text-white shadow-sm`}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{review.studentName}</p>
            <p className="text-xs text-slate-400 capitalize">{formatDateMonthYear(review.createdAt)}</p>
          </div>
        </div>
        <div className="shrink-0">
          <StarRow rating={review.rating} size="sm" />
        </div>
      </div>
      {review.comment && (
        <p className="text-sm leading-relaxed text-slate-600">&quot;{review.comment}&quot;</p>
      )}
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">{children}</div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-lg font-bold text-slate-900">{children}</h2>;
}

/* ────────────────────────────────────────────── main component */

export function ProfilePageClient({
  data,
  isFavorited: initialFavorited,
  isOwnProfile,
}: {
  data: ProfileData;
  isFavorited: boolean;
  isOwnProfile: boolean;
}) {
  const [isFav, setIsFav] = useState(initialFavorited);
  const [favLoading, setFavLoading] = useState(false);

  const initials = getInitials(data.displayName);
  const priceLabel = formatMoney(
    data.sessionPrice.min,
    data.sessionPrice.max,
    data.sessionPrice.currency,
  );
  const firstName = data.displayName.split(' ')[0];
  const isTopPro = data.averageRating != null && data.averageRating >= 4.5 && data.totalReviews >= 5;
  const mainArea = data.areas[0]?.nome ?? null;

  async function toggleFav() {
    if (favLoading) return;
    setFavLoading(true);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ professionalId: data.id }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) setIsFav(Boolean(body.favorited));
    } catch { /* ignore */ } finally {
      setFavLoading(false);
    }
  }

  async function handleShare() {
    try {
      await navigator.share({ title: data.displayName, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href).catch(() => null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-0">

      {/* ── Sticky sub-nav ───────────────────────────────────── */}
      <div className="sticky top-[68px] z-10 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/descobrir"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Voltar para busca
          </Link>
          <div className="flex items-center gap-2">
            {!isOwnProfile && (
              <button
                type="button"
                onClick={() => void handleShare()}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                aria-label="Compartilhar perfil"
              >
                <Share2 className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">Compartilhar</span>
              </button>
            )}
            {!isOwnProfile && (
              <button
                type="button"
                onClick={() => void toggleFav()}
                disabled={favLoading}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  isFav
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-500'
                } disabled:opacity-60`}
              >
                <Heart
                  className={`size-3.5 ${isFav ? 'fill-rose-500' : ''}`}
                  strokeWidth={isFav ? 0 : 1.75}
                  aria-hidden
                />
                {isFav ? 'Salvo' : 'Salvar'}
              </button>
            )}
            {isOwnProfile && (
              <Link
                href="/perfil"
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Editar perfil
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Page content ─────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* ── Profile header ───────────────────────────────── */}
        <header className="mb-10">

          {/* Breadcrumb specialty chips */}
          {data.areas.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {data.areas.slice(0, 4).map((a) => (
                <Link
                  key={a.id}
                  href={`/descobrir?q=${encodeURIComponent(a.nome)}`}
                  className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  {a.nome}
                </Link>
              ))}
            </div>
          )}

          {/* Name + tagline */}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {data.displayName}
          </h1>
          {mainArea && (
            <p className="mt-1.5 text-base text-slate-500 sm:text-lg">
              {mainArea}
              {data.areas.length > 1 ? ` e ${data.areas.length - 1} outra${data.areas.length - 1 > 1 ? 's' : ''} especialidade${data.areas.length - 1 > 1 ? 's' : ''}` : ''}
              {data.city ? ` · ${data.city}, ${data.state}` : ''}
            </p>
          )}

          {/* Rating row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {data.averageRating != null ? (
              <div className="flex items-center gap-2">
                <StarRow rating={data.averageRating} size="md" />
                <span className="font-bold text-slate-900">{data.averageRating.toFixed(1)}</span>
                <span className="text-slate-500">
                  ({data.totalReviews} avaliação{data.totalReviews !== 1 ? 'ões' : ''})
                </span>
              </div>
            ) : (
              <span className="italic text-slate-400">Sem avaliações ainda</span>
            )}
            {data.yearsExperience > 0 && (
              <>
                <span className="text-slate-300 hidden sm:block">·</span>
                <span className="text-slate-600">
                  <strong className="font-semibold text-slate-900">{data.yearsExperience}</strong>{' '}
                  ano{data.yearsExperience !== 1 ? 's' : ''} de experiência
                </span>
              </>
            )}
          </div>

          {/* Status badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {data.isVerified && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="size-3.5" aria-hidden />
                Verificado
              </span>
            )}
            {data.isAcceptingClients && (
              <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                <Users className="size-3.5" aria-hidden />
                Aceita novos alunos
              </span>
            )}
            {isTopPro && (
              <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                <Sparkles className="size-3.5" aria-hidden />
                Top Profissional
              </span>
            )}
            {data.crefNumber && (
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                <Award className="size-3.5" aria-hidden />
                CREF {data.crefNumber}
              </span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">

          <div className="flex min-w-0 flex-col gap-7">

            <section>
              <SectionTitle>Modalidades</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {data.modalities.map((m) => (
                  <ModalityPill key={m} modality={m} />
                ))}
                {data.city && (
                  <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                    <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden />
                    {data.city}, {data.state}
                  </span>
                )}
              </div>
            </section>

            {isTopPro && (
              <div className="flex items-start gap-4 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-100">
                  <Sparkles className="size-5 text-violet-600" aria-hidden />
                </div>
                <div>
                  <p className="font-bold text-violet-900">
                    Recomendado pela IA FitMatch
                  </p>
                  <p className="mt-1 text-sm text-violet-700">
                    Entre os profissionais mais bem avaliados da plataforma. Histórico
                    consistente de resultados e alto índice de satisfação dos alunos.
                  </p>
                </div>
              </div>
            )}

            <section>
              <SectionTitle>Mais sobre {firstName}</SectionTitle>
              <SectionCard>
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{data.bio}</p>
              </SectionCard>
            </section>

            <AICompatibilitySection
              professionalId={data.id}
              professionalName={data.displayName}
              isOwnProfile={isOwnProfile}
            />

            {data.areas.length > 0 && (
              <section>
                <SectionTitle>Especialidades</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {data.areas.map((a) => (
                    <span
                      key={a.id}
                      className="rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-semibold text-emerald-700"
                    >
                      {a.nome}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {data.classDynamics && (
              <section>
                <SectionTitle>Como funciona o treino</SectionTitle>
                <SectionCard>
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                    {data.classDynamics}
                  </p>
                  {data.sessionDurationMinutes && (
                    <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-slate-50 px-4 py-3">
                      <Clock className="size-4 shrink-0 text-emerald-600" aria-hidden />
                      <span className="text-sm font-semibold text-slate-700">
                        Duração média das sessões:{' '}
                        <strong>{data.sessionDurationMinutes} minutos</strong>
                      </span>
                    </div>
                  )}
                </SectionCard>
              </section>
            )}

            <section>
              <SectionTitle>Formação e Experiência</SectionTitle>
              <SectionCard>
                <div className="flex flex-col divide-y divide-slate-100">
                  <div className="flex items-center gap-4 pb-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                      <Award className="size-5 text-emerald-600" aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {data.yearsExperience} ano{data.yearsExperience !== 1 ? 's' : ''} de
                        experiência
                      </p>
                      <p className="text-xs text-slate-500">
                        Como profissional de educação física
                      </p>
                    </div>
                  </div>

                  {data.crefNumber && (
                    <div className="flex items-center gap-4 py-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50">
                        <GraduationCap className="size-5 text-blue-600" aria-hidden />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          CREF: {data.crefNumber}
                        </p>
                        <p className="text-xs text-slate-500">
                          Registro no Conselho Federal de Educação Física
                        </p>
                      </div>
                    </div>
                  )}

                  {data.certifications.map((c, i) => (
                    <div
                      key={c.id}
                      className={`flex items-center gap-4 ${i < data.certifications.length - 1 ? 'py-4' : 'pt-4'}`}
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-50">
                        <CheckCircle2 className="size-5 text-violet-600" aria-hidden />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">
                          {c.issuingBody} · {new Date(c.issueDate).getFullYear()}
                          {c.expiryDate
                            ? ` – ${new Date(c.expiryDate).getFullYear()}`
                            : ''}
                        </p>
                      </div>
                    </div>
                  ))}

                  {!data.crefNumber && data.certifications.length === 0 && (
                    <p className="pt-4 text-sm italic text-slate-400">
                      Formação acadêmica em Educação Física.
                    </p>
                  )}
                </div>
              </SectionCard>
            </section>

            {data.reviews.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    Avaliações
                    <span className="ml-2 text-base font-normal text-slate-400">
                      ({data.totalReviews})
                    </span>
                  </h2>
                  {data.averageRating != null && (
                    <div className="flex items-center gap-2">
                      <Star className="size-5 fill-amber-400 text-amber-400" aria-hidden />
                      <span className="text-xl font-extrabold text-slate-900">
                        {data.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {data.reviews.map((r, idx) => (
                    <ReviewCard key={r.id} review={r} idx={idx} />
                  ))}
                </div>
              </section>
            )}

            {mainArea && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
                <p className="text-sm font-semibold text-slate-700">
                  Explore outros profissionais de {mainArea}
                </p>
                <Link
                  href={`/descobrir?q=${encodeURIComponent(mainArea)}`}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Ver profissionais similares
                </Link>
              </div>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-[130px] rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">

              <div className="mb-6 flex flex-col items-center text-center">
                <div className="relative mb-3">
                  {data.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={data.avatarUrl}
                      alt={data.displayName}
                      className="size-24 rounded-2xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-md">
                      <span className="text-2xl font-extrabold text-white">{initials}</span>
                    </div>
                  )}
                  {data.isVerified && (
                    <div className="absolute -bottom-1.5 -right-1.5 rounded-full bg-white p-0.5 shadow">
                      <CheckCircle2 className="size-5 text-emerald-600" aria-hidden />
                    </div>
                  )}
                </div>
                <p className="text-lg font-bold text-slate-900">{data.displayName}</p>
                {data.averageRating != null && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                    <span className="text-sm font-semibold text-slate-800">
                      {data.averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({data.totalReviews} avaliações)
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-5 overflow-hidden rounded-xl border border-slate-100">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-500">Tarifa</span>
                  <span className="text-sm font-bold text-slate-900">{priceLabel}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                  <span className="text-sm text-slate-500">Experiência</span>
                  <span className="text-sm font-bold text-slate-900">
                    {data.yearsExperience} ano{data.yearsExperience !== 1 ? 's' : ''}
                  </span>
                </div>
                {data.totalReviews > 0 && (
                  <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                    <span className="text-sm text-slate-500">Avaliações</span>
                    <span className="text-sm font-bold text-slate-900">{data.totalReviews}</span>
                  </div>
                )}
                {data.sessionDurationMinutes && (
                  <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                    <span className="text-sm text-slate-500">Duração</span>
                    <span className="text-sm font-bold text-slate-900">
                      {data.sessionDurationMinutes} min
                    </span>
                  </div>
                )}
              </div>

              {/* Primary CTA */}
              {isOwnProfile ? (
                <Link
                  href="/perfil"
                  className="block w-full rounded-full bg-slate-800 px-4 py-3.5 text-center text-sm font-bold text-white transition hover:bg-slate-900"
                >
                  Editar meu perfil
                </Link>
              ) : (
                <Link
                  href="/recomendacoes"
                  className="block w-full rounded-full bg-emerald-600 px-4 py-3.5 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Entrar em contato
                </Link>
              )}

              <div className="mt-5 flex flex-col gap-2.5 border-t border-slate-100 pt-5">
                {data.isVerified && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden />
                    Perfil verificado pela FitMatch
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Shield className="size-4 shrink-0 text-emerald-600" aria-hidden />
                  Pagamento seguro pela plataforma
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Zap className="size-4 shrink-0 text-violet-500" aria-hidden />
                  Recomendado pela IA FitMatch
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Mobile fixed bottom bar ──────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-100 bg-white/98 px-4 py-3 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <p className="text-xs text-slate-400">Tarifa por sessão</p>
            <p className="text-base font-extrabold text-slate-900">{priceLabel}</p>
          </div>
          {isOwnProfile ? (
            <Link
              href="/perfil"
              className="flex-1 rounded-full bg-slate-800 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-900"
            >
              Editar perfil
            </Link>
          ) : (
            <Link
              href="/recomendacoes"
              className="flex-1 rounded-full bg-emerald-600 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Entrar em contato
            </Link>
          )}
          {!isOwnProfile && (
            <button
              type="button"
              onClick={() => void toggleFav()}
              disabled={favLoading}
              className={`flex size-12 shrink-0 items-center justify-center rounded-full border transition ${
                isFav
                  ? 'border-rose-200 bg-rose-50 text-rose-500'
                  : 'border-slate-200 bg-white text-slate-400 hover:text-rose-400'
              } disabled:opacity-60`}
              aria-label={isFav ? 'Remover favorito' : 'Salvar favorito'}
            >
              <Heart
                className={`size-5 ${isFav ? 'fill-rose-500' : ''}`}
                strokeWidth={isFav ? 0 : 1.75}
                aria-hidden
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
