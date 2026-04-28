import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MapPin, Star, CheckCircle, Wifi, Users } from 'lucide-react';
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
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-2">
        <Link href="/" className="text-sm text-slate-500 transition hover:text-blue-600">
          ← Início
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Para si · educação física
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Professores recomendados para si
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Lista ordenada por inteligência artificial com base no seu perfil, objetivos e forma de
              aulas que prefere. Quanto maior a percentagem, maior a afinidade estimada.
            </p>
            <Link
              href="/descobrir"
              className="mt-3 inline-flex text-sm font-semibold text-blue-600 hover:underline"
            >
              Procurar por cidade ou descrição →
            </Link>
          </div>
          <RequestMatchButton userId={userId} studentId={studentId} />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {!error && ranking.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <Users className="size-7" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Ainda não tem recomendações</p>
            <p className="mt-1 text-sm text-slate-600">
              Toque em <strong>Atualizar lista com IA</strong> para gerar uma nova lista de professores
              alinhados ao seu perfil.
            </p>
          </div>
        </div>
      )}

      {ranking.length > 0 && (
        <ul className="flex flex-col gap-4">
          {ranking.map((m, i) => (
            <ProfessorCard key={m.id} item={m} posicao={i + 1} />
          ))}
        </ul>
      )}
    </main>
  );
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const avatarColors = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
];

function ProfessorCard({
  item,
  posicao,
}: {
  item: MatchWithProfessionalDTO;
  posicao: number;
}) {
  const pro = item.professional;
  const scorePct = Math.round(item.score * 100);
  const color = avatarColors[(posicao - 1) % avatarColors.length];

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${color}`}
        >
          {pro?.name ? initials(pro.name) : '#'}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{pro?.name ?? 'Profissional'}</h2>
                {pro?.isVerified && (
                  <CheckCircle className="size-4 text-blue-600" aria-label="Verificado" />
                )}
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {posicao}º na lista
                </span>
              </div>
              {pro && (
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" aria-hidden />
                    {pro.city}/{pro.state}
                  </span>
                  <span>·</span>
                  <span>{pro.yearsExperience} anos de experiência</span>
                  {pro.averageRating !== null && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                        {pro.averageRating.toFixed(1)} ({pro.totalReviews} avaliações)
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
            <AfinidadeRing score={scorePct} />
          </div>

          {pro?.bio && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{pro.bio}</p>
          )}

          {pro && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {pro.specializations.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                >
                  {formatEnum(s)}
                </span>
              ))}
              {pro.modalities.map((m) => (
                <span
                  key={m}
                  className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                >
                  <Wifi className="size-3" aria-hidden />
                  {formatEnum(m)}
                </span>
              ))}
            </div>
          )}

          <blockquote className="mt-4 rounded-xl border-l-2 border-blue-500 bg-blue-50/70 py-2.5 pl-4 pr-3 text-sm italic text-slate-700">
            {item.reasoning}
          </blockquote>

          {pro && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-900">
                {formatCurrency(pro.priceMin, pro.priceCurrency)} –{' '}
                {formatCurrency(pro.priceMax, pro.priceCurrency)} por sessão
              </span>
              <button
                type="button"
                className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
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
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const ringColor = score >= 85 ? '#2563eb' : score >= 70 ? '#f59e0b' : '#6b7280';

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgb(226 232 240)" strokeWidth="3.5" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="3.5"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-sm font-black text-slate-900">{score}%</span>
        <span className="text-[9px] text-slate-500">afinidade</span>
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
