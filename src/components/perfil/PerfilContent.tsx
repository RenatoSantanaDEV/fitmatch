'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Camera, Check, FileText, GraduationCap, IdCard, Loader2, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useId, useLayoutEffect, useState, type ReactNode } from 'react';
import { ProfileAddressSection, type ProfileInitialAddress } from './ProfileAddressSection';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

const sectionCardClass =
  'overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.02]';

const PROFILE_TABS = [
  { id: 'conta' as const, label: 'Conta' },
  { id: 'objetivos' as const, label: 'Objetivos' },
  { id: 'localizacao' as const, label: 'Localização' },
  { id: 'documentos' as const, label: 'Documentos' },
  { id: 'recomendacoes' as const, label: 'Recomendações' },
] as const;

type ProfileTabId = (typeof PROFILE_TABS)[number]['id'];

function isProfileTab(s: string): s is ProfileTabId {
  return PROFILE_TABS.some((t) => t.id === s);
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{children}</p>;
}

function readApiError(data: unknown): string {
  if (!data || typeof data !== 'object' || !('error' in data)) return 'Erro inesperado.';
  const err = (data as { error: unknown }).error;
  if (typeof err === 'string') return err;
  if (Array.isArray(err))
    return err
      .map((e) =>
        typeof e === 'object' && e && 'message' in e
          ? String((e as { message: unknown }).message)
          : String(e),
      )
      .join('; ');
  return 'Erro inesperado.';
}

function StatusBanner({
  msg,
}: {
  msg: { type: 'ok' | 'err'; text: string } | null;
}) {
  if (!msg) return null;
  return (
    <div
      role="status"
      className={
        msg.type === 'ok'
          ? 'flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-900'
          : 'rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-800'
      }
    >
      {msg.type === 'ok' && <Check className="size-4 shrink-0" aria-hidden />}
      {msg.text}
    </div>
  );
}

function readTabFromHash(): ProfileTabId {
  if (typeof window === 'undefined') return 'conta';
  const h = window.location.hash.slice(1);
  return isProfileTab(h) ? h : 'conta';
}

export function PerfilContent({
  initial,
  initialAddress,
  name: initialName,
  email,
  role,
  phone: initialPhone,
  avatarUrl: initialAvatarUrl,
}: {
  initial: string;
  initialAddress: ProfileInitialAddress | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  avatarUrl?: string | null;
}) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialAvatarUrl ?? null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [tab, setTab] = useState<ProfileTabId>('conta');
  const baseId = useId();

  // ── Conta: dados pessoais ─────────────────────────────────────────────────
  const [name, setName] = useState(initialName ?? '');
  const [phone, setPhone] = useState(initialPhone ?? '');

  const nameDirty = name.trim() !== (initialName ?? '').trim();
  const phoneDirty = phone.trim() !== (initialPhone ?? '').trim();
  const accountDirty = nameDirty || phoneDirty;

  const [accountLoading, setAccountLoading] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ── Conta: segurança ──────────────────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ── Objetivos: fitness profile ────────────────────────────────────────────
  type FitnessData = { fitnessGoals: string[]; experienceLevel: string; preferredModality: string };
  const [fitness, setFitness] = useState<FitnessData>({
    fitnessGoals: [],
    experienceLevel: '',
    preferredModality: '',
  });
  const [fitnessInitial, setFitnessInitial] = useState<FitnessData | null>(null);
  const [fitnessLoading, setFitnessLoading] = useState(false);
  const [fitnessFetched, setFitnessFetched] = useState(false);
  const [fitnessMsg, setFitnessMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fitnessDirty =
    fitnessInitial !== null &&
    (JSON.stringify(fitness.fitnessGoals.sort()) !== JSON.stringify([...fitnessInitial.fitnessGoals].sort()) ||
      fitness.experienceLevel !== fitnessInitial.experienceLevel ||
      fitness.preferredModality !== fitnessInitial.preferredModality);

  useEffect(() => {
    if (tab !== 'objetivos' || fitnessFetched) return;
    void (async () => {
      try {
        const res = await fetch('/api/profile/student', { credentials: 'same-origin' });
        if (res.ok) {
          const data = (await res.json()) as FitnessData | null;
          if (data) {
            setFitness(data);
            setFitnessInitial(data);
          } else {
            setFitnessInitial({ fitnessGoals: [], experienceLevel: '', preferredModality: '' });
          }
        }
      } catch { /* ignore */ } finally {
        setFitnessFetched(true);
      }
    })();
  }, [tab, fitnessFetched]);

  const onSaveFitness = useCallback(async () => {
    if (!fitnessDirty) return;
    setFitnessLoading(true);
    setFitnessMsg(null);
    const patch: Record<string, unknown> = {};
    if (fitness.fitnessGoals.length > 0) patch.fitnessGoals = fitness.fitnessGoals;
    if (fitness.experienceLevel) patch.experienceLevel = fitness.experienceLevel;
    if (fitness.preferredModality) patch.preferredModality = fitness.preferredModality;
    try {
      const res = await fetch('/api/profile/student', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.status === 204) {
        setFitnessInitial({ ...fitness });
        setFitnessMsg({ type: 'ok', text: 'Perfil de treino salvo com sucesso.' });
      } else {
        const data = await res.json().catch(() => ({}));
        setFitnessMsg({ type: 'err', text: readApiError(data) });
      }
    } catch {
      setFitnessMsg({ type: 'err', text: 'Não foi possível salvar.' });
    } finally {
      setFitnessLoading(false);
    }
  }, [fitnessDirty, fitness]);

  // ── Tab sync via hash ─────────────────────────────────────────────────────
  useLayoutEffect(() => {
    setTab(readTabFromHash());
  }, []);

  useEffect(() => {
    const onHashChange = () => setTab(readTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (window.location.hash.slice(1) !== tab) {
      window.history.replaceState(null, '', `#${tab}`);
    }
  }, [tab]);

  // ── Photo ─────────────────────────────────────────────────────────────────
  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoLoading(true);
    setPhotoMsg(null);
    const form = new FormData();
    form.append('photo', file);
    try {
      const res = await fetch('/api/profile/photo', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({})) as { url?: string; error?: string };
      if (!res.ok) {
        setPhotoMsg({ type: 'err', text: data.error ?? 'Erro ao enviar foto.' });
      } else {
        setPhotoUrl(data.url ?? null);
        setPhotoMsg({ type: 'ok', text: 'Foto atualizada!' });
      }
    } catch {
      setPhotoMsg({ type: 'err', text: 'Erro ao enviar foto.' });
    } finally {
      setPhotoLoading(false);
    }
  }

  // ── Save: dados pessoais (diff parcial) ───────────────────────────────────
  const onSaveAccount = useCallback(async () => {
    if (!accountDirty) return;

    const patch: Record<string, string | null> = {};
    if (nameDirty) patch.name = name.trim();
    if (phoneDirty) patch.phone = phone.trim() || null;

    setAccountLoading(true);
    setAccountMsg(null);
    try {
      const res = await fetch('/api/profile/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.status === 204) {
        setAccountMsg({ type: 'ok', text: 'Dados atualizados com sucesso.' });
        return;
      }
      const data = await res.json().catch(() => ({}));
      setAccountMsg({ type: 'err', text: readApiError(data) });
    } catch {
      setAccountMsg({ type: 'err', text: 'Não foi possível salvar os dados.' });
    } finally {
      setAccountLoading(false);
    }
  }, [accountDirty, nameDirty, phoneDirty, name, phone]);

  // ── Save: senha ───────────────────────────────────────────────────────────
  const onSavePassword = useCallback(async () => {
    if (!currentPwd || !newPwd) {
      setPwdMsg({ type: 'err', text: 'Preencha a senha atual e a nova senha.' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'err', text: 'A confirmação não coincide com a nova senha.' });
      return;
    }
    if (newPwd.length < 8) {
      setPwdMsg({ type: 'err', text: 'A nova senha deve ter pelo menos 8 caracteres.' });
      return;
    }

    setPwdLoading(true);
    setPwdMsg(null);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      if (res.status === 204) {
        setCurrentPwd('');
        setNewPwd('');
        setConfirmPwd('');
        setPwdMsg({ type: 'ok', text: 'Senha alterada com sucesso.' });
        return;
      }
      const data = await res.json().catch(() => ({}));
      setPwdMsg({ type: 'err', text: readApiError(data) });
    } catch {
      setPwdMsg({ type: 'err', text: 'Não foi possível alterar a senha.' });
    } finally {
      setPwdLoading(false);
    }
  }, [currentPwd, newPwd, confirmPwd]);

  const roleLabel =
    role === 'PROFESSIONAL' ? 'Professor' : role === 'STUDENT' ? 'Aluno' : role ?? '—';

  return (
    <div className="relative flex w-full flex-1 flex-col">
      {/* ── Tab nav ─────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-14 z-[45] w-full border-t border-white/5 bg-neutral-950 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] sm:top-[3.75rem]"
        aria-label="Secções do perfil"
      >
        <div className="mx-auto flex max-w-6xl items-stretch gap-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PROFILE_TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`perfil-tab-${item.id}`}
                role="tab"
                aria-selected={active}
                aria-controls={`perfil-panel-${item.id}`}
                onClick={() => setTab(item.id)}
                className={
                  active
                    ? 'shrink-0 border-b-[3px] border-white px-4 py-3.5 text-sm font-bold text-white transition sm:px-5 sm:py-4 sm:text-[15px]'
                    : 'shrink-0 border-b-[3px] border-transparent px-4 py-3.5 text-sm font-medium text-neutral-400 transition hover:text-white sm:px-5 sm:py-4 sm:text-[15px]'
                }
              >
                {item.label}
                {item.id === 'conta' && accountDirty && (
                  <span className="ml-1.5 inline-block size-1.5 rounded-full bg-blue-400" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="relative mx-auto w-full max-w-3xl flex-1 px-4 py-8 pb-32 sm:px-6 sm:pb-36 lg:py-10 lg:pb-40">
        <header className="mb-6 text-center sm:mb-8 sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Conta e perfil
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-pretty text-slate-600 sm:mx-0">
            Use a barra acima para mudar de secção.
          </p>
        </header>

        {/* ── CONTA ───────────────────────────────────────────────────────── */}
        <div
          id="perfil-panel-conta"
          role="tabpanel"
          aria-labelledby="perfil-tab-conta"
          hidden={tab !== 'conta'}
          className="space-y-8"
        >
          {/* Foto e resumo */}
          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-5 py-6 sm:px-8 sm:py-7">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="relative shrink-0">
                  <div
                    className="flex size-24 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-900/20 ring-4 ring-white sm:size-28 sm:text-3xl"
                    aria-hidden={!!photoUrl}
                  >
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt=""
                        width={112}
                        height={112}
                        className="size-full object-cover"
                        unoptimized
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    id={`${baseId}-photo`}
                    disabled={photoLoading}
                    onChange={onPhotoChange}
                  />
                  <label
                    htmlFor={`${baseId}-photo`}
                    className="absolute -bottom-1 -right-1 flex size-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-md transition hover:bg-slate-800 disabled:opacity-50"
                    title="Alterar foto"
                  >
                    {photoLoading ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Camera className="size-4" aria-hidden />
                    )}
                    <span className="sr-only">Alterar foto do perfil</span>
                  </label>
                </div>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="truncate text-xl font-semibold text-slate-900">{name || 'Conta'}</p>
                  <p className="mt-1 truncate text-sm text-slate-500">{email}</p>
                  <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {roleLabel}
                  </span>
                  {photoMsg ? (
                    <StatusBanner msg={photoMsg} />
                  ) : (
                    <FieldHint>JPEG, PNG ou WebP · máx. 5 MB</FieldHint>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Dados pessoais */}
          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
              <h2 className="text-lg font-semibold text-slate-900">Dados pessoais</h2>
              <p className="mt-1 text-sm text-slate-500">
                Informações usadas para personalizar a sua experiência.
              </p>
            </div>
            <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-7">
              <StatusBanner msg={accountMsg} />

              <div>
                <label htmlFor={`${baseId}-name`} className={labelClass}>
                  Nome completo
                </label>
                <input
                  id={`${baseId}-name`}
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label htmlFor={`${baseId}-phone`} className={labelClass}>
                  Número de celular
                </label>
                <input
                  id={`${baseId}-phone`}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Segurança */}
          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
              <h2 className="text-lg font-semibold text-slate-900">Segurança</h2>
              <p className="mt-1 text-sm text-slate-500">Altere sua senha de acesso.</p>
            </div>
            <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-7">
              <StatusBanner msg={pwdMsg} />

              <div className="space-y-5 sm:max-w-md">
                <div>
                  <label htmlFor={`${baseId}-pwd-current`} className={labelClass}>
                    Senha atual
                  </label>
                  <input
                    id={`${baseId}-pwd-current`}
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor={`${baseId}-pwd-new`} className={labelClass}>
                    Nova senha
                  </label>
                  <input
                    id={`${baseId}-pwd-new`}
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor={`${baseId}-pwd-confirm`} className={labelClass}>
                    Confirmar nova senha
                  </label>
                  <input
                    id={`${baseId}-pwd-confirm`}
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => void onSavePassword()}
                  disabled={pwdLoading || !currentPwd || !newPwd || !confirmPwd}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pwdLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                  Alterar senha
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ── OBJETIVOS ───────────────────────────────────────────────────── */}
        <div
          id="perfil-panel-objetivos"
          role="tabpanel"
          aria-labelledby="perfil-tab-objetivos"
          hidden={tab !== 'objetivos'}
          className="space-y-8"
        >
          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
              <h2 className="text-lg font-semibold text-slate-900">Perfil de treino</h2>
              <p className="mt-1 text-sm text-slate-500">
                Preencha uma vez e a análise de compatibilidade com professores será pré-preenchida automaticamente.
              </p>
            </div>
            <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-7">
              <StatusBanner msg={fitnessMsg} />

              {/* Goals — multi-select */}
              <div>
                <label className={labelClass}>Objetivos de treino</label>
                <p className="mb-3 text-xs text-slate-500">Selecione um ou mais objetivos.</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'emagrecimento', label: '🔥 Emagrecimento' },
                    { id: 'hipertrofia', label: '💪 Hipertrofia' },
                    { id: 'condicionamento', label: '⚡ Condicionamento' },
                    { id: 'reabilitacao', label: '🏥 Reabilitação' },
                    { id: 'funcional', label: '🎯 Funcional' },
                    { id: 'performance', label: '🏆 Performance' },
                    { id: 'saude_mental', label: '🧘 Saúde Mental' },
                  ].map((g) => {
                    const selected = fitness.fitnessGoals.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() =>
                          setFitness((f) => ({
                            ...f,
                            fitnessGoals: selected
                              ? f.fitnessGoals.filter((x) => x !== g.id)
                              : [...f.fitnessGoals, g.id],
                          }))
                        }
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          selected
                            ? 'border-blue-500 bg-blue-500 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Experience level */}
              <div>
                <label className={labelClass}>Nível atual</label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-3">
                  {[
                    { id: 'BEGINNER', label: 'Iniciante', desc: 'Estou começando agora' },
                    { id: 'INTERMEDIATE', label: 'Intermediário', desc: 'Já treino há algum tempo' },
                    { id: 'ADVANCED', label: 'Avançado', desc: 'Treino regularmente' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setFitness((f) => ({ ...f, experienceLevel: l.id }))}
                      className={`flex flex-1 flex-col rounded-xl border p-3 text-left transition-all sm:p-4 ${
                        fitness.experienceLevel === l.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-sm font-semibold text-slate-900">{l.label}</span>
                      <span className="mt-0.5 text-xs text-slate-500">{l.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred modality */}
              <div>
                <label className={labelClass}>Modalidade preferida</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { id: 'IN_PERSON', label: '📍 Presencial' },
                    { id: 'ONLINE', label: '📱 Online' },
                    { id: 'HYBRID', label: '🔄 Híbrido' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setFitness((f) => ({ ...f, preferredModality: m.id }))}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                        fitness.preferredModality === m.id
                          ? 'border-blue-500 bg-blue-500 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── LOCALIZAÇÃO ─────────────────────────────────────────────────── */}
        <div
          id="perfil-panel-localizacao"
          role="tabpanel"
          aria-labelledby="perfil-tab-localizacao"
          hidden={tab !== 'localizacao'}
        >
          <ProfileAddressSection initial={initialAddress} />
        </div>

        {/* ── DOCUMENTOS ──────────────────────────────────────────────────── */}
        <div
          id="perfil-panel-documentos"
          role="tabpanel"
          aria-labelledby="perfil-tab-documentos"
          hidden={tab !== 'documentos'}
          className="space-y-8"
        >
          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
              <h2 className="text-lg font-semibold text-slate-900">Documentos</h2>
              <p className="mt-1 text-sm text-slate-500">
                Envie arquivos para verificação futura na plataforma.
              </p>
            </div>
            <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-7">
              <div>
                <label htmlFor={`${baseId}-id-doc`} className={labelClass}>
                  <span className="inline-flex items-center gap-2">
                    <IdCard className="size-4 text-slate-500" aria-hidden />
                    Documento de identidade
                  </span>
                </label>
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 transition hover:border-slate-300 hover:bg-slate-50">
                  <input
                    id={`${baseId}-id-doc`}
                    name="identityDocument"
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:transition hover:file:bg-blue-700"
                  />
                </div>
                <FieldHint>RG, CNH ou outro documento oficial com foto (PDF ou imagem).</FieldHint>
              </div>

              <div>
                <label htmlFor={`${baseId}-diploma`} className={labelClass}>
                  <span className="inline-flex items-center gap-2">
                    <GraduationCap className="size-4 text-slate-500" aria-hidden />
                    Diploma / comprovante de formação
                  </span>
                </label>
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 transition hover:border-slate-300 hover:bg-slate-50">
                  <input
                    id={`${baseId}-diploma`}
                    name="diploma"
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:transition hover:file:bg-blue-700"
                  />
                </div>
                <FieldHint>
                  Especialmente útil para professores; alunos podem deixar em branco por agora.
                </FieldHint>
              </div>
            </div>
          </section>
        </div>

        {/* ── RECOMENDAÇÕES ───────────────────────────────────────────────── */}
        <div
          id="perfil-panel-recomendacoes"
          role="tabpanel"
          aria-labelledby="perfil-tab-recomendacoes"
          hidden={tab !== 'recomendacoes'}
          className="space-y-6"
        >
          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
                    <Sparkles className="size-6" aria-hidden />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Recomendações por IA</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Lista ordenada por afinidade com o seu perfil, com explicações em português.
                    </p>
                  </div>
                </div>
                <Link
                  href="/recomendacoes"
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  Ver recomendações
                </Link>
              </div>
            </div>
          </section>

          <section className={sectionCardClass}>
            <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <FileText className="size-5" aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Procurar professores</p>
                  <p className="text-sm text-slate-600">Filtre por cidade e especialidade</p>
                </div>
              </div>
              <Link
                href="/descobrir"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
              >
                Abrir busca
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* ── Floating save — aparece nas abas Conta e Objetivos ──────────────── */}
      {(tab === 'conta' || tab === 'objetivos') && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={() => void (tab === 'conta' ? onSaveAccount() : onSaveFitness())}
            disabled={
              tab === 'conta'
                ? accountLoading || !accountDirty
                : fitnessLoading || !fitnessDirty
            }
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-blue-600 px-10 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/40 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {(tab === 'conta' ? accountLoading : fitnessLoading) ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : null}
            {(tab === 'conta' ? accountDirty : fitnessDirty) ? 'Salvar alterações' : 'Sem alterações'}
          </button>
        </div>
      )}
    </div>
  );
}
