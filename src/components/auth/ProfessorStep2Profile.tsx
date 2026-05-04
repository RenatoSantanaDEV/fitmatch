'use client';

import Link from 'next/link';
import {
  CheckCircle2,
  Loader2,
  ChevronRight,
  User,
  Phone,
  Award,
  Hash,
  FileText,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

function StepProgress({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Acesso' },
    { n: 2, label: 'Perfil' },
    { n: 3, label: 'Serviços' },
  ];
  return (
    <div className="flex items-start">
      {steps.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        return (
          <div key={s.n} className="flex items-start">
            {i > 0 && (
              <div
                className={`mt-4 h-0.5 w-14 shrink-0 transition-all sm:w-20 ${
                  done ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  done
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : active
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-4 ring-emerald-100'
                      : 'bg-white text-slate-400 ring-2 ring-slate-200'
                }`}
              >
                {done ? <CheckCircle2 className="size-4" aria-hidden /> : s.n}
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  active
                    ? 'text-emerald-700'
                    : done
                      ? 'text-emerald-500'
                      : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
      <div className="flex items-center gap-2.5">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h2>
      </div>
    </div>
  );
}

function FieldLabel({
  children,
  optional,
  htmlFor,
}: {
  children: React.ReactNode;
  optional?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"
    >
      {children}
      {optional && (
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
          opcional
        </span>
      )}
    </label>
  );
}

const baseInput =
  'w-full rounded-xl border border-slate-200 bg-white py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition hover:border-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100';

function IconInput({
  icon,
  id,
  ...props
}: { icon: React.ReactNode; id?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
        {icon}
      </div>
      <input id={id} className={`${baseInput} pl-10 pr-4`} {...props} />
    </div>
  );
}

export function ProfessorStep2Profile({
  initialName = '',
  redirectTo,
}: {
  initialName?: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const { update } = useSession();

  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [crefNumber, setCrefNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length >= 2 && yearsExperience !== '';
  const bioProgress = Math.round((bio.length / 2000) * 100);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const years = parseInt(yearsExperience, 10);
    if (isNaN(years) || years < 0 || years > 60) {
      setError('Informe um valor válido para anos de experiência (0 a 60).');
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
          bio: bio.trim() || undefined,
          yearsExperience: years,
          crefNumber: crefNumber.trim() || null,
          phone: phone.trim() || null,
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
    <main
      className="flex flex-1 flex-col"
      style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #f8fafc 200px, #f8fafc 100%)' }}
    >
      {/* Page header */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-7 sm:px-6">
          <Link
            href="/dar-aulas"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-700"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Voltar
          </Link>

          <div className="mb-7">
            <StepProgress current={2} />
          </div>

          {/* Step 1 success notice */}
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40">
              <CheckCircle2 className="size-4 text-white" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Acesso criado com sucesso!</p>
              <p className="text-xs text-emerald-600">
                Agora vamos preencher seu perfil profissional.
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Sobre você</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Essas informações aparecem no seu perfil público e ajudam alunos a te escolher.
          </p>
        </div>
      </div>

      {/* Form body */}
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">

          {/* Identificação */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              icon={<User className="size-3.5" aria-hidden />}
              title="Identificação"
              iconBg="bg-emerald-100"
              iconColor="text-emerald-700"
            />
            <div className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="name">Nome completo</FieldLabel>
                <IconInput
                  id="name"
                  icon={<User className="size-4" />}
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  placeholder="Como aparecerá no seu perfil"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="phone" optional>
                  WhatsApp / Telefone
                </FieldLabel>
                <IconInput
                  id="phone"
                  icon={<Phone className="size-4" />}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(ev) => setPhone(ev.target.value)}
                  placeholder="(00) 00000-0000"
                />
                <p className="text-xs text-slate-400">
                  Visível apenas para alunos que agendarem sessão com você.
                </p>
              </div>
            </div>
          </div>

          {/* Experiência profissional */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              icon={<Award className="size-3.5" aria-hidden />}
              title="Experiência Profissional"
              iconBg="bg-blue-100"
              iconColor="text-blue-700"
            />
            <div className="flex flex-col gap-5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="yearsExperience">Anos de experiência</FieldLabel>
                  <IconInput
                    id="yearsExperience"
                    icon={<Award className="size-4" />}
                    name="yearsExperience"
                    type="number"
                    min={0}
                    max={60}
                    required
                    value={yearsExperience}
                    onChange={(ev) => setYearsExperience(ev.target.value)}
                    placeholder="Ex.: 5"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="crefNumber" optional>
                    CREF
                  </FieldLabel>
                  <IconInput
                    id="crefNumber"
                    icon={<Hash className="size-4" />}
                    name="crefNumber"
                    type="text"
                    value={crefNumber}
                    onChange={(ev) => setCrefNumber(ev.target.value)}
                    placeholder="000000-G/SP"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor="bio" optional>
                  Apresentação
                </FieldLabel>
                <textarea
                  id="bio"
                  name="bio"
                  rows={5}
                  value={bio}
                  onChange={(ev) => setBio(ev.target.value)}
                  placeholder="Conte sobre sua formação, metodologia de trabalho e o que te diferencia como profissional. Alunos leem esse texto antes de te contatar."
                  className={`${baseInput} min-h-[8rem] resize-y px-4`}
                  maxLength={2000}
                />
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <FileText className="size-3" aria-hidden />
                    Aparece no seu perfil público
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                        style={{ width: `${bioProgress}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-slate-400">
                      {bio.length}/2000
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div
              className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5"
              role="alert"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <ChevronRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            )}
            {loading ? 'Salvando…' : 'Continuar para serviços'}
          </button>

          <p className="text-center text-xs text-slate-400">
            Etapa 2 de 3 · Você pode editar essas informações depois no seu perfil.
          </p>
        </form>
      </div>
    </main>
  );
}
