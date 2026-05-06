'use client';

import { AlertCircle, ArrowLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

const PHONE_RE = /(\+?55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}[-.\s]?\d{4}/;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i;
const SOCIAL_RE =
  /(@[\w.]{2,})|(?:whatsapp|telegram|instagram|ig\b|face(?:book)?|fb\b|tiktok|twitter|linkedin|youtube)\s*[:.@/]?\s*[\w./]*/i;

function detectContact(text: string): string | null {
  if (PHONE_RE.test(text)) return 'Não inclua números de telefone.';
  if (EMAIL_RE.test(text)) return 'Não inclua endereços de e-mail.';
  if (SOCIAL_RE.test(text)) return 'Não inclua redes sociais ou @handles.';
  return null;
}

function RegistrationProgress({ pct }: { pct: number }) {
  const labels = ['✓ Acesso', 'Sobre você', 'Serviços'];
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {labels.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: i === 0 ? '100%' : i === 1 ? `${pct}%` : '0%' }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {labels.map((label, i) => (
          <span
            key={i}
            className={`text-[11px] font-semibold ${i === 0 ? 'text-white/60' : i === 1 ? 'text-white' : 'text-white/30'}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ImproveButton({
  text,
  onImproved,
  disabled,
}: {
  text: string;
  onImproved: (v: string) => void;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = useCallback(async () => {
    if (text.trim().length < 20) {
      setErr('Escreva pelo menos 20 caracteres.');
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch('/api/ai/improve-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type: 'bio' }),
      });
      const data = (await res.json()) as { improved?: string; error?: string };
      if (!res.ok || !data.improved) {
        setErr(data.error ?? 'Não foi possível melhorar.');
        return;
      }
      onImproved(data.improved);
    } catch {
      setErr('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }, [text, onImproved]);
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void run()}
        disabled={loading || disabled || text.trim().length < 20}
        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <Loader2 className="size-3 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="size-3" aria-hidden />
        )}
        {loading ? 'Melhorando…' : 'Melhorar com IA'}
      </button>
      {err && <p className="text-[11px] text-red-500">{err}</p>}
    </div>
  );
}

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

type Sub = 1 | 2 | 3;
const TOTAL = 3;

interface PanelConfig {
  accent: string;
  title: string;
  desc: string;
  tips: { warn?: boolean; heading: string; body: string }[];
}

const PANELS: PanelConfig[] = [
  {
    accent: 'Sua',
    title: 'apresentação',
    desc: 'O texto que alunos leem antes de entrar em contato.',
    tips: [
      {
        heading: 'Apresentação diferenciada',
        body: 'Fale sobre sua metodologia, formação e o que te diferencia. Alunos leem antes de entrar em contato.',
      },
      {
        heading: 'Melhore com IA',
        body: 'Escreva um rascunho e clique em "Melhorar com IA" para polir o texto automaticamente.',
      },
      {
        warn: true,
        heading: 'Sem contatos externos',
        body: 'Não inclua telefone, e-mail ou redes sociais. A comunicação deve ocorrer pela plataforma — isso protege você e seus alunos.',
      },
    ],
  },
  {
    accent: 'Suas',
    title: 'credenciais',
    desc: 'Comprove sua experiência e qualificação profissional.',
    tips: [
      {
        heading: 'Experiência importa',
        body: 'Alunos filtram por anos de experiência. Seja honesto — isso cria expectativas realistas.',
      },
      {
        heading: 'CREF transmite confiança',
        body: 'Professores com CREF aparecem com um selo verificado no perfil, aumentando a conversão.',
      },
    ],
  },
  {
    accent: 'Seu',
    title: 'WhatsApp',
    desc: 'Opcional — visível apenas para alunos que agendarem uma sessão.',
    tips: [
      {
        heading: 'Privacidade garantida',
        body: 'O número não é exibido na busca pública — só alunos que já agendaram uma sessão podem ver.',
      },
      {
        heading: 'Campo opcional',
        body: 'Pode pular agora e adicionar depois nas configurações do perfil.',
      },
    ],
  },
];

export function ProfessorStep2Profile({
  redirectTo,
}: {
  initialName?: string;
  redirectTo: string;
}) {
  const router = useRouter();

  const [sub, setSub] = useState<Sub>(1);
  const [bio, setBio] = useState('');
  const [years, setYears] = useState('');
  const [cref, setCref] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const bioContact = detectContact(bio);
  const panel = PANELS[sub - 1];
  const pct = Math.round(((sub - 1) / TOTAL) * 100);

  const canNext =
    sub === 1
      ? bio.trim().length >= 30 && !bioContact
      : sub === 2
        ? years !== '' && !isNaN(parseInt(years, 10)) && parseInt(years, 10) >= 0
        : true;

  function onBack() {
    setError(null);
    if (sub > 1) setSub((s) => (s - 1) as Sub);
    else router.push('/dar-aulas');
  }

  function onNext() {
    setError(null);
    if (sub < TOTAL) setSub((s) => (s + 1) as Sub);
    else void onSave();
  }

  async function onSave() {
    const yrs = parseInt(years, 10);
    if (isNaN(yrs) || yrs < 0 || yrs > 60) {
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
          bio: bio.trim() || undefined,
          yearsExperience: yrs,
          crefNumber: cref.trim() || null,
          phone: phone.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: unknown };
        const msg =
          typeof body.error === 'string'
            ? body.error
            : Array.isArray(body.error)
              ? (body.error as { message?: string }[]).map((i) => i.message).join(', ')
              : 'Não foi possível salvar.';
        setError(msg);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* ── Painel esquerdo ──────────────────────────────────────────────────── */}
      <aside className="flex flex-col gap-6 bg-slate-900 px-6 py-8 text-white lg:w-[38%] lg:px-10 lg:py-12">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-white/50 transition hover:text-white/80"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          {sub === 1 ? 'Voltar' : 'Etapa anterior'}
        </button>

        <RegistrationProgress pct={pct} />

        <div className="mt-2">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            Etapa 2 · {sub} de {TOTAL}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight lg:text-3xl">
            Seu perfil público
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{panel.desc}</p>
        </div>

        <div className="flex flex-col gap-3">
          {panel.tips.map((tip) => (
            <div
              key={tip.heading}
              className={`rounded-2xl border p-4 ${tip.warn ? 'border-amber-400/20 bg-amber-400/5' : 'border-white/10 bg-white/5'}`}
            >
              <p className={`text-sm font-semibold ${tip.warn ? 'text-amber-300' : 'text-white'}`}>
                {tip.heading}
              </p>
              <p className="mt-0.5 text-xs text-white/50">{tip.body}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Painel direito ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col bg-white">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-10 sm:px-10 sm:py-14">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              <span className="text-blue-600">{panel.accent}</span>{' '}
              <span className="text-slate-900">{panel.title}</span>
            </h2>
          </div>

          <div className="flex-1">
            {/* Sub 1: Bio */}
            {sub === 1 && (
              <div>
                <div className="mb-1.5 flex justify-end">
                  <ImproveButton text={bio} onImproved={setBio} disabled={!!bioContact} />
                </div>
                <textarea
                  id="bio"
                  name="bio"
                  rows={8}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={2000}
                  placeholder="Conte sobre sua formação, metodologia e o que te diferencia. Alunos leem esse texto antes de te contatar."
                  className={`${fieldClass} resize-none`}
                  autoFocus
                />
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  <div>
                    {bioContact ? (
                      <p className="flex items-center gap-1 text-xs font-medium text-red-600">
                        <AlertCircle className="size-3 shrink-0" aria-hidden />
                        {bioContact}
                      </p>
                    ) : bio.trim().length >= 30 && bio.length < 100 ? (
                      <p className="text-xs text-amber-600">
                        Bio curta — adicione mais detalhes para aumentar sua visibilidade.
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`shrink-0 text-xs tabular-nums ${bio.length >= 1800 ? 'font-medium text-amber-500' : 'text-slate-400'}`}
                  >
                    {bio.length}/2000
                  </span>
                </div>
                {bio.trim().length < 30 && (
                  <p className="mt-3 text-xs text-slate-400">
                    Mínimo de 30 caracteres para continuar.{' '}
                    <span className="tabular-nums">{Math.max(0, 30 - bio.trim().length)} restantes.</span>
                  </p>
                )}
              </div>
            )}

            {/* Sub 2: Credenciais */}
            {sub === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <label
                    htmlFor="years"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    Anos de experiência <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="years"
                    name="yearsExperience"
                    type="number"
                    min={0}
                    max={60}
                    required
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canNext) onNext();
                    }}
                    placeholder="Ex.: 5"
                    className={`${fieldClass} sm:max-w-[200px]`}
                    autoFocus
                  />
                </div>
                <div>
                  <label
                    htmlFor="cref"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    Número do CREF{' '}
                    <span className="text-[10px] font-normal normal-case text-slate-400">
                      (opcional)
                    </span>
                  </label>
                  <input
                    id="cref"
                    name="crefNumber"
                    type="text"
                    maxLength={30}
                    value={cref}
                    onChange={(e) => setCref(e.target.value)}
                    placeholder="000000-G/SP"
                    className={`${fieldClass} sm:max-w-xs`}
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    Registro no Conselho Regional de Educação Física. Aparece como selo no seu
                    perfil.
                  </p>
                </div>
              </div>
            )}

            {/* Sub 3: WhatsApp */}
            {sub === 3 && (
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  WhatsApp / Celular{' '}
                  <span className="text-[10px] font-normal normal-case text-slate-400">
                    (opcional)
                  </span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void onSave();
                  }}
                  placeholder="(00) 00000-0000"
                  className={`${fieldClass} sm:max-w-sm`}
                  autoFocus
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Visível apenas para alunos que agendarem uma sessão — nunca exibido na busca.
                </p>
              </div>
            )}

            {error && (
              <div
                className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3"
                role="alert"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Navegação */}
          <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!canNext || loading}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {loading ? 'Salvando…' : sub === TOTAL ? 'Continuar para serviços' : 'Próxima'}
              {!loading && sub < TOTAL && <ChevronRight className="size-4" aria-hidden />}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
