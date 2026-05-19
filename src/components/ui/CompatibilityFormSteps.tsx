'use client';

import {
  Activity,
  ArrowRight,
  ChevronLeft,
  Dumbbell,
  HeartPulse,
  Leaf,
  Lock,
  MapPin,
  Monitor,
  Scale,
  Shuffle,
  Users,
  Zap,
} from 'lucide-react';
import type { ElementType } from 'react';

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

interface GoalOption {
  id: string;
  label: string;
  desc: string;
  icon: ElementType;
}

export const COMPATIBILITY_GOALS: GoalOption[] = [
  { id: 'emagrecimento',   label: 'Emagrecimento',            desc: 'Perder peso e reduzir gordura corporal',         icon: Scale      },
  { id: 'hipertrofia',     label: 'Hipertrofia',              desc: 'Ganho de massa muscular e força',                icon: Dumbbell   },
  { id: 'condicionamento', label: 'Condicionamento físico',   desc: 'Melhorar resistência, disposição e performance', icon: Activity   },
  { id: 'reabilitacao',    label: 'Reabilitação',             desc: 'Recuperação de lesões e melhora da mobilidade',  icon: HeartPulse },
  { id: 'performance',     label: 'Performance esportiva',    desc: 'Melhorar desempenho em esportes e competições',  icon: Zap        },
  { id: 'saude_qualidade', label: 'Saúde e qualidade de vida', desc: 'Mais bem-estar, equilíbrio e longevidade',      icon: Leaf       },
];

const LEVELS = [
  { id: 'iniciante',    label: 'Iniciante',     desc: 'Estou começando agora'         },
  { id: 'intermediario', label: 'Intermediário', desc: 'Já treino há algum tempo'      },
  { id: 'avancado',     label: 'Avançado',      desc: 'Tenho rotina regular de treino' },
];

const MODALITIES = [
  { id: 'presencial', label: 'Presencial', icon: MapPin  },
  { id: 'online',     label: 'Online',     icon: Monitor },
  { id: 'hibrido',    label: 'Híbrido',    icon: Shuffle },
];

const STYLES = [
  { id: 'motivacional', label: 'Motivacional', desc: 'Me incentiva bastante'        },
  { id: 'tecnico',      label: 'Técnico',       desc: 'Foco na execução perfeita'   },
  { id: 'rigido',       label: 'Disciplinado',  desc: 'Exigente e estruturado'      },
  { id: 'acolhedor',    label: 'Acolhedor',     desc: 'Gentil e paciente'           },
];

const FREQUENCIES = [
  { id: '2x',      label: '2× por semana' },
  { id: '3x',      label: '3× por semana' },
  { id: 'diario',  label: 'Diário'        },
  { id: 'flexivel', label: 'Flexível'     },
];

const EMOTIONAL_GOALS = [
  { id: 'saude',          label: 'Saúde'             },
  { id: 'autoestima',     label: 'Autoestima'        },
  { id: 'estetica',       label: 'Estética'          },
  { id: 'disciplina',     label: 'Disciplina'        },
  { id: 'qualidade_vida', label: 'Qualidade de vida' },
];

/* ─────────────────────────────── primitives */

function StepHeader({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">
          Etapa {current} de {total}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function GoalCard({
  option,
  selected,
  onClick,
}: {
  option: GoalOption;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
        selected
          ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200'
          : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40'
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
          selected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
        }`}
      >
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{option.label}</p>
        <p className="mt-0.5 text-xs leading-snug text-slate-500">{option.desc}</p>
      </div>
    </button>
  );
}

function ModalityChip({
  option,
  selected,
  onClick,
}: {
  option: { id: string; label: string; icon: ElementType };
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
        selected
          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/40'
      }`}
    >
      <Icon className="size-4" aria-hidden />
      {option.label}
    </button>
  );
}

function FrequencyChip({
  option,
  selected,
  onClick,
}: {
  option: { id: string; label: string };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
        selected
          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40'
      }`}
    >
      {option.label}
    </button>
  );
}

function StepFooter({
  canAdvance,
  isFirstStep,
  isLastStep,
  onBack,
  onCancel,
  onAdvance,
  submitLabel,
}: {
  canAdvance: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onCancel: () => void;
  onAdvance: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pb-1 pt-4">
      <button
        type="button"
        onClick={isFirstStep ? onCancel : onBack}
        className="flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        {!isFirstStep && <ChevronLeft className="size-4" aria-hidden />}
        {isFirstStep ? 'Cancelar' : 'Voltar'}
      </button>

      <p className="mx-4 hidden text-center text-[11px] leading-tight text-slate-400 sm:block">
        <Lock className="mr-0.5 inline size-3 align-[-1px]" aria-hidden />
        Suas respostas ajudam a ordenar os profissionais mais compatíveis.
      </p>

      <button
        type="button"
        onClick={onAdvance}
        disabled={!canAdvance}
        className="flex shrink-0 items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40 active:scale-[0.98]"
      >
        {isLastStep ? (submitLabel ?? 'Ver recomendações') : 'Continuar'}
        <ArrowRight className="size-4" aria-hidden />
      </button>
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
  onCancel: () => void;
  submitLabel?: string;
  footerNote?: string;
}

export function CompatibilityFormSteps({
  step,
  form,
  onFormChange,
  onStepChange,
  onSubmit,
  onCancel,
  submitLabel,
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
        <StepHeader current={1} total={3} />

        <h3 className="text-lg font-bold text-slate-900">
          Qual é o seu objetivo principal?
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Escolha o objetivo que melhor representa o que você busca neste momento.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {COMPATIBILITY_GOALS.map((g) => (
            <GoalCard
              key={g.id}
              option={g}
              selected={form.mainGoal === g.id}
              onClick={() => set({ mainGoal: g.id })}
            />
          ))}
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-700">Qual é o seu nível atual?</p>
          <p className="mb-3 text-xs text-slate-500">
            Isso nos ajuda a indicar profissionais alinhados ao seu momento.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => set({ level: l.id })}
                className={`flex flex-1 flex-col rounded-xl border px-4 py-3 text-left transition-all ${
                  form.level === l.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      form.level === l.id
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-slate-300 bg-white'
                    }`}
                    aria-hidden
                  />
                  <span className={`text-sm font-semibold ${form.level === l.id ? 'text-emerald-800' : 'text-slate-900'}`}>
                    {l.label}
                  </span>
                </div>
                <span className="mt-1 pl-6 text-xs text-slate-500">{l.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <StepFooter
          canAdvance={canStep1}
          isFirstStep
          isLastStep={false}
          onBack={() => {}}
          onCancel={onCancel}
          onAdvance={() => onStepChange(2)}
        />
      </div>
    );
  }

  /* ── Step 2 ── */
  if (step === 2) {
    return (
      <div className="px-6 py-5">
        <StepHeader current={2} total={3} />

        <h3 className="text-lg font-bold text-slate-900">Suas preferências</h3>
        <p className="mt-1 text-sm text-slate-500">
          Como prefere realizar seus treinos e que perfil de professor busca.
        </p>

        <div className="mt-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">Como prefere treinar?</p>
          <div className="flex flex-wrap gap-2">
            {MODALITIES.map((m) => (
              <ModalityChip
                key={m.id}
                option={m}
                selected={form.preferredModality === m.id}
                onClick={() => set({ preferredModality: m.id })}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Que perfil de professor prefere?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => set({ trainerStyle: s.id })}
                className={`rounded-xl border p-3 text-left transition-all ${
                  form.trainerStyle === s.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50'
                }`}
              >
                <p className={`text-sm font-semibold ${form.trainerStyle === s.id ? 'text-emerald-800' : 'text-slate-900'}`}>
                  {s.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <StepFooter
          canAdvance={canStep2}
          isFirstStep={false}
          isLastStep={false}
          onBack={() => onStepChange(1)}
          onCancel={onCancel}
          onAdvance={() => onStepChange(3)}
        />
      </div>
    );
  }

  /* ── Step 3 ── */
  return (
    <div className="px-6 py-5">
      <StepHeader current={3} total={3} />

      <h3 className="text-lg font-bold text-slate-900">Detalhes finais</h3>
      <p className="mt-1 text-sm text-slate-500">
        Últimas informações para refinar suas recomendações.
      </p>

      <div className="mt-5">
        <p className="mb-3 text-sm font-semibold text-slate-700">Frequência desejada</p>
        <div className="flex flex-wrap gap-2">
          {FREQUENCIES.map((freq) => (
            <FrequencyChip
              key={freq.id}
              option={freq}
              selected={form.frequency === freq.id}
              onClick={() => set({ frequency: freq.id })}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-slate-700">
          O que mais importa para você?
        </p>
        <div className="flex flex-wrap gap-2">
          {EMOTIONAL_GOALS.map((eg) => (
            <FrequencyChip
              key={eg.id}
              option={eg}
              selected={form.emotionalGoal === eg.id}
              onClick={() => set({ emotionalGoal: eg.id })}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Restrições ou observações{' '}
          <span className="font-normal text-slate-400">(opcional)</span>
        </p>
        <textarea
          placeholder="Ex.: lesão no joelho, pouco tempo disponível, prefiro horários matutinos…"
          value={form.restrictions}
          onChange={(e) => set({ restrictions: e.target.value })}
          rows={2}
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <StepFooter
        canAdvance={canStep3}
        isFirstStep={false}
        isLastStep
        onBack={() => onStepChange(2)}
        onCancel={onCancel}
        onAdvance={onSubmit}
        submitLabel={submitLabel}
      />
    </div>
  );
}
