'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MapPin,
  RotateCcw,
  Star,
  Users,
  X,
} from 'lucide-react';
import type { ProfessionalResponseDTO } from '../../application/dtos/professional/ProfessionalDTO';
import { PROFESSIONAL_CARD_GRADIENTS } from '../descobrir/discoverUiConstants';
import { getPersonDisplayInitials } from '../descobrir/discoverFormatters';
import {
  CompatibilityFormSteps,
  COMPATIBILITY_GOALS,
  EMPTY_COMPATIBILITY_FORM,
  type CompatibilityFormData,
  type CompatibilityFormStep,
} from '../../components/ui/CompatibilityFormSteps';

/* ─────────────────────────────── types */

export interface RankingItem {
  professionalId: string;
  score: number;
  reasoning: string;
}

type Step = CompatibilityFormStep | 'loading' | 'results' | 'error';

const LEVEL_TO_FORM: Record<string, string> = {
  BEGINNER: 'iniciante',
  INTERMEDIATE: 'intermediario',
  ADVANCED: 'avancado',
};

const MODALITY_TO_FORM: Record<string, string> = {
  IN_PERSON: 'presencial',
  ONLINE: 'online',
  HYBRID: 'hibrido',
};

export interface StudentProfileHint {
  fitnessGoals?: string[];
  experienceLevel?: string;
  preferredModality?: string;
}

function profileToFormData(p?: StudentProfileHint): Partial<CompatibilityFormData> {
  if (!p) return {};
  return {
    ...(p.fitnessGoals?.[0] ? { mainGoal: p.fitnessGoals[0] } : {}),
    ...(p.experienceLevel ? { level: LEVEL_TO_FORM[p.experienceLevel] ?? '' } : {}),
    ...(p.preferredModality ? { preferredModality: MODALITY_TO_FORM[p.preferredModality] ?? '' } : {}),
  };
}

const LOADING_MESSAGES = [
  'Analisando os profissionais encontrados…',
  'Comparando com seus objetivos…',
  'Avaliando compatibilidade de estilo…',
  'Calculando melhores opções para você…',
  'Finalizando análise personalizada…',
];

const RANK_CONFIG = [
  { badgeBg: 'bg-amber-400', badgeText: 'text-white', ring: 'ring-amber-300' },
  { badgeBg: 'bg-slate-400', badgeText: 'text-white', ring: 'ring-slate-300' },
  { badgeBg: 'bg-orange-400', badgeText: 'text-white', ring: 'ring-orange-300' },
  { badgeBg: 'bg-slate-200', badgeText: 'text-slate-600', ring: 'ring-slate-200' },
  { badgeBg: 'bg-slate-100', badgeText: 'text-slate-500', ring: 'ring-slate-100' },
];

/* ─────────────────────────────── sub-components */

function ScoreRing({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? '#059669' : pct >= 65 ? '#f59e0b' : '#94a3b8';
  const track = pct >= 80 ? '#d1fae5' : pct >= 65 ? '#fef3c7' : '#f1f5f9';
  const textColor = pct >= 80 ? 'text-emerald-700' : pct >= 65 ? 'text-amber-600' : 'text-slate-500';

  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
      <svg width="44" height="44" viewBox="0 0 44 44" aria-label={`${pct}% de compatibilidade`}>
        <circle cx="22" cy="22" r={r} fill="none" stroke={track} strokeWidth="3" />
        <circle
          cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform="rotate(-90 22 22)"
        />
      </svg>
      <span className={`absolute text-[10px] font-extrabold leading-none ${textColor}`}>{pct}%</span>
    </div>
  );
}

function MatchLabel({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  if (pct >= 80)
    return <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Excelente</span>;
  if (pct >= 65)
    return <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Bom match</span>;
  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Compatível</span>;
}

/* ─────────────────────────────── main component */

interface SmartMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalIds: string[];
  professionals: ProfessionalResponseDTO[];
  searchContext: string;
  studentProfile?: StudentProfileHint;
}

export function SmartMatchModal({
  isOpen,
  onClose,
  professionalIds,
  professionals,
  searchContext,
  studentProfile,
}: SmartMatchModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const proMap = new Map(professionals.map((p) => [p.id, p]));

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<CompatibilityFormData>(EMPTY_COMPATIBILITY_FORM);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setForm({ ...EMPTY_COMPATIBILITY_FORM, ...profileToFormData(studentProfile) });
      setRankings([]);
      setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (step !== 'loading') return;
    let idx = 0;
    const t = setInterval(() => {
      idx = Math.min(idx + 1, LOADING_MESSAGES.length - 1);
      setLoadingMsgIdx(idx);
    }, 1800);
    return () => clearInterval(t);
  }, [step]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && step !== 'loading') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  async function submit() {
    setStep('loading');
    setLoadingMsgIdx(0);
    setError(null);
    try {
      const res = await fetch('/api/professionals/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ professionalIds, formData: form }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? 'Erro ao calcular compatibilidade.');
      }
      const body = (await res.json()) as { rankings?: RankingItem[] };
      if (!Array.isArray(body.rankings) || body.rankings.length === 0) {
        throw new Error('Nenhum resultado encontrado para o seu perfil.');
      }
      setRankings(body.rankings);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
      setStep('error');
    }
  }

  const merged = rankings
    .map((r) => ({ ...r, professional: proMap.get(r.professionalId) }))
    .filter((r): r is RankingItem & { professional: ProfessionalResponseDTO } => !!r.professional);

  if (!isOpen) return null;

  const isFormStep = step === 1 || step === 2 || step === 3;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      onClick={(e) => { if (e.target === overlayRef.current && step !== 'loading') onClose(); }}
    >
      <div className="modal-overlay-enter absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-hidden />

      <div
        className="modal-panel-enter relative z-10 flex w-full flex-col overflow-hidden bg-white shadow-xl
          rounded-t-2xl max-h-[92dvh]
          sm:rounded-2xl sm:max-w-4xl sm:max-h-[88vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="smart-modal-title"
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <Users className="size-4 text-emerald-600" aria-hidden />
            </div>
            <div>
              <h2 id="smart-modal-title" className="text-sm font-bold text-slate-900">
                {step === 'results' ? 'Recomendados para você' : 'Encontrar profissionais compatíveis'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {step === 'results'
                  ? `${merged.length} profissional${merged.length !== 1 ? 'is' : ''} selecionados para o seu perfil`
                  : 'Informe seus objetivos e preferências para receber uma seleção personalizada.'}
              </p>
            </div>
          </div>
          {step !== 'loading' && (
            <button
              type="button"
              onClick={onClose}
              className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Fechar"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>

        {/* ── Body ── */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">

          {/* Form steps — shared component */}
          {isFormStep && (
            <CompatibilityFormSteps
              step={step}
              form={form}
              onFormChange={setForm}
              onStepChange={setStep}
              onSubmit={() => void submit()}
              onCancel={onClose}
              submitLabel="Ver recomendações"
              footerNote="Suas respostas ajudam a ordenar os profissionais mais compatíveis."
            />
          )}

          {/* Loading */}
          {step === 'loading' && (
            <div className="flex flex-col items-center px-6 py-14">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50">
                <Loader2 className="size-7 animate-spin text-emerald-600" aria-hidden />
              </div>
              <h3 className="mt-6 text-center text-base font-bold text-slate-900">Analisando compatibilidade…</h3>
              <p className="mt-2 min-h-[20px] text-center text-sm text-slate-500">{LOADING_MESSAGES[loadingMsgIdx]}</p>
              <p className="mt-5 text-center text-xs text-slate-400">
                Combinando <strong>{COMPATIBILITY_GOALS.find((g) => g.id === form.mainGoal)?.label ?? 'seus objetivos'}</strong> com os profissionais encontrados…
              </p>
            </div>
          )}

          {/* Results */}
          {step === 'results' && (
            <>
              <ul className="divide-y divide-slate-50 px-3 py-2">
                {merged.map((item, idx) => {
                  const pro = item.professional;
                  const rank = RANK_CONFIG[idx] ?? RANK_CONFIG[4];
                  const gradient = PROFESSIONAL_CARD_GRADIENTS[idx % PROFESSIONAL_CARD_GRADIENTS.length];
                  const initials = getPersonDisplayInitials(pro.displayName);

                  return (
                    <li key={item.professionalId} className="flex items-center gap-3 py-3.5">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${rank.badgeBg} ${rank.badgeText}`} aria-label={`${idx + 1}º lugar`}>
                        {idx + 1}
                      </div>
                      <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} ring-2 ${rank.ring} ring-offset-1`}>
                        {pro.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/api/profile/avatar/${pro.userId}`} alt={pro.displayName} className="h-full w-full object-cover" />
                        ) : (
                          <span className="select-none text-sm font-extrabold text-white/90">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="truncate text-sm font-extrabold text-slate-900">{pro.displayName}</span>
                          {pro.isVerified && <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" aria-label="Verificado" />}
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="size-2.5 shrink-0" aria-hidden />
                          {pro.location.city}
                          {pro.averageRating != null && (
                            <><span aria-hidden>·</span><Star className="size-2.5 shrink-0 fill-amber-400 text-amber-400" aria-hidden /><span>{pro.averageRating.toFixed(1)}</span></>
                          )}
                        </p>
                        <div className="mt-1.5"><MatchLabel score={item.score} /></div>
                        {item.reasoning && (
                          <p className="mt-1 line-clamp-1 text-[10px] leading-relaxed text-slate-400">{item.reasoning}</p>
                        )}
                      </div>
                      <ScoreRing score={item.score} />
                      <Link
                        href={`/perfil/${pro.userId}`}
                        onClick={onClose}
                        className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
                      >
                        Ver <ArrowRight className="size-3" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-slate-100 px-4 py-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  <ArrowDown className="size-4" aria-hidden />
                  Explorar todos os resultados
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setForm(EMPTY_COMPATIBILITY_FORM); setRankings([]); }}
                  className="flex w-full items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-400 transition hover:text-slate-600"
                >
                  <RotateCcw className="size-3" aria-hidden />
                  Refazer com outros critérios
                </button>
              </div>
            </>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-rose-50">
                <AlertTriangle className="size-8 text-rose-500" aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">Não foi possível analisar</h3>
              <p className="mt-2 text-sm text-slate-500">{error ?? 'Erro ao processar a análise. Tente novamente.'}</p>
              <div className="mt-6 flex flex-col gap-3 pb-2">
                <button type="button" onClick={() => void submit()} className="rounded-md bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                  Tentar novamente
                </button>
                <button type="button" onClick={onClose} className="text-sm font-medium text-slate-500 transition hover:text-slate-700">
                  Fechar
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
