'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  Briefcase,
  Clock,
  DollarSign,
  ExternalLink,
  Loader2,
  MapPin,
  MessageSquareText,
  Monitor,
  Star,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import type {
  CounterpartDetailsDTO,
  ProfessionalCounterpartDetailsDTO,
  StudentCounterpartDetailsDTO,
} from '../../application/dtos/chat/ChatDTO';
import { SPECIALIZATION_LABELS } from '../../lib/specializationLabels';
import { SESSION_MODALITY_LABELS } from '../../lib/sessionModalityLabels';
import { SessionModality } from '../../domain/enums/SessionModality';
import { SpecializationType } from '../../domain/enums/SpecializationType';

const EXPERIENCE_LABELS: Record<string, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};

interface Props {
  conversationId: string | null;
  open: boolean;
  onClose: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return (
    parts
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2) || '?'
  );
}

function formatPrice(min: number, max: number, currency: string): string {
  try {
    const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency });
    if (min === max) return fmt.format(min);
    return `${fmt.format(min)} – ${fmt.format(max)}`;
  } catch {
    return `${min} – ${max} ${currency}`;
  }
}

export function CounterpartPanel({ conversationId, open, onClose }: Props) {
  const [data, setData] = useState<CounterpartDetailsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !conversationId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`/api/chat/conversations/${conversationId}/counterpart`, {
      credentials: 'include',
    })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setError('Não foi possível carregar as informações.');
          return;
        }
        const json = (await res.json()) as CounterpartDetailsDTO;
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError('Erro de conexão.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, conversationId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar painel"
        className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-opacity"
      />

      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl"
        role="dialog"
        aria-label="Detalhes do contato"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Detalhes do contato
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex h-full items-center justify-center text-slate-400">
              <Loader2 className="size-5 animate-spin" aria-hidden />
            </div>
          )}

          {error && !loading && (
            <div className="p-6 text-sm text-rose-600">{error}</div>
          )}

          {data && !loading && data.role === 'PROFESSIONAL' && (
            <ProfessionalView data={data} />
          )}
          {data && !loading && data.role === 'STUDENT' && (
            <StudentView data={data} />
          )}
        </div>
      </aside>
    </>
  );
}

function ProfessionalView({ data }: { data: ProfessionalCounterpartDetailsDTO }) {
  const initials = getInitials(data.name);
  return (
    <div className="space-y-6 px-5 py-5">
      <section className="text-center">
        <div className="mx-auto flex size-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xl font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
          {data.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <h3 className="mt-3 flex items-center justify-center gap-1.5 text-base font-semibold tracking-tight text-slate-900">
          {data.name}
          {data.isVerified && (
            <BadgeCheck className="size-4 text-emerald-600" aria-hidden />
          )}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">Profissional</p>
        {data.averageRating != null && (
          <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-600">
            <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
            <span className="font-semibold text-slate-900">
              {data.averageRating.toFixed(1)}
            </span>
            <span>({data.totalReviews})</span>
          </div>
        )}
        <Link
          href={`/perfil/${data.userId}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Ver perfil completo
          <ExternalLink className="size-3.5" aria-hidden />
        </Link>
      </section>

      {data.bio && (
        <Section title="Sobre" icon={MessageSquareText}>
          <p className="text-sm leading-relaxed text-slate-700">{data.bio}</p>
        </Section>
      )}

      {data.areas.length > 0 && (
        <Section title="Áreas de atuação" icon={Briefcase}>
          <div className="flex flex-wrap gap-1.5">
            {data.areas.map((a) => (
              <Chip key={a.id}>{a.nome}</Chip>
            ))}
          </div>
        </Section>
      )}

      {data.modalities.length > 0 && (
        <Section title="Modalidades" icon={Monitor}>
          <div className="flex flex-wrap gap-1.5">
            {data.modalities.map((m) => (
              <Chip key={m}>
                {SESSION_MODALITY_LABELS[m as SessionModality] ?? m}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      <Section title="Valor por sessão" icon={DollarSign}>
        <p className="text-sm font-semibold text-slate-900">
          {formatPrice(data.sessionPrice.min, data.sessionPrice.max, data.sessionPrice.currency)}
        </p>
      </Section>

      {(data.location.city || data.location.state) && (
        <Section title="Localização" icon={MapPin}>
          <p className="text-sm text-slate-700">
            {[data.location.city, data.location.state].filter(Boolean).join(', ')}
          </p>
        </Section>
      )}

      <Section title="Experiência" icon={TrendingUp}>
        <p className="text-sm text-slate-700">
          {data.yearsExperience} ano{data.yearsExperience === 1 ? '' : 's'} de experiência
        </p>
      </Section>

      {data.sessionDurationMinutes && (
        <Section title="Duração padrão" icon={Clock}>
          <p className="text-sm text-slate-700">{data.sessionDurationMinutes} minutos</p>
        </Section>
      )}

      {data.classDynamics && (
        <Section title="Dinâmica das aulas" icon={MessageSquareText}>
          <p className="text-sm leading-relaxed text-slate-700">{data.classDynamics}</p>
        </Section>
      )}
    </div>
  );
}

function StudentView({ data }: { data: StudentCounterpartDetailsDTO }) {
  const initials = getInitials(data.name);
  const hasGoals = data.fitnessGoals.length > 0;
  const hasSpecs = data.preferredSpecializations.length > 0;
  return (
    <div className="space-y-5 px-5 py-5">
      <section className="text-center">
        <div className="mx-auto flex size-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xl font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
          {data.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <h3 className="mt-3 text-base font-semibold tracking-tight text-slate-900">
          {data.name}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">Aluno</p>
      </section>

      {/* Highlight: key info upfront for the professional */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
          Resumo rápido
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-emerald-900">
          <li className="flex items-start gap-2">
            <TrendingUp className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              Nível:{' '}
              <span className="font-semibold">
                {EXPERIENCE_LABELS[data.experienceLevel] ?? data.experienceLevel}
              </span>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Monitor className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              Modalidade preferida:{' '}
              <span className="font-semibold">
                {SESSION_MODALITY_LABELS[data.preferredModality as SessionModality] ??
                  data.preferredModality}
              </span>
            </span>
          </li>
          {data.budgetRange && (
            <li className="flex items-start gap-2">
              <DollarSign className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>
                Orçamento:{' '}
                <span className="font-semibold">
                  {formatPrice(
                    data.budgetRange.min,
                    data.budgetRange.max,
                    data.budgetRange.currency,
                  )}
                </span>
              </span>
            </li>
          )}
          {(data.preferredLocation?.city || data.preferredLocation?.state) && (
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>
                {[data.preferredLocation?.city, data.preferredLocation?.state]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </li>
          )}
        </ul>
      </div>

      {hasGoals && (
        <Section title="Objetivos" icon={Target}>
          <div className="flex flex-wrap gap-1.5">
            {data.fitnessGoals.map((g) => (
              <Chip key={g} variant="goal">
                {g}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {hasSpecs && (
        <Section title="Modalidades de interesse" icon={Briefcase}>
          <div className="flex flex-wrap gap-1.5">
            {data.preferredSpecializations.map((s) => (
              <Chip key={s}>
                {SPECIALIZATION_LABELS[s as SpecializationType] ?? s}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {data.bio && (
        <Section title="Apresentação" icon={MessageSquareText}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {data.bio}
          </p>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <Icon className="size-3.5" aria-hidden />
        {title}
      </h4>
      {children}
    </section>
  );
}

function Chip({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'goal';
}) {
  const cls =
    variant === 'goal'
      ? 'rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'
      : 'rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700';
  return <span className={cls}>{children}</span>;
}
