import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '../../lib/auth';

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/?${new URLSearchParams({ auth: 'login', callbackUrl: '/perfil' }).toString()}`);
  }

  const { name, email, role } = session.user;
  const initial = (name?.trim()?.charAt(0) || email?.charAt(0) || '?').toUpperCase();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        ← Voltar ao início
      </Link>

      <header className="mt-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Conta e perfil</h1>
        <p className="mt-2 text-slate-600">
          Gerencie como aparece na plataforma e acesse as recomendações de professores.
        </p>
      </header>

      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-inner shadow-blue-800/20"
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-slate-900">{name || 'Conta'}</p>
            <p className="truncate text-sm text-slate-500">{email}</p>
            <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {role === 'PROFESSIONAL' ? 'Professor' : role === 'STUDENT' ? 'Aluno' : role}
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 px-6 py-2">
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Recomendações</p>
              <p className="text-sm text-slate-500">Ver ranking de professores para você</p>
            </div>
            <Link
              href="/descobrir"
              className="mt-2 inline-flex shrink-0 items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:mt-0"
            >
              Encontrar professor
            </Link>
          </div>
          <div className="py-4">
            <p className="text-sm font-semibold text-slate-900">Dados pessoais</p>
            <p className="mt-1 text-sm text-slate-500">
              Em breve você poderá editar nome, telefone e preferências para as recomendações aqui.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
