import { redirect } from 'next/navigation';

/** URL antiga: redireciona para a página em português. */
export default async function MatchesRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.studentId) qs.set('studentId', sp.studentId);
  redirect(qs.toString() ? `/recomendacoes?${qs.toString()}` : '/recomendacoes');
}
