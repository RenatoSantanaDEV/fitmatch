'use client';

import { SessionModality } from '../../domain/enums/SessionModality';
import { SpecializationType } from '../../domain/enums/SpecializationType';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMemo, useState } from 'react';
import { SESSION_MODALITY_LABELS } from '../../lib/sessionModalityLabels';
import { SPECIALIZATION_LABELS } from '../../lib/specializationLabels';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100';

const ALL_SPECIALIZATIONS = Object.values(SpecializationType);
const ALL_MODALITIES = Object.values(SessionModality);

export function ProfessorProfileStep({
  redirectTo,
  initialName = '',
}: {
  redirectTo: string;
  initialName?: string;
}) {
  const router = useRouter();
  const { update } = useSession();

  const [name, setName] = useState(initialName);
  const [selectedSpecs, setSelectedSpecs] = useState<Set<SpecializationType>>(() => new Set());
  const [selectedModalities, setSelectedModalities] = useState<Set<SessionModality>>(
    () => new Set([SessionModality.HYBRID]),
  );
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => name.trim().length >= 2 && selectedSpecs.size >= 1 && selectedModalities.size >= 1,
    [name, selectedSpecs, selectedModalities],
  );

  function toggleSpec(s: SpecializationType) {
    setSelectedSpecs((prev) => {
      const n = new Set(prev);
      if (n.has(s)) n.delete(s);
      else n.add(s);
      return n;
    });
  }

  function toggleMod(m: SessionModality) {
    setSelectedModalities((prev) => {
      const n = new Set(prev);
      if (n.has(m)) {
        if (n.size <= 1) return n;
        n.delete(m);
      } else {
        n.add(m);
      }
      return n;
    });
  }

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError('Informe seu nome completo e ao menos uma área de atuação.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/profile/professional', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: name.trim(),
          specializations: [...selectedSpecs],
          modalities: [...selectedModalities],
          bio: bio.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg =
          typeof body.error === 'string'
            ? body.error
            : Array.isArray(body.error)
              ? body.error.map((i: { message?: string }) => i.message).join(', ')
              : 'Não foi possível salvar.';
        setError(msg);
        return;
      }

      await update({ name: name.trim() });
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col bg-slate-50">

      {/* Page header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <Link
            href="/dar-aulas"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-700"
          >
            ← Voltar
          </Link>

          {/* Progress indicator */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600">
              <CheckCircle2 className="size-4 text-white" aria-hidden />
            </div>
            <div className="h-px w-6 bg-emerald-300" />
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
              2
            </div>
            <span className="ml-2 text-xs font-medium text-slate-500">Etapa 2 de 2</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Complete seu perfil profissional
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Seu acesso está criado. Agora informe como você quer aparecer para os alunos.
          </p>
        </div>
      </div>

      {/* Form body */}
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">

          {/* Dados básicos */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
              Dados básicos
            </h2>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-semibold text-slate-700">Nome completo</span>
              <input
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                placeholder="Como aparecerá no seu perfil"
                className={inputClass}
              />
            </label>

            <label className="mt-4 flex flex-col gap-1.5 text-sm">
              <span className="font-semibold text-slate-700">
                Sobre você{' '}
                <span className="font-normal text-slate-400">(opcional)</span>
              </span>
              <textarea
                name="bio"
                rows={3}
                value={bio}
                onChange={(ev) => setBio(ev.target.value)}
                placeholder="Uma ou duas linhas sobre sua experiência ou estilo de trabalho."
                className={`${inputClass} min-h-[5rem] resize-y`}
              />
            </label>

            <label className="mt-4 flex flex-col gap-1.5 text-sm">
              <span className="font-semibold text-slate-700">
                WhatsApp / telefone{' '}
                <span className="font-normal text-slate-400">(opcional)</span>
              </span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(ev) => setPhone(ev.target.value)}
                placeholder="(00) 00000-0000"
                className={inputClass}
              />
            </label>
          </div>

          {/* Áreas de atuação */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
              Áreas de atuação
            </h2>
            <p className="mb-4 text-xs text-slate-500">
              Selecione todas que se aplicam. Pelo menos uma obrigatória.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ALL_SPECIALIZATIONS.map((s) => {
                const active = selectedSpecs.has(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpec(s)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                      active
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
                        active
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300'
                      }`}
                      aria-hidden
                    >
                      {active ? '✓' : ''}
                    </span>
                    {SPECIALIZATION_LABELS[s]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formato das aulas */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
              Formato das aulas
            </h2>
            <p className="mb-4 text-xs text-slate-500">Pelo menos uma opção obrigatória.</p>
            <div className="flex flex-col gap-2">
              {ALL_MODALITIES.map((m) => {
                const active = selectedModalities.has(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMod(m)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                      active
                        ? 'border-violet-300 bg-violet-50 text-violet-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                        active
                          ? 'border-violet-500 bg-violet-500 text-white'
                          : 'border-slate-300'
                      }`}
                      aria-hidden
                    >
                      {active ? '✓' : ''}
                    </span>
                    {SESSION_MODALITY_LABELS[m]}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <ChevronRight className="size-4" aria-hidden />
            )}
            {loading ? 'Salvando…' : 'Concluir e ir ao perfil'}
          </button>
        </form>
      </div>
    </main>
  );
}
