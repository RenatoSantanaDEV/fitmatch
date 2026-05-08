'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import type { CompatibilityResult } from '../../api/compatibility/[professionalId]/route';

/* ──────────────────────────────────────────────── types */

type StudentForm = {
  mainGoal: string;
  level: string;
  preferredModality: string;
  trainerStyle: string;
  frequency: string;
  emotionalGoal: string;
  restrictions: string;
};

type Step = 'idle' | 1 | 2 | 3 | 'loading' | 'result' | 'error';

/* ──────────────────────────────────────── form options */

const GOALS = [
  { id: 'emagrecimento', label: 'Emagrecimento', icon: '🔥' },
  { id: 'hipertrofia', label: 'Hipertrofia', icon: '💪' },
  { id: 'condicionamento', label: 'Condicionamento', icon: '⚡' },
  { id: 'reabilitacao', label: 'Reabilitação', icon: '🏥' },
  { id: 'funcional', label: 'Funcional', icon: '🎯' },
  { id: 'performance', label: 'Performance', icon: '🏆' },
  { id: 'saude_mental', label: 'Saúde Mental', icon: '🧘' },
];

const LEVELS = [
  { id: 'iniciante', label: 'Iniciante', desc: 'Estou começando agora' },
  { id: 'intermediario', label: 'Intermediário', desc: 'Já treino há algum tempo' },
  { id: 'avancado', label: 'Avançado', desc: 'Treino regularmente' },
];

const MODALITIES = [
  { id: 'presencial', label: 'Presencial', icon: '📍' },
  { id: 'online', label: 'Online', icon: '📱' },
  { id: 'hibrido', label: 'Híbrido', icon: '🔄' },
];

const STYLES = [
  { id: 'motivacional', label: 'Motivacional', desc: 'Me incentiva bastante' },
  { id: 'tecnico', label: 'Técnico', desc: 'Foco na execução perfeita' },
  { id: 'rigido', label: 'Disciplinado', desc: 'Exigente e estruturado' },
  { id: 'acolhedor', label: 'Acolhedor', desc: 'Gentil e paciente' },
];

const FREQUENCIES = [
  { id: '2x', label: '2× por semana' },
  { id: '3x', label: '3× por semana' },
  { id: 'diario', label: 'Diário' },
  { id: 'flexivel', label: 'Flexível' },
];

const EMOTIONAL_GOALS = [
  { id: 'saude', label: 'Saúde', icon: '❤️' },
  { id: 'autoestima', label: 'Autoestima', icon: '✨' },
  { id: 'estetica', label: 'Estética', icon: '💫' },
  { id: 'disciplina', label: 'Disciplina', icon: '🎯' },
  { id: 'qualidade_vida', label: 'Qualidade de vida', icon: '🌿' },
];

const LOADING_MESSAGES = [
  'Analisando o perfil do professor…',
  'Comparando com seus objetivos…',
  'Avaliando compatibilidade de estilo…',
  'Calculando score de compatibilidade…',
  'Finalizando análise personalizada…',
];

/* ──────────────────────────────────────── helpers */

function getScoreStyle(score: number) {
  if (score >= 85) return { text: 'text-emerald-600', stroke: 'stroke-emerald-500', bg: 'bg-emerald-50', pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Excelente compatibilidade' };
  if (score >= 70) return { text: 'text-blue-600', stroke: 'stroke-blue-500', bg: 'bg-blue-50', pill: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Boa compatibilidade' };
  if (score >= 50) return { text: 'text-amber-600', stroke: 'stroke-amber-500', bg: 'bg-amber-50', pill: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Compatibilidade moderada' };
  return { text: 'text-rose-600', stroke: 'stroke-rose-500', bg: 'bg-rose-50', pill: 'bg-rose-100 text-rose-700 border-rose-200', label: 'Baixa compatibilidade' };
}

const EMPTY_FORM: StudentForm = {
  mainGoal: '',
  level: '',
  preferredModality: '',
  trainerStyle: '',
  frequency: '',
  emotionalGoal: '',
  restrictions: '',
};

/* ──────────────────────────────────────── sub-components */

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        selected
          ? 'border-violet-500 bg-violet-500 text-white shadow-md shadow-violet-100'
          : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50'
      }`}
    >
      {children}
    </button>
  );
}

function StepBadge({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-6 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
        {current}
      </div>
      <span className="text-xs font-medium text-slate-400">de {total}</span>
    </div>
  );
}

function ScoreCircle({ score, strokeClass }: { score: number; strokeClass: string }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - score / 100);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={130} height={130} className="-rotate-90" aria-hidden>
        <circle cx={65} cy={65} r={R} fill="none" className="stroke-slate-100" strokeWidth={9} />
        <circle
          cx={65}
          cy={65}
          r={R}
          fill="none"
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          className={`${strokeClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold text-slate-900">{score}%</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────── main component */

export function AICompatibilitySection({
  professionalId,
  professionalName,
  isOwnProfile,
}: {
  professionalId: string;
  professionalName: string;
  isOwnProfile: boolean;
}) {
  const [step, setStep] = useState<Step>('idle');
  const [form, setForm] = useState<StudentForm>(EMPTY_FORM);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const firstName = professionalName.split(' ')[0];

  /* Pre-fill from saved student profile */
  useEffect(() => {
    if (step === 'idle') return;
    void (async () => {
      try {
        const res = await fetch('/api/profile/student', { credentials: 'same-origin' });
        if (!res.ok) return;
        const data = (await res.json()) as {
          fitnessGoals: string[];
          experienceLevel: string;
          preferredModality: string;
        } | null;
        if (!data) return;

        const levelMap: Record<string, string> = {
          BEGINNER: 'iniciante',
          INTERMEDIATE: 'intermediario',
          ADVANCED: 'avancado',
        };
        const modalityMap: Record<string, string> = {
          IN_PERSON: 'presencial',
          ONLINE: 'online',
          HYBRID: 'hibrido',
        };

        const mappedGoal = data.fitnessGoals.find((g) => GOALS.some((o) => o.id === g)) ?? '';
        const mappedLevel = levelMap[data.experienceLevel] ?? '';
        const mappedModality = modalityMap[data.preferredModality] ?? '';

        if (mappedGoal || mappedLevel || mappedModality) {
          setForm((f) => ({
            ...f,
            mainGoal: mappedGoal || f.mainGoal,
            level: mappedLevel || f.level,
            preferredModality: mappedModality || f.preferredModality,
          }));
        }
      } catch { /* ignore */ }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step === 'idle' ? null : 'open']);

  /* Loading animation */
  useEffect(() => {
    if (step !== 'loading') return;
    let progress = 0;
    let msgIdx = 0;

    const progressTimer = setInterval(() => {
      progress = Math.min(progress + Math.random() * 14 + 4, 92);
      setLoadingProgress(Math.round(progress));
    }, 600);

    const msgTimer = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, LOADING_MESSAGES.length - 1);
      setLoadingMsgIdx(msgIdx);
    }, 1800);

    return () => {
      clearInterval(progressTimer);
      clearInterval(msgTimer);
    };
  }, [step]);

  async function submitCompatibility() {
    setStep('loading');
    setLoadingProgress(0);
    setLoadingMsgIdx(0);
    setError(null);

    try {
      const res = await fetch(`/api/compatibility/${professionalId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? 'Erro ao analisar compatibilidade.');
      }

      const data = (await res.json()) as CompatibilityResult;
      setResult(data);
      await new Promise<void>((r) => setTimeout(r, 600));
      setLoadingProgress(100);
      await new Promise<void>((r) => setTimeout(r, 300));
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
      setStep('error');
    }
  }

  function reset() {
    setStep('idle');
    setForm(EMPTY_FORM);
    setResult(null);
    setError(null);
  }

  const canStep1 = Boolean(form.mainGoal && form.level);
  const canStep2 = Boolean(form.preferredModality && form.trainerStyle);
  const canStep3 = Boolean(form.frequency && form.emotionalGoal);

  if (isOwnProfile) return null;

  const scoreStyle = result ? getScoreStyle(result.score) : null;

  return (
    <>
      {/* ── Section card ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-indigo-50 to-slate-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-violet-100/50" aria-hidden />
        <div className="pointer-events-none absolute -bottom-8 -left-8 size-28 rounded-full bg-indigo-100/50" aria-hidden />

        <div className="relative flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-200">
            <Brain className="size-6 text-white" aria-hidden />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-violet-900">IA FitMatch: Compatibilidade</h3>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-600">
                Beta
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-violet-700">
              {firstName} é o professor ideal para você? Nossa IA analisa seus objetivos e gera um score de compatibilidade personalizado.
            </p>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:shadow-lg hover:shadow-violet-300 active:scale-95"
            >
              <Sparkles className="size-4" aria-hidden />
              Ver se {firstName} combina com você
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="relative mt-4 flex items-center gap-2 border-t border-violet-100 pt-4 text-xs text-violet-600">
          <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
          <span>Análise personalizada · Baseada em IA · Não substitui decisão humana</span>
        </div>
      </div>

      {/* ── Modal overlay ─────────────────────────────────── */}
      {step !== 'idle' && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && step !== 'loading') reset();
          }}
        >
          <div
            className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            style={{ maxHeight: '92vh' }}
          >
            {/* Modal header */}
            {step !== 'loading' && (
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Brain className="size-5 text-violet-600" aria-hidden />
                  <span className="font-bold text-slate-900">IA FitMatch</span>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Fechar"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            )}

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Step 1: Goal + Level ─────────────────── */}
              {step === 1 && (
                <div className="px-6 py-5">
                  <StepBadge current={1} total={3} />
                  <h3 className="mt-2 text-lg font-bold text-slate-900">Seus objetivos</h3>

                  <div className="mt-5">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Objetivo principal</p>
                    <div className="flex flex-wrap gap-2">
                      {GOALS.map((g) => (
                        <Chip
                          key={g.id}
                          selected={form.mainGoal === g.id}
                          onClick={() => setForm((f) => ({ ...f, mainGoal: g.id }))}
                        >
                          {g.icon} {g.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Nível atual</p>
                    <div className="flex flex-col gap-2">
                      {LEVELS.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, level: l.id }))}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                            form.level === l.id
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-slate-200 hover:border-violet-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-sm font-semibold text-slate-900">{l.label}</span>
                          <span className="text-xs text-slate-500">{l.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end pb-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!canStep1}
                      className="flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-40"
                    >
                      Continuar <ChevronRight className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Modality + Style ──────────────── */}
              {step === 2 && (
                <div className="px-6 py-5">
                  <StepBadge current={2} total={3} />
                  <h3 className="mt-2 text-lg font-bold text-slate-900">Suas preferências</h3>

                  <div className="mt-5">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Como prefere treinar?</p>
                    <div className="flex flex-wrap gap-2">
                      {MODALITIES.map((m) => (
                        <Chip
                          key={m.id}
                          selected={form.preferredModality === m.id}
                          onClick={() => setForm((f) => ({ ...f, preferredModality: m.id }))}
                        >
                          {m.icon} {m.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Que tipo de professor prefere?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {STYLES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, trainerStyle: s.id }))}
                          className={`rounded-xl border p-3 text-left transition-all ${
                            form.trainerStyle === s.id
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-slate-200 hover:border-violet-200 hover:bg-slate-50'
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-900">{s.label}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{s.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between pb-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
                    >
                      ← Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!canStep2}
                      className="flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-40"
                    >
                      Continuar <ChevronRight className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Frequency + Emotional + Restrictions ── */}
              {step === 3 && (
                <div className="px-6 py-5">
                  <StepBadge current={3} total={3} />
                  <h3 className="mt-2 text-lg font-bold text-slate-900">Detalhes finais</h3>

                  <div className="mt-5">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Frequência desejada</p>
                    <div className="flex flex-wrap gap-2">
                      {FREQUENCIES.map((freq) => (
                        <Chip
                          key={freq.id}
                          selected={form.frequency === freq.id}
                          onClick={() => setForm((f) => ({ ...f, frequency: freq.id }))}
                        >
                          {freq.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="mb-3 text-sm font-semibold text-slate-700">O que mais importa para você?</p>
                    <div className="flex flex-wrap gap-2">
                      {EMOTIONAL_GOALS.map((eg) => (
                        <Chip
                          key={eg.id}
                          selected={form.emotionalGoal === eg.id}
                          onClick={() => setForm((f) => ({ ...f, emotionalGoal: eg.id }))}
                        >
                          {eg.icon} {eg.label}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Restrições{' '}
                      <span className="font-normal text-slate-400">(opcional)</span>
                    </p>
                    <textarea
                      placeholder="Ex: lesão no joelho, pouco tempo disponível, orçamento limitado…"
                      value={form.restrictions}
                      onChange={(e) => setForm((f) => ({ ...f, restrictions: e.target.value }))}
                      rows={2}
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
                    >
                      ← Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => void submitCompatibility()}
                      disabled={!canStep3}
                      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg disabled:opacity-40"
                    >
                      <Brain className="size-4" aria-hidden />
                      Analisar compatibilidade
                    </button>
                  </div>

                  <p className="mt-5 pb-2 text-center text-xs text-slate-400">
                    Análise baseada em IA · Não substitui avaliação profissional
                  </p>
                </div>
              )}

              {/* ── Loading ──────────────────────────────────── */}
              {step === 'loading' && (
                <div className="flex flex-col items-center px-6 py-12">
                  <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100">
                    <Brain className="size-10 text-violet-600" aria-hidden />
                    <div className="absolute inset-0 animate-ping rounded-full bg-violet-200 opacity-40" aria-hidden />
                  </div>

                  <h3 className="mt-6 text-center text-base font-bold text-slate-900">
                    Analisando compatibilidade…
                  </h3>
                  <p className="mt-2 min-h-[20px] text-center text-sm text-slate-500">
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </p>

                  <div className="mt-6 w-full max-w-xs">
                    <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                      <span>Processando</span>
                      <span>{loadingProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500 ease-out"
                        style={{ width: `${loadingProgress}%` }}
                      />
                    </div>
                  </div>

                  <p className="mt-8 text-center text-xs text-slate-400">
                    Combinando{' '}
                    <strong>{GOALS.find((g) => g.id === form.mainGoal)?.label ?? 'seus objetivos'}</strong>{' '}
                    com o perfil de {firstName}…
                  </p>
                </div>
              )}

              {/* ── Result ───────────────────────────────────── */}
              {step === 'result' && result && scoreStyle && (
                <div className="flex flex-col">

                  {/* ── Score hero ── */}
                  <div className={`flex flex-col items-center ${scoreStyle.bg} px-6 pb-7 pt-8`}>
                    <ScoreCircle score={result.score} strokeClass={scoreStyle.stroke} />
                    <span
                      className={`mt-4 inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold ${scoreStyle.pill}`}
                    >
                      {scoreStyle.label}
                    </span>
                    <p className="mt-2 text-xs text-slate-500">com {firstName}</p>
                  </div>

                  {/* ── Content ── */}
                  <div className="flex flex-col gap-5 px-6 pb-6 pt-5">

                    {/* Veredicto */}
                    <div className="rounded-xl border-l-[3px] border-violet-400 bg-violet-50 px-4 py-4">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-violet-500">
                        Veredicto da IA
                      </p>
                      <p className="text-sm leading-relaxed text-slate-700">{result.summary}</p>
                    </div>

                    {/* Pros */}
                    {result.pros.length > 0 && (
                      <div>
                        <p className="mb-3 text-sm font-bold text-slate-900">
                          ✅ Por que escolher {firstName}
                        </p>
                        <div className="flex flex-col gap-3">
                          {result.pros.map((pro, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">
                                {i + 1}
                              </span>
                              <p className="text-sm leading-relaxed text-slate-700">{pro}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {result.notes.length > 0 && (
                      <div className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3.5">
                        <Lightbulb className="mt-0.5 size-4 shrink-0 text-blue-500" aria-hidden />
                        <div className="flex flex-col gap-1.5">
                          {result.notes.map((note, i) => (
                            <p key={i} className="text-sm leading-relaxed text-slate-600">{note}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Disclaimer */}
                    <p className="text-center text-xs text-slate-400">
                      Análise por IA · Não substitui avaliação profissional · A decisão é sempre sua
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      <a
                        href="/recomendacoes"
                        className="block rounded-full bg-emerald-600 py-3.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        Entrar em contato com {firstName}
                      </a>
                      <button
                        type="button"
                        onClick={reset}
                        className="flex items-center justify-center gap-2 rounded-full border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                      >
                        <RotateCcw className="size-4" aria-hidden />
                        Refazer análise
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Error ────────────────────────────────────── */}
              {step === 'error' && (
                <div className="flex flex-col items-center px-6 py-10 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-rose-50">
                    <AlertTriangle className="size-8 text-rose-500" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    Não foi possível analisar
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {error ?? 'Erro ao processar a análise. Tente novamente.'}
                  </p>
                  <div className="mt-6 flex flex-col gap-3 pb-2">
                    <button
                      type="button"
                      onClick={() => void submitCompatibility()}
                      className="rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                    >
                      Tentar novamente
                    </button>
                    <button
                      type="button"
                      onClick={reset}
                      className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
