'use client';

import { SessionModality } from '../../domain/enums/SessionModality';
import Link from 'next/link';
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Monitor,
  RefreshCw,
  DollarSign,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { SESSION_MODALITY_LABELS } from '../../lib/sessionModalityLabels';

interface AreaAtuacao {
  id: string;
  nome: string;
  slug: string;
}

const baseInput =
  'w-full rounded-xl border border-slate-200 bg-white py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition hover:border-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100';

const MODALITY_META: Record<SessionModality, { icon: React.ElementType; description: string }> = {
  [SessionModality.IN_PERSON]: {
    icon: MapPin,
    description: 'Encontros presenciais em academia, parque ou domicílio.',
  },
  [SessionModality.ONLINE]: {
    icon: Monitor,
    description: 'Aulas via videochamada, sem necessidade de deslocamento.',
  },
  [SessionModality.HYBRID]: {
    icon: RefreshCw,
    description: 'Flexibilidade para atender de forma presencial ou online.',
  },
};

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

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
                  active ? 'text-emerald-700' : done ? 'text-emerald-500' : 'text-slate-400'
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

export function ProfessorStep3Services({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  const [areas, setAreas] = useState<AreaAtuacao[]>([]);
  const [areasLoading, setAreasLoading] = useState(true);

  const [selectedAreaIds, setSelectedAreaIds] = useState<Set<string>>(() => new Set());
  const [selectedModalities, setSelectedModalities] = useState<Set<SessionModality>>(
    () => new Set([SessionModality.IN_PERSON]),
  );
  const [locationCity, setLocationCity] = useState('');
  const [locationState, setLocationState] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/areas-atuacao')
      .then((r) => r.json())
      .then((data: AreaAtuacao[]) => setAreas(data))
      .catch(() => setError('Não foi possível carregar as áreas de atuação.'))
      .finally(() => setAreasLoading(false));
  }, []);

  const needsLocation =
    selectedModalities.has(SessionModality.IN_PERSON) ||
    selectedModalities.has(SessionModality.HYBRID);

  const canSubmit = useMemo(
    () => selectedAreaIds.size >= 1 && selectedModalities.size >= 1,
    [selectedAreaIds, selectedModalities],
  );

  function toggleArea(id: string) {
    setSelectedAreaIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const min = priceMin !== '' ? parseInt(priceMin, 10) : undefined;
    const max = priceMax !== '' ? parseInt(priceMax, 10) : undefined;

    if (min !== undefined && (isNaN(min) || min < 0)) {
      setError('Preço mínimo inválido.');
      return;
    }
    if (max !== undefined && (isNaN(max) || max < 0)) {
      setError('Preço máximo inválido.');
      return;
    }
    if (min !== undefined && max !== undefined && max < min) {
      setError('O preço máximo deve ser maior ou igual ao mínimo.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/profile/professional/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          areaIds: [...selectedAreaIds],
          modalities: [...selectedModalities],
          locationCity: locationCity.trim() || undefined,
          locationState: locationState || undefined,
          priceMin: min,
          priceMax: max,
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
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 py-7 sm:px-6">
          <Link
            href="/dar-aulas/completar-perfil"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-700"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Voltar para perfil
          </Link>

          <div className="mb-7">
            <StepProgress current={3} />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Seus serviços</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Informe o que você oferece para que alunos te encontrem mais facilmente.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">

          {/* Modalidades */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Formato de atendimento
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Como você prefere atender seus alunos? Selecione todas que se aplicam.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 p-6">
              {(Object.values(SessionModality) as SessionModality[]).map((m) => {
                const active = selectedModalities.has(m);
                const meta = MODALITY_META[m];
                const Icon = meta.icon;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMod(m)}
                    className={`flex items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left transition ${
                      active
                        ? 'border-emerald-300 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="size-4" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${active ? 'text-emerald-800' : 'text-slate-700'}`}>
                        {SESSION_MODALITY_LABELS[m]}
                      </p>
                      <p className={`text-xs mt-0.5 ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {meta.description}
                      </p>
                    </div>
                    <div
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                        active
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                      aria-hidden
                    >
                      {active ? '✓' : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Localização (condicional) */}
          {needsLocation && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Localização
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Informe onde você atende para que alunos próximos possam te encontrar.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 p-6">
                <label className="col-span-2 flex flex-col gap-1.5 text-sm">
                  <span className="font-semibold text-slate-700">Cidade</span>
                  <input
                    name="locationCity"
                    type="text"
                    value={locationCity}
                    onChange={(ev) => setLocationCity(ev.target.value)}
                    placeholder="Ex.: São Paulo"
                    className={`${baseInput} px-4`}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-semibold text-slate-700">Estado</span>
                  <select
                    name="locationState"
                    value={locationState}
                    onChange={(ev) => setLocationState(ev.target.value)}
                    className={`${baseInput} px-4`}
                  >
                    <option value="">UF</option>
                    {BR_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* Áreas de atuação */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Áreas de atuação
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Selecione as modalidades que você ensina. Pelo menos uma obrigatória.
              </p>
            </div>
            <div className="p-6">
              {areasLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-5 animate-spin text-slate-400" aria-hidden />
                  <span className="ml-2 text-sm text-slate-400">Carregando áreas…</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {areas.map((area) => {
                    const active = selectedAreaIds.has(area.id);
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => toggleArea(area.id)}
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
                        {area.nome}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Preço */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div className="flex items-center gap-2">
                <DollarSign className="size-4 text-slate-400" aria-hidden />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Faixa de preço por sessão
                </h2>
                <span className="ml-auto rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                  opcional
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Ajuda alunos a encontrarem opções dentro do orçamento deles.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 p-6">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-semibold text-slate-700">A partir de (R$)</span>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-slate-400">R$</span>
                  <input
                    name="priceMin"
                    type="number"
                    min={0}
                    max={100000}
                    value={priceMin}
                    onChange={(ev) => setPriceMin(ev.target.value)}
                    placeholder="0"
                    className={`${baseInput} pl-9 pr-4`}
                  />
                </div>
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-semibold text-slate-700">Até (R$)</span>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-slate-400">R$</span>
                  <input
                    name="priceMax"
                    type="number"
                    min={0}
                    max={100000}
                    value={priceMax}
                    onChange={(ev) => setPriceMax(ev.target.value)}
                    placeholder="0"
                    className={`${baseInput} pl-9 pr-4`}
                  />
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <CheckCircle2 className="size-4" aria-hidden />
            )}
            {loading ? 'Salvando…' : 'Concluir e ver meu perfil'}
          </button>

          <p className="text-center text-xs text-slate-400">
            Você poderá editar todas essas informações no seu perfil a qualquer momento.
          </p>
        </form>
      </div>
    </main>
  );
}
