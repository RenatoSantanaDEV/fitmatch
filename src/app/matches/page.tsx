import Link from 'next/link';
import { redirect } from 'next/navigation';
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
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition hover:text-brand"
        >
          ← Voltar
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Seus matches</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Profissionais rankeados pela nossa IA com base no seu perfil, objetivos,
          orçamento e modalidade preferida (presencial, online ou híbrido).
        </p>
      </header>

      <RequestMatchButton userId={userId} studentId={studentId} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      {!error && matches.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500 dark:border-zinc-700">
          Nenhum match ainda. Clique em <strong>Pedir novo match</strong> para começar.
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </ul>
    </main>
  );
}

function MatchCard({ match }: { match: MatchWithProfessionalDTO }) {
  const pro = match.professional;
  const scorePct = Math.round(match.score * 100);

  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{pro?.name ?? 'Profissional'}</h2>
            {pro?.isVerified && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                Verificado
              </span>
            )}
          </div>
          {pro && (
            <p className="text-sm text-zinc-500">
              {pro.city}/{pro.state} · {pro.yearsExperience} anos de experiência
              {pro.averageRating !== null && (
                <> · ★ {pro.averageRating.toFixed(1)} ({pro.totalReviews})</>
              )}
            </p>
          )}
        </div>
        <ScoreBadge percent={scorePct} />
      </div>

      {pro && (
        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{pro.bio}</p>
      )}

      {pro && (
        <div className="mt-3 flex flex-wrap gap-2">
          {pro.specializations.map((s) => (
            <span
              key={s}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              {formatEnum(s)}
            </span>
          ))}
          {pro.modalities.map((m) => (
            <span
              key={m}
              className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand"
            >
              {formatEnum(m)}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm italic text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
        “{match.reasoning}”
      </div>

      {pro && (
        <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Sessão entre {formatCurrency(pro.priceMin, pro.priceCurrency)} e{' '}
          {formatCurrency(pro.priceMax, pro.priceCurrency)}
        </div>
      )}
    </li>
  );
}

function ScoreBadge({ percent }: { percent: number }) {
  const color =
    percent >= 85
      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100'
      : percent >= 70
        ? 'bg-lime-100 text-lime-900 dark:bg-lime-900/50 dark:text-lime-100'
        : 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100';
  return (
    <div className={`rounded-full px-3 py-1 text-sm font-semibold ${color}`}>
      {percent}% match
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
