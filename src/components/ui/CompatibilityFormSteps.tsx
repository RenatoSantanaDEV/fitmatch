'use client';

import { ChevronRight } from 'lucide-react';

/* ─────────────────────────────── types */

export type CompatibilityFormData = {
  mainGoal: string;
  level: string;
  preferredModality: string;
  trainerStyle: string;
  frequency: string;
  emotionalGoal: string;
  restrictions: string;
};

export const EMPTY_COMPATIBILITY_FORM: CompatibilityFormData = {
  mainGoal: '',
  level: '',
  preferredModality: '',
  trainerStyle: '',
  frequency: '',
  emotionalGoal: '',
  restrictions: '',
};

export type CompatibilityFormStep = 1 | 2 | 3;

/* ─────────────────────────────── options */

export const COMPATIBILITY_GOALS = [
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

/* ─────────────────────────────── primitives */

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

/* ─────────────────────────────── main component */

interface CompatibilityFormStepsProps {
  step: CompatibilityFormStep;
  form: CompatibilityFormData;
  onFormChange: (form: CompatibilityFormData) => void;
  onStepChange: (step: CompatibilityFormStep) => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  footerNote?: string;
}

export function CompatibilityFormSteps({
  step,
  form,
  onFormChange,
  onStepChange,
  onSubmit,
  submitLabel = 'Verificar compatibilidade',
  submitIcon,
  footerNote,
}: CompatibilityFormStepsProps) {
  const set = (patch: Partial<CompatibilityFormData>) =>
    onFormChange({ ...form, ...patch });

  const canStep1 = Boolean(form.mainGoal && form.level);
  const canStep2 = Boolean(form.preferredModality && form.trainerStyle);
  const canStep3 = Boolean(form.frequency && form.emotionalGoal);

  /* ── Step 1 ── */
  if (step === 1) {
    return (
      <div className="px-6 py-5">
        <StepBadge current={1} total={3} />
        <h3 className="mt-2 text-lg font-bold text-slate-900">Seus objetivos</h3>

        <div className="mt-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">Objetivo principal</p>
          <div className="flex flex-wrap gap-2">
            {COMPATIBILITY_GOALS.map((g) => (
              <Chip key={g.id} selected={form.mainGoal === g.id} onClick={() => set({ mainGoal: g.id })}>
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
                onClick={() => set({ level: l.id })}
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
            onClick={() => onStepChange(2)}
            disabled={!canStep1}
            className="flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-40"
          >
            Continuar <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  /* ── Step 2 ── */
  if (step === 2) {
    return (
      <div className="px-6 py-5">
        <StepBadge current={2} total={3} />
        <h3 className="mt-2 text-lg font-bold text-slate-900">Suas preferências</h3>

        <div className="mt-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">Como prefere treinar?</p>
          <div className="flex flex-wrap gap-2">
            {MODALITIES.map((m) => (
              <Chip key={m.id} selected={form.preferredModality === m.id} onClick={() => set({ preferredModality: m.id })}>
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
                onClick={() => set({ trainerStyle: s.id })}
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
            onClick={() => onStepChange(1)}
            className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
          >
            ← Voltar
          </button>
          <button
            type="button"
            onClick={() => onStepChange(3)}
            disabled={!canStep2}
            className="flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-40"
          >
            Continuar <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  /* ── Step 3 ── */
  return (
    <div className="px-6 py-5">
      <StepBadge current={3} total={3} />
      <h3 className="mt-2 text-lg font-bold text-slate-900">Detalhes finais</h3>

      <div className="mt-5">
        <p className="mb-3 text-sm font-semibold text-slate-700">Frequência desejada</p>
        <div className="flex flex-wrap gap-2">
          {FREQUENCIES.map((freq) => (
            <Chip key={freq.id} selected={form.frequency === freq.id} onClick={() => set({ frequency: freq.id })}>
              {freq.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-slate-700">O que mais importa para você?</p>
        <div className="flex flex-wrap gap-2">
          {EMOTIONAL_GOALS.map((eg) => (
            <Chip key={eg.id} selected={form.emotionalGoal === eg.id} onClick={() => set({ emotionalGoal: eg.id })}>
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
          placeholder="Ex: lesão no joelho, pouco tempo disponível…"
          value={form.restrictions}
          onChange={(e) => set({ restrictions: e.target.value })}
          rows={2}
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
      </div>

      <div className="mt-6 flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={() => onStepChange(2)}
          className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          ← Voltar
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canStep3}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-40"
        >
          {submitIcon}
          {submitLabel}
        </button>
      </div>

      {footerNote && (
        <p className="mt-4 pb-2 text-center text-xs text-slate-400">{footerNote}</p>
      )}
    </div>
  );
}
