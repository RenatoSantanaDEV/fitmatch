import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle, Zap } from 'lucide-react';

export const metadata = { title: 'Impulso ativado — FitConnect' };

export default async function BoostSucessoPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id) redirect('/perfil#impulso');
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="size-8 text-emerald-600" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Pagamento confirmado!</h1>
        <p className="mt-2 text-slate-500">
          Seu perfil já está impulsionado. O selo aparecerá nos resultados de busca em instantes.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-800">
          <Zap className="size-4 text-yellow-500" aria-hidden />
          Impulso ativo — boa sorte nas conexões!
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/perfil#impulso"
            className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Ver detalhes do impulso
          </Link>
          <Link
            href="/descobrir"
            className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Explorar alunos
          </Link>
        </div>
      </div>
    </main>
  );
}
