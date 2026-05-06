'use client';

import { SessionModality } from '../../domain/enums/SessionModality';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Monitor,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

interface AreaAtuacao {
  id: string;
  nome: string;
  slug: string;
}

const MODALITY_META: Record<SessionModality, { Icon: React.ElementType; label: string; description: string }> = {
  [SessionModality.IN_PERSON]: {
    Icon: MapPin,
    label: 'Presencial',
    description: 'Encontros em academia, parque ou domicílio.',
  },
  [SessionModality.ONLINE]: {
    Icon: Monitor,
    label: 'Online',
    description: 'Aulas via videochamada, sem deslocamento.',
  },
  [SessionModality.HYBRID]: {
    Icon: RefreshCw,
    label: 'Híbrido',
    description: 'Flexibilidade para atender presencial ou online.',
  },
};

const BR_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB',
  'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const DURATION_OPTIONS = [30, 45, 60, 90, 120] as const;

function RegistrationProgress({ pct }: { pct: number }) {
  const labels = ['✓ Acesso', '✓ Sobre você', 'Serviços'];
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {labels.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: i < 2 ? '100%' : `${pct}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {labels.map((label, i) => (
          <span
            key={i}
            className={`text-[11px] font-semibold ${i < 2 ? 'text-white/60' : 'text-white'}`}
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
        body: JSON.stringify({ text, type: 'classDynamics' }),
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

type Sub = 1 | 2 | 3 | 4;
const TOTAL = 4;

interface PanelConfig {
  accent: string;
  title: string;
  desc: string;
  tips: { warn?: boolean; icon?: string; heading: string; body: string }[];
}

const PANELS: PanelConfig[] = [
  {
    accent: 'O que',
    title: 'você ensina',
    desc: 'Selecione as modalidades de fitness que você oferece.',
    tips: [
      {
        heading: 'Pelo menos uma obrigatória',
        body: 'Alunos filtram por especialidade. Quanto mais áreas você cadastrar, mais vezes aparecerá nas buscas.',
      },
      {
        heading: 'Múltiplas especialidades',
        body: 'Se você atende musculação e yoga, selecione ambas — você aparecerá em todos esses filtros.',
      },
    ],
  },
  {
    accent: 'Como',
    title: 'você atende',
    desc: 'Presencial, online ou os dois? Alunos filtram por modalidade.',
    tips: [
      {
        icon: '📍',
        heading: 'Localização aumenta visibilidade',
        body: 'Professores com cidade definida aparecem nas buscas por proximidade.',
      },
      {
        heading: 'Híbrido é vantajoso',
        body: 'Oferecer as duas modalidades dobra seu alcance de potenciais alunos.',
      },
    ],
  },
  {
    accent: 'Como é',
    title: 'a sua aula',
    desc: 'Explique a estrutura, duração e metodologia — aumenta muito a taxa de contato.',
    tips: [
      {
        icon: '⏱️',
        heading: 'Duração e metodologia',
        body: 'Alunos querem saber o que esperar antes de entrar em contato. Essa seção aumenta sua taxa de conversão.',
      },
      {
        warn: true,
        heading: 'Sem contatos externos',
        body: 'Não inclua telefone, e-mail ou redes sociais na descrição. A comunicação é feita pela plataforma.',
      },
    ],
  },
  {
    accent: 'Valor',
    title: 'da diária',
    desc: 'Opcional — alunos sabem o que esperar antes de entrar em contato.',
    tips: [
      {
        heading: 'Transparência gera confiança',
        body: 'Perfis com preço definido recebem mais contatos qualificados — alunos sabem o que esperar antes mesmo de te contatar.',
      },
      {
        heading: 'Pode alterar depois',
        body: 'Você pode atualizar o valor a qualquer momento no painel do perfil.',
      },
    ],
  },
];

export function ProfessorStep3Services({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  const [sub, setSub] = useState<Sub>(1);

  // Áreas
  const [allAreas, setAllAreas] = useState<AreaAtuacao[]>([]);
  const [areasLoading, setAreasLoading] = useState(true);
  const [selectedAreaIds, setSelectedAreaIds] = useState<Set<string>>(() => new Set());

  // Modalidades + localização
  const [selectedModalities, setSelectedModalities] = useState<Set<SessionModality>>(
    () => new Set([SessionModality.IN_PERSON]),
  );
  const [locationCity, setLocationCity] = useState('');
  const [locationState, setLocationState] = useState('');

  // Como é a aula
  const [duration, setDuration] = useState<number | null>(null);
  const [customDuration, setCustomDuration] = useState('');
  const [classDynamics, setClassDynamics] = useState('');

  // Preço
  const [price, setPrice] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/areas-atuacao')
      .then((r) => r.json())
      .then((data: AreaAtuacao[]) => setAllAreas(data))
      .catch(() => setError('Não foi possível carregar as áreas de atuação.'))
      .finally(() => setAreasLoading(false));
  }, []);

  const needsLocation =
    selectedModalities.has(SessionModality.IN_PERSON) ||
    selectedModalities.has(SessionModality.HYBRID);

  const classDynamicsContact = detectContact(classDynamics);

  const canNext = useMemo(
    () =>
      sub === 1
        ? selectedAreaIds.size >= 1
        : sub === 2
          ? selectedModalities.size >= 1
          : sub === 3
            ? classDynamics.trim().length >= 30 && !classDynamicsContact
            : true,
    [sub, selectedAreaIds.size, selectedModalities.size, classDynamics, classDynamicsContact],
  );

  const pct = Math.round(((sub - 1) / TOTAL) * 100);
  const panel = PANELS[sub - 1];

  function toggleArea(id: string) {
    setSelectedAreaIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
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

  function resolvedDuration(): number | undefined {
    if (duration === -1) {
      const v = parseInt(customDuration, 10);
      return isNaN(v) ? undefined : v;
    }
    return duration ?? undefined;
  }

  function onBack() {
    setError(null);
    if (sub > 1) setSub((s) => (s - 1) as Sub);
    else router.push('/dar-aulas/completar-perfil');
  }

  function onNext() {
    setError(null);
    if (sub < TOTAL) setSub((s) => (s + 1) as Sub);
    else void onSave();
  }

  async function onSave() {
    if (classDynamicsContact) {
      setError(classDynamicsContact);
      return;
    }
    const priceVal = price !== '' ? parseInt(price, 10) : undefined;
    if (priceVal !== undefined && isNaN(priceVal)) {
      setError('Valor da diária inválido.');
      return;
    }

    setLoading(true);
    try {
      const svcRes = await fetch('/api/profile/professional/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          areaIds: [...selectedAreaIds],
          modalities: [...selectedModalities],
          locationCity: locationCity.trim() || undefined,
          locationState: locationState || undefined,
          priceMin: priceVal,
          priceMax: priceVal,
        }),
      });
      if (!svcRes.ok) {
        const body = (await svcRes.json().catch(() => ({}))) as { error?: unknown };
        const msg =
          typeof body.error === 'string' ? body.error : 'Não foi possível salvar os serviços.';
        setError(msg);
        return;
      }

      const dur = resolvedDuration();
      if (classDynamics.trim() || dur) {
        await fetch('/api/profile/professional', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            classDynamics: classDynamics.trim() || null,
            sessionDurationMinutes: dur ?? null,
          }),
        }).catch(() => {});
      }

      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const selectedAreasList = allAreas.filter((a) => selectedAreaIds.has(a.id));
  const unselectedAreasList = allAreas.filter((a) => !selectedAreaIds.has(a.id));

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
            Etapa 3 · {sub} de {TOTAL}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight lg:text-3xl">
            Seus serviços
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{panel.desc}</p>
        </div>

        <div className="flex flex-col gap-3">
          {panel.tips.map((tip) => (
            <div
              key={tip.heading}
              className={`flex gap-3 rounded-2xl border p-4 ${tip.warn ? 'border-amber-400/20 bg-amber-400/5' : 'border-white/10 bg-white/5'}`}
            >
              {tip.warn ? (
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-400" aria-hidden />
              ) : tip.icon ? (
                <span className="mt-0.5 text-base" aria-hidden>
                  {tip.icon}
                </span>
              ) : null}
              <div>
                <p className={`text-sm font-semibold ${tip.warn ? 'text-amber-300' : 'text-white'}`}>
                  {tip.heading}
                </p>
                <p className="mt-0.5 text-xs text-white/50">{tip.body}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Painel direito ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col bg-white">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-10 sm:px-10 sm:py-14">
          {/* Título */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              <span className="text-blue-600">{panel.accent}</span>{' '}
              <span className="text-slate-900">{panel.title}</span>
            </h2>
          </div>

          {/* Campo(s) */}
          <div className="flex-1">
            {/* Sub 1: Áreas */}
            {sub === 1 && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {areasLoading ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Carregando áreas…
                  </div>
                ) : (
                  <div>
                    {selectedAreasList.map((area) => (
                      <div
                        key={area.id}
                        className="flex items-center justify-between border-b border-slate-100 bg-blue-50 px-4 py-3.5 last:border-0"
                      >
                        <span className="text-sm font-semibold text-blue-800">{area.nome}</span>
                        <button
                          type="button"
                          onClick={() => toggleArea(area.id)}
                          aria-label={`Remover ${area.nome}`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                        >
                          <X className="size-4" aria-hidden />
                        </button>
                      </div>
                    ))}
                    {selectedAreasList.length > 0 && unselectedAreasList.length > 0 && (
                      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          Adicionar mais{' '}
                          <span className="font-normal normal-case">(opcional)</span>
                        </p>
                      </div>
                    )}
                    {unselectedAreasList.map((area) => (
                      <div
                        key={area.id}
                        className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 last:border-0 hover:bg-slate-50"
                      >
                        <span className="text-sm text-slate-700">{area.nome}</span>
                        <button
                          type="button"
                          onClick={() => toggleArea(area.id)}
                          aria-label={`Adicionar ${area.nome}`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                        >
                          <Plus className="size-4" aria-hidden />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub 2: Modalidades + localização */}
            {sub === 2 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  {(Object.values(SessionModality) as SessionModality[]).map((m) => {
                    const active = selectedModalities.has(m);
                    const { Icon, label, description } = MODALITY_META[m];
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMod(m)}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                          active
                            ? 'border-blue-300 bg-blue-50 shadow-sm shadow-blue-100'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Icon className="size-5" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold ${active ? 'text-blue-900' : 'text-slate-800'}`}
                          >
                            {label}
                          </p>
                          <p className={`text-xs ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                            {description}
                          </p>
                        </div>
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                            active ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                          }`}
                          aria-hidden
                        >
                          {active && <CheckCircle2 className="size-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {needsLocation && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Onde você atende presencialmente
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 p-4">
                      <label className="col-span-2 flex flex-col gap-1 text-xs font-semibold text-slate-600">
                        Cidade
                        <input
                          type="text"
                          value={locationCity}
                          onChange={(e) => setLocationCity(e.target.value)}
                          placeholder="Ex.: São Paulo"
                          className={fieldClass}
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                        Estado
                        <select
                          value={locationState}
                          onChange={(e) => setLocationState(e.target.value)}
                          className={fieldClass}
                        >
                          <option value="">UF</option>
                          {BR_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sub 3: Como é a aula */}
            {sub === 3 && (
              <div className="flex flex-col gap-6">
                {/* Duração */}
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <Clock className="size-4 text-slate-400" aria-hidden />
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Duração típica por sessão{' '}
                      <span className="font-normal normal-case text-slate-400">(opcional)</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(DURATION_OPTIONS as readonly number[]).map((min) => (
                      <button
                        key={min}
                        type="button"
                        onClick={() => setDuration(duration === min ? null : min)}
                        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                          duration === min
                            ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {min} min
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setDuration(duration === -1 ? null : -1)}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        duration === -1
                          ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      Outro
                    </button>
                  </div>
                  {duration === -1 && (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={15}
                        max={240}
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        placeholder="Ex.: 75"
                        className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                      <span className="text-sm text-slate-500">minutos</span>
                    </div>
                  )}
                </div>

                {/* Dinâmica */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="classDynamics"
                      className="text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      Metodologia e dinâmica <span className="text-red-500">*</span>
                    </label>
                    <ImproveButton
                      text={classDynamics}
                      onImproved={setClassDynamics}
                      disabled={!!classDynamicsContact}
                    />
                  </div>
                  <textarea
                    id="classDynamics"
                    rows={6}
                    value={classDynamics}
                    onChange={(e) => setClassDynamics(e.target.value)}
                    maxLength={2000}
                    placeholder="Ex.: Começo com avaliação física, monto um treino personalizado e ajusto a carga semana a semana. As aulas têm aquecimento, treino principal e volta à calma."
                    className={`${fieldClass} resize-none`}
                  />
                  <div className="mt-1.5 flex items-start justify-between gap-3">
                    {classDynamicsContact ? (
                      <p className="flex items-center gap-1 text-xs font-medium text-red-600">
                        <AlertCircle className="size-3 shrink-0" aria-hidden />
                        {classDynamicsContact}
                      </p>
                    ) : classDynamics.trim().length < 30 ? (
                      <p className="text-xs text-slate-400">
                        Mínimo de 30 caracteres.{' '}
                        <span className="tabular-nums">{Math.max(0, 30 - classDynamics.trim().length)} restantes.</span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Explique a estrutura da aula, público-alvo e o que o aluno pode esperar.
                      </p>
                    )}
                    <span
                      className={`shrink-0 text-xs tabular-nums ${classDynamics.length >= 1800 ? 'font-medium text-amber-500' : 'text-slate-400'}`}
                    >
                      {classDynamics.length}/2000
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Sub 4: Valor da diária */}
            {sub === 4 && (
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
                  Valor por sessão
                  <div className="relative sm:max-w-[220px]">
                    <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-slate-400">
                      R$
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100000}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') void onSave(); }}
                      placeholder="Ex.: 120"
                      className={`${fieldClass} pl-9`}
                      autoFocus
                    />
                  </div>
                </label>
                <p className="text-xs text-slate-400">
                  Você pode alterar o valor a qualquer momento no painel do perfil.
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
              {loading
                ? 'Salvando…'
                : sub === TOTAL
                  ? 'Concluir e ver meu perfil'
                  : 'Próxima'}
              {!loading && sub < TOTAL && <ChevronRight className="size-4" aria-hidden />}
              {!loading && sub === TOTAL && <CheckCircle2 className="size-4" aria-hidden />}
            </button>
          </div>

          {sub === TOTAL && (
            <p className="mt-3 text-center text-xs text-slate-400">
              Você pode editar todas essas informações no perfil a qualquer momento.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
