'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ChevronRight,
  Lightbulb,
  Loader2,
  RotateCcw,
  Target,
  X,
} from 'lucide-react';
import {
  CompatibilityFormSteps,
  COMPATIBILITY_GOALS,
  EMPTY_COMPATIBILITY_FORM,
  type CompatibilityFormData,
  type CompatibilityFormStep,
} from '../../../components/ui/CompatibilityFormSteps';
import type { CompatibilityResult } from '../../api/compatibility/[professionalId]/route';

type Step = 'idle' | CompatibilityFormStep | 'loading' | 'result' | 'error';

const LOADING_MESSAGES = [
  'Analisando o perfil do professor…',
  'Comparando com seus objetivos…',
  'Avaliando compatibilidade de estilo…',
  'Calculando score de compatibilidade…',
  'Finalizando análise personalizada…',
];

function getScoreStyle(score: number) {
  if (score >= 80) return { text: 'text-emerald-600', stroke: 'stroke-emerald-500', bg: 'bg-emerald-50', pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Excelente compatibilidade' };
  if (score >= 65) return { text: 'text-blue-600', stroke: 'stroke-blue-500', bg: 'bg-blue-50', pill: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Boa compatibilidade' };
  if (score >= 50) return { text: 'text-amber-600', stroke: 'stroke-amber-500', bg: 'bg-amber-50', pill: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Compatibilidade moderada' };
  return { text: 'text-rose-600', stroke: 'stroke-rose-500', bg: 'bg-rose-50', pill: 'bg-rose-100 text-rose-700 border-rose-200', label: 'Baixa compatibilidade' };
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
          cx={65} cy={65} r={R} fill="none" strokeWidth={9} strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={offset}
          className={`${strokeClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold text-slate-900">{score}%</span>
      </div>
    </div>
  );
}

function ResultList({
  title, items, badgeClass, renderBadge,
}: {
  title: string;
  items: string[];
  badgeClass: string;
  renderBadge: (i: number) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-3 text-sm font-bold text-slate-900">{title}</p>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${badgeClass}`}>
              {renderBadge(i)}
            </span>
            <p className="text-sm leading-relaxed text-slate-700">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AICompatibilitySection({
  professionalId,
  professionalName,
  isOwnProfile,
  forceOpen,
  onClose: onExternalClose,
}: {
  professionalId: string;
  professionalName: string;
  isOwnProfile: boolean;
  forceOpen?: boolean;
  onClose?: () => void;
}) {
  const [step, setStep] = useState<Step>('idle');
  const [form, setForm] = useState<CompatibilityFormData>(EMPTY_COMPATIBILITY_FORM);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const firstName = professionalName.split(' ')[0];

  useEffect(() => {
    if (forceOpen && step === 'idle') setStep(1);
  }, [forceOpen, step]);

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
          BEGINNER: 'iniciante', INTERMEDIATE: 'intermediario', ADVANCED: 'avancado',
        };
        const modalityMap: Record<string, string> = {
          IN_PERSON: 'presencial', ONLINE: 'online', HYBRID: 'hibrido',
        };

        const mappedGoal = data.fitnessGoals.find((g) => COMPATIBILITY_GOALS.some((o) => o.id === g)) ?? '';
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

  useEffect(() => {
    if (step !== 'loading') return;
    let msgIdx = 0;
    const msgTimer = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, LOADING_MESSAGES.length - 1);
      setLoadingMsgIdx(msgIdx);
    }, 1800);
    return () => clearInterval(msgTimer);
  }, [step]);

  async function submitCompatibility() {
    setStep('loading');
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
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
      setStep('error');
    }
  }

  function reset() {
    setStep('idle');
    setForm(EMPTY_COMPATIBILITY_FORM);
    setResult(null);
    setError(null);
    onExternalClose?.();
  }

  useEffect(() => {
    if (step === 'idle') return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [step]);

  useEffect(() => {
    if (step === 'idle') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'loading') reset();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (isOwnProfile) return null;

  const scoreStyle = result ? getScoreStyle(result.score) : null;

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <Target className="size-5 text-slate-600" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900">
              Compatibilidade com {firstName}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Veja em quanto {firstName} atende ao seu perfil, objetivos e estilo de treino.
            </p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 active:scale-95"
            >
              Verificar compatibilidade
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
        <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
          Baseado no seu perfil de treino · Não substitui avaliação presencial
        </p>
      </div>

      {step !== 'idle' && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget && step !== 'loading') reset(); }}
        >
          <div className="modal-overlay-enter absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden />

          <div
            className="modal-panel-enter relative z-10 flex w-full flex-col overflow-hidden bg-white shadow-xl
              rounded-t-2xl h-[92dvh] max-h-[92dvh]
              sm:rounded-2xl sm:max-w-4xl sm:h-[88vh] sm:max-h-[88vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="compatibility-modal-title"
          >
            {step !== 'loading' && (
              <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <Target className="size-4 text-emerald-600" aria-hidden />
                  </div>
                  <div>
                    <h2 id="compatibility-modal-title" className="text-sm font-bold text-slate-900">
                      {step === 'result' ? `Compatibilidade com ${firstName}` : 'Compatibilidade'}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {step === 'result'
                        ? 'Análise personalizada com base no seu perfil de treino'
                        : `Informe seus objetivos para verificar o match com ${firstName}.`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Fechar"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

              {(step === 1 || step === 2 || step === 3) && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <CompatibilityFormSteps
                  step={step}
                  form={form}
                  onFormChange={setForm}
                  onStepChange={setStep}
                  onSubmit={() => void submitCompatibility()}
                  onCancel={reset}
                  footerNote="Baseado no seu perfil · Não substitui avaliação presencial"
                />
                </div>
              )}

              {step === 'loading' && (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
                  <div className="flex size-16 items-center justify-center rounded-full bg-slate-100">
                    <Loader2 className="size-8 animate-spin text-slate-500" aria-hidden />
                  </div>
                  <h3 className="mt-6 text-center text-base font-bold text-slate-900">
                    Verificando compatibilidade…
                  </h3>
                  <p className="mt-2 min-h-[20px] text-center text-sm text-slate-500">
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </p>
                  <div className="mt-6 flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full bg-violet-400"
                        style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                      />
                    ))}
                  </div>
                  <p className="mt-8 text-center text-xs text-slate-400">
                    Combinando{' '}
                    <strong>{COMPATIBILITY_GOALS.find((g) => g.id === form.mainGoal)?.label ?? 'seus objetivos'}</strong>{' '}
                    com o perfil de {firstName}…
                  </p>
                </div>
              )}

              {step === 'result' && result && scoreStyle && (
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <div className={`flex flex-col items-center ${scoreStyle.bg} px-6 pb-7 pt-8`}>
                    <ScoreCircle score={result.score} strokeClass={scoreStyle.stroke} />
                    <span className={`mt-4 inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold ${scoreStyle.pill}`}>
                      {scoreStyle.label}
                    </span>
                    <p className="mt-2 text-xs text-slate-500">com {firstName}</p>
                  </div>

                  <div className="flex flex-col gap-5 px-6 pb-6 pt-5">
                    <div className="rounded-xl bg-slate-50 px-4 py-4">
                      <p className="text-sm leading-relaxed text-slate-700">{result.summary}</p>
                    </div>
                    <ResultList
                      title={`Por que escolher ${firstName}`}
                      items={result.pros}
                      badgeClass="bg-emerald-100 text-emerald-700"
                      renderBadge={(i) => i + 1}
                    />
                    <ResultList
                      title="Pontos de atenção"
                      items={result.cons}
                      badgeClass="bg-amber-100 text-amber-700"
                      renderBadge={() => '!'}
                    />
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
                    <p className="text-center text-xs text-slate-400">
                      Baseado no seu perfil · A decisão é sempre sua
                    </p>
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={reset}
                        className="block w-full rounded-full bg-emerald-600 py-3.5 text-center text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        Fechar e ver perfil completo
                      </button>
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

              {step === 'error' && (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-rose-50">
                    <AlertTriangle className="size-8 text-rose-500" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">Não foi possível analisar</h3>
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
