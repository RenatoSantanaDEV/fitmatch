import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MapPin, Star, CheckCircle, Wifi, Sparkles, ArrowRight, Brain } from 'lucide-react';
import { listMatchesUseCase } from '../../container';
import { MatchWithProfessionalDTO } from '../../application/dtos/match/MatchDTO';
import { auth } from '../../lib/auth';
import { RequestMatchButton } from './RequestMatchButton';

export const dynamic = 'force-dynamic';

interface RecomendacoesPageProps {
  searchParams: Promise<{ studentId?: string }>;
}

export default async function RecomendacoesPage({ searchParams }: RecomendacoesPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/?${new URLSearchParams({ auth: 'login', callbackUrl: '/recomendacoes' }).toString()}`);
  }

  const params = await searchParams;
  const userId = session.user.id;
  const studentId = params.studentId;

  let ranking: MatchWithProfessionalDTO[] = [];
  let error: string | null = null;

  try {
    ranking = await listMatchesUseCase.execute({ userId, studentId });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Erro ao carregar as recomendações.';
  }

  return (
    <main className="flex flex-1 flex-col bg-slate-50">

      {/* ===== Page header ===== */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-700">
            ← Início
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              {/* AI tag */}
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1">
                <Sparkles className="size-3.5 text-violet-600" aria-hidden />
                <span className="text-xs font-semibold text-violet-700">
                  Gerado por Inteligência Artificial
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Professores recomendados para você
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                Lista ordenada por compatibilidade com base no seu perfil, objetivos, localização
                e estilo de aula preferido. Quanto maior a porcentagem, maior a afinidade estimada.
              </p>
              <Link
                href="/descobrir"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700 hover:underline"
              >
                Buscar por cidade ou especialidade
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
            <RequestMatchButton userId={userId} studentId={studentId} />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!error && ranking.length === 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Empty state header */}
            <div className="bg-gradient-to-br from-violet-600 to-violet-700 px-8 py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Brain className="size-8 text-white" aria-hidden />
              </div>
              <h2 className="mt-4 text-xl font-extrabold text-white">
                Sua lista personalizada está pronta para ser gerada
              </h2>
              <p className="mt-2 text-sm text-violet-200">
                Clique em <strong>Atualizar ranking com IA</strong> para começar
              </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                {
                  step: '01',
                  title: 'A IA lê seu perfil',
                  desc: 'Analisa seus objetivos, nível de condicionamento, modalidade preferida e orçamento.',
                  color: 'text-violet-600 bg-violet-50',
                },
                {
                  step: '02',
                  title: 'Compara professores',
                  desc: 'Avalia todos os profissionais cadastrados e calcula a afinidade com você.',
                  color: 'text-emerald-600 bg-emerald-50',
                },
                {
                  step: '03',
                  title: 'Gera explicação',
                  desc: 'Para cada professor, escreve em português por que ele é indicado para você.',
                  color: 'text-orange-600 bg-orange-50',
                },
              ].map((s) => (
                <div key={s.step} className="flex flex-col gap-3 p-6">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold ${s.color}`}>
                    {s.step}
                  </span>
                  <h3 className="font-extrabold text-slate-900">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rankings */}
        {ranking.length > 0 && (
          <>
            <p className="mb-5 text-sm font-medium text-slate-500">
              <strong className="text-slate-900">{ranking.length}</strong> professor{ranking.length !== 1 ? 'es' : ''} recomendado{ranking.length !== 1 ? 's' : ''}
            </p>
            <ul className="flex flex-col gap-4">
              {ranking.map((m, i) => (
                <ProfessorCard key={m.id} item={m} posicao={i + 1} />
              ))}
            </ul>
          </>
        )}

        {/* Info callout */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <Sparkles className="size-4" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Como funciona a recomendação?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                A IA combina seu perfil — objetivos, nível, modalidade e localização — com os dados de
                cada professor e calcula uma porcentagem de afinidade. As explicações são geradas em
                português para que você entenda por que cada professor foi indicado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const AVATAR_GRADIENTS = [
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-orange-500 to-amber-600',
  'from-sky-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-700',
];

function ProfessorCard({ item, posicao }: { item: MatchWithProfessionalDTO; posicao: number }) {
  const pro = item.professional;
  const scorePct = Math.round(item.score * 100);
  const gradient = AVATAR_GRADIENTS[(posicao - 1) % AVATAR_GRADIENTS.length];

  return (
    <li className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex items-stretch">
        {/* Left accent bar based on score */}
        <div
          className={`w-1 shrink-0 ${scorePct >= 85 ? 'bg-emerald-500' : scorePct >= 70 ? 'bg-amber-400' : 'bg-slate-300'}`}
        />

        <div className="flex flex-1 flex-col gap-0 p-5 sm:p-6">
          {/* Header row */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-sm font-extrabold text-white shadow-md`}
            >
              {pro?.name ? initials(pro.name) : '#'}
            </div>

            {/* Name + meta */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">{pro?.name ?? 'Profissional'}</h2>
                {pro?.isVerified && (
                  <CheckCircle className="size-4 shrink-0 text-emerald-600" aria-label="Verificado" />
                )}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${posicao === 1 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                  {posicao}º lugar
                </span>
              </div>
              {pro && (
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" aria-hidden />
                    {pro.city}, {pro.state}
                  </span>
                  {pro.yearsExperience > 0 && (
                    <span>{pro.yearsExperience} anos de experiência</span>
                  )}
                  {pro.averageRating !== null && (
                    <span className="flex items-center gap-1">
                      <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                      {pro.averageRating.toFixed(1)} ({pro.totalReviews} avaliações)
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Affinity ring */}
            <AfinidadeRing score={scorePct} />
          </div>

          {/* Bio */}
          {pro?.bio && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{pro.bio}</p>
          )}

          {/* Tags */}
          {pro && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {pro.areas.map((a) => (
                <span
                  key={a.id}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600"
                >
                  {a.nome}
                </span>
              ))}
              {pro.modalities.map((m) => (
                <span
                  key={m}
                  className="flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700"
                >
                  <Wifi className="size-3" aria-hidden />
                  {formatEnum(m)}
                </span>
              ))}
            </div>
          )}

          {/* AI reasoning */}
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-gradient-to-r from-violet-50 to-slate-50 px-4 py-3">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-violet-500" aria-hidden />
            <blockquote className="text-sm italic leading-relaxed text-slate-700">
              {item.reasoning}
            </blockquote>
          </div>

          {/* Footer */}
          {pro && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">Valor por sessão</p>
                <p className="mt-0.5 text-sm font-extrabold text-slate-900">
                  {formatCurrency(pro.priceMin, pro.priceCurrency)} –{' '}
                  {formatCurrency(pro.priceMax, pro.priceCurrency)}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                Entrar em contato
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function AfinidadeRing({ score }: { score: number }) {
  const r = 24;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const ringColor = score >= 85 ? '#059669' : score >= 70 ? '#f59e0b' : '#94a3b8';
  const trackColor = score >= 85 ? '#d1fae5' : score >= 70 ? '#fef3c7' : '#f1f5f9';
  const textColor = score >= 85 ? 'text-emerald-700' : score >= 70 ? 'text-amber-600' : 'text-slate-500';

  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
      <svg width="64" height="64" viewBox="0 0 64 64" aria-label={`Afinidade: ${score}%`}>
        <circle cx="32" cy="32" r={r} fill="none" stroke={trackColor} strokeWidth="4" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          className="score-ring"
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className={`text-sm font-extrabold ${textColor}`}>{score}%</span>
        <span className="mt-0.5 text-[9px] font-semibold text-slate-400">match</span>
      </div>
    </div>
  );
}

function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}
