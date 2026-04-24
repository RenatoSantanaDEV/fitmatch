import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MapPin, Star, CheckCircle, Wifi, Users } from 'lucide-react';
import { listMatchesUseCase } from '../../container';
import { MatchWithProfessionalDTO } from '../../application/dtos/match/MatchDTO';
import { auth } from '../../lib/auth';
import { RequestMatchButton } from './RequestMatchButton';

export const dynamic = 'force-dynamic';

interface MatchesPageProps {
  searchParams: Promise<{ studentId?: string }>;
}

export default async function MatchesPage({ searchParams }: MatchesPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const params = await searchParams;
  const userId = session.user.id;
  const studentId = params.studentId;

  let matches: MatchWithProfessionalDTO[] = [];
  let error: string | null = null;

  try {
    matches = await listMatchesUseCase.execute({ userId, studentId });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Erro inesperado ao carregar matches';
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-2">
        <Link href="/" className="text-sm text-muted-foreground transition hover:text-brand">
          ← Voltar
        </Link>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Seus Matches</h1>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              Professores rankeados por IA com base no seu perfil, objetivos e modalidade preferida.
            </p>
          </div>
          <RequestMatchButton userId={userId} studentId={studentId} />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && matches.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border-subtle bg-surface p-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-brand">
            <Users className="size-7" aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-foreground">Nenhum match ainda</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Clique em <strong>Gerar matches</strong> para a IA buscar professores compatíveis.
            </p>
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <ul className="flex flex-col gap-4">
          {matches.map((m, i) => (
            <MatchCard key={m.id} match={m} rank={i + 1} />
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

function MatchCard({ match, rank }: { match: MatchWithProfessionalDTO; rank: number }) {
  const pro = match.professional;
  const scorePct = Math.round(match.score * 100);
  const color = avatarColors[(rank - 1) % avatarColors.length];

  return (
    <li className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${color}`}
        >
          {pro?.name ? initials(pro.name) : '#'}
        </div>

        <div className="min-w-0 flex-1">
          {/* Top row */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">{pro?.name ?? 'Profissional'}</h2>
                {pro?.isVerified && (
                  <CheckCircle className="size-4 text-brand" aria-label="Verificado" />
                )}
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                  #{rank}
                </span>
              </div>
              {pro && (
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" aria-hidden />
                    {pro.city}/{pro.state}
                  </span>
                  <span>·</span>
                  <span>{pro.yearsExperience} anos de exp.</span>
                  {pro.averageRating !== null && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                        {pro.averageRating.toFixed(1)} ({pro.totalReviews})
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
            <ScoreRing score={scorePct} />
          </div>

          {/* Bio */}
          {pro?.bio && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {pro.bio}
            </p>
          )}

          {/* Tags */}
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
                  className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-brand"
                >
                  <Wifi className="size-3" aria-hidden />
                  {formatEnum(m)}
                </span>
              ))}
            </div>
          )}

          {/* Reasoning */}
          <blockquote className="mt-4 rounded-xl border-l-2 border-brand bg-blue-50/60 py-2.5 pl-4 pr-3 text-sm italic text-slate-600">
            {match.reasoning}
          </blockquote>

          {/* Price + CTA */}
          {pro && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(pro.priceMin, pro.priceCurrency)} –{' '}
                {formatCurrency(pro.priceMax, pro.priceCurrency)}/sessão
              </span>
              <button
                type="button"
                className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-hover"
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

function ScoreRing({ score }: { score: number }) {
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
          className="score-ring"
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className="text-sm font-black text-foreground">{score}%</span>
        <span className="text-[9px] text-muted-foreground">match</span>
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
