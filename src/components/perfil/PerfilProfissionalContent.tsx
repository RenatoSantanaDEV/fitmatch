'use client';

import { AlertCircle, Camera, Check, Clock, Loader2, MapPin, Monitor, RefreshCw, Sparkles } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import { SessionModality } from '../../domain/enums/SessionModality';
import { ProfileAddressSection, type ProfileInitialAddress } from './ProfileAddressSection';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

const sectionCardClass =
  'overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.02]';

const PROF_TABS = [
  { id: 'conta' as const, label: 'Conta' },
  { id: 'profissional' as const, label: 'Perfil Profissional' },
  { id: 'servicos' as const, label: 'Serviços' },
  { id: 'localizacao' as const, label: 'Localização' },
  { id: 'certificados' as const, label: 'Certificados' },
] as const;

type ProfTabId = (typeof PROF_TABS)[number]['id'];

function isProfTab(s: string): s is ProfTabId {
  return PROF_TABS.some((t) => t.id === s);
}

function FieldHint({ children }: { children: ReactNode }) {
  if (!children) return null;
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

function StatusBanner({ msg }: { msg: { type: 'ok' | 'err'; text: string } | null }) {
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

function readTabFromHash(): ProfTabId {
  if (typeof window === 'undefined') return 'conta';
  const h = window.location.hash.slice(1);
  return isProfTab(h) ? h : 'conta';
}

interface AreaAtuacao {
  id: string;
  nome: string;
  slug: string;
}

const MODALITY_META: Record<SessionModality, { Icon: React.ElementType; description: string }> = {
  [SessionModality.IN_PERSON]: {
    Icon: MapPin,
    description: 'Encontros presenciais em academia, parque ou domicílio.',
  },
  [SessionModality.ONLINE]: {
    Icon: Monitor,
    description: 'Aulas via videochamada, sem necessidade de deslocamento.',
  },
  [SessionModality.HYBRID]: {
    Icon: RefreshCw,
    description: 'Flexibilidade para atender presencial ou online.',
  },
};

const MODALITY_LABELS: Record<SessionModality, string> = {
  [SessionModality.IN_PERSON]: 'Presencial',
  [SessionModality.ONLINE]: 'Online',
  [SessionModality.HYBRID]: 'Híbrido',
};

const BR_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const DURATION_OPTIONS = [30, 45, 60, 90, 120] as const;

const PHONE_RE = /(\+?55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}[-.\s]?\d{4}/;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i;
const SOCIAL_RE = /(@[\w.]{2,})|(?:whatsapp|telegram|instagram|ig\b|face(?:book)?|fb\b|tiktok|twitter|linkedin|youtube)\s*[:.@/]?\s*[\w./]*/i;

function detectContact(text: string): string | null {
  if (PHONE_RE.test(text)) return 'Não inclua números de telefone.';
  if (EMAIL_RE.test(text)) return 'Não inclua endereços de e-mail.';
  if (SOCIAL_RE.test(text)) return 'Não inclua redes sociais ou @handles.';
  return null;
}

function ImproveButton({ text, type, name, onImproved, disabled }: {
  text: string; type: 'bio' | 'classDynamics'; name?: string; onImproved: (v: string) => void; disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = useCallback(async () => {
    if (text.trim().length < 20) { setErr('Escreva pelo menos 20 caracteres.'); return; }
    setLoading(true); setErr(null);
    try {
      const res = await fetch('/api/ai/improve-text', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, type, name }) });
      const data = await res.json().catch(() => ({})) as { improved?: string; error?: string };
      if (!res.ok || !data.improved) { setErr(data.error ?? 'Não foi possível melhorar o texto.'); return; }
      onImproved(data.improved);
    } catch { setErr('Erro de conexão.'); } finally { setLoading(false); }
  }, [text, type, name, onImproved]);
  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" onClick={() => void run()} disabled={loading || disabled || text.trim().length < 20}
        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40">
        {loading ? <Loader2 className="size-3 animate-spin" aria-hidden /> : <Sparkles className="size-3" aria-hidden />}
        {loading ? 'Melhorando…' : 'Melhorar com IA'}
      </button>
      {err && <p className="text-[11px] text-red-500">{err}</p>}
    </div>
  );
}

export function PerfilProfissionalContent({
  initial,
  initialAddress,
  name: initialName,
  email,
  phone: initialPhone,
  avatarUrl: initialAvatarUrl,
  bio: initialBio,
  crefNumber: initialCref,
  yearsExperience: initialYears,
  isAcceptingClients: initialAccepting,
  modalities: initialModalitiesProp,
  selectedAreaIds: initialAreaIdsProp,
  priceMin: initialPriceMinNum,
  priceMax: _initialPriceMaxNum,
  locationCity: initialLocationCity,
  locationState: initialLocationState,
  classDynamics,
  sessionDurationMinutes,
}: {
  initial: string;
  initialAddress: ProfileInitialAddress | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl?: string | null;
  bio: string;
  crefNumber: string | null;
  yearsExperience: number;
  isAcceptingClients: boolean;
  modalities: SessionModality[];
  selectedAreaIds: string[];
  priceMin: number;
  priceMax: number;
  locationCity: string;
  locationState: string;
  classDynamics: string | null;
  sessionDurationMinutes: number | null;
}) {
  const [tab, setTab] = useState<ProfTabId>('conta');
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialAvatarUrl ?? null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const baseId = useId();

  // ── Conta: dados pessoais ─────────────────────────────────────────────────
  const [name, setName] = useState(initialName ?? '');
  const [phone, setPhone] = useState(initialPhone ?? '');
  const nameDirty = name.trim() !== (initialName ?? '').trim();
  const phoneDirty = phone.trim() !== (initialPhone ?? '').trim();
  const accountDirty = nameDirty || phoneDirty;
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ── Conta: senha ──────────────────────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ── Perfil Profissional ───────────────────────────────────────────────────
  const [bio, setBio] = useState(initialBio);
  const [cref, setCref] = useState(initialCref ?? '');
  const [years, setYears] = useState(initialYears);
  const [accepting, setAccepting] = useState(initialAccepting);
  const [classDyn, setClassDyn] = useState(classDynamics ?? '');
  const [duration, setDuration] = useState<number | null>(sessionDurationMinutes ?? null);
  const [customDuration, setCustomDuration] = useState('');
  const bioDirty = bio !== initialBio;
  const crefDirty = cref !== (initialCref ?? '');
  const yearsDirty = years !== initialYears;
  const acceptingDirty = accepting !== initialAccepting;
  const classDynDirty = classDyn !== (classDynamics ?? '');
  const durationDirty = (duration === -1 ? (parseInt(customDuration, 10) || null) : duration) !== sessionDurationMinutes;
  const professionalDirty = bioDirty || crefDirty || yearsDirty || acceptingDirty || classDynDirty || durationDirty;
  const bioContact = detectContact(bio);
  const classDynContact = detectContact(classDyn);
  const [profLoading, setProfLoading] = useState(false);
  const [profMsg, setProfMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [allAreas, setAllAreas] = useState<AreaAtuacao[]>([]);
  const [areasLoading, setAreasLoading] = useState(true);
  const [selectedAreaIds, setSelectedAreaIds] = useState<Set<string>>(
    () => new Set(initialAreaIdsProp),
  );
  const [selectedModalities, setSelectedModalities] = useState<Set<SessionModality>>(
    () => new Set(initialModalitiesProp),
  );
  const normInitialPrice = initialPriceMinNum > 0 ? String(initialPriceMinNum) : '';
  const [price, setPrice] = useState(normInitialPrice);
  const [svcCity, setSvcCity] = useState(initialLocationCity);
  const [svcState, setSvcState] = useState(initialLocationState);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesMsg, setServicesMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const initialAreaIdsRef = useRef(new Set(initialAreaIdsProp));
  const initialModalitiesRef = useRef(new Set(initialModalitiesProp));

  const areasDirty = useMemo(() => {
    if (selectedAreaIds.size !== initialAreaIdsRef.current.size) return true;
    for (const id of selectedAreaIds) {
      if (!initialAreaIdsRef.current.has(id)) return true;
    }
    return false;
  }, [selectedAreaIds]);

  const modalitiesDirty = useMemo(() => {
    if (selectedModalities.size !== initialModalitiesRef.current.size) return true;
    for (const m of selectedModalities) {
      if (!initialModalitiesRef.current.has(m)) return true;
    }
    return false;
  }, [selectedModalities]);

  const servicesDirty =
    areasDirty ||
    modalitiesDirty ||
    price !== normInitialPrice ||
    svcCity !== initialLocationCity ||
    svcState !== initialLocationState;

  const canSaveServices = selectedAreaIds.size >= 1 && selectedModalities.size >= 1;

  const needsLocation =
    selectedModalities.has(SessionModality.IN_PERSON) ||
    selectedModalities.has(SessionModality.HYBRID);

  // Load areas from API
  useEffect(() => {
    fetch('/api/areas-atuacao')
      .then((r) => r.json())
      .then((data: AreaAtuacao[]) => setAllAreas(data))
      .catch(() => {})
      .finally(() => setAreasLoading(false));
  }, []);

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

  // ── Certificados ─────────────────────────────────────────────────────────
  type Cert = {
    id: string;
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate: string | null;
    documentUrl: string | null;
    isVerified: boolean;
  };
  const [certs, setCerts] = useState<Cert[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);
  const [certsMsg, setCertsMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [certForm, setCertForm] = useState<{
    name: string;
    issuingBody: string;
    issueDate: string;
    expiryDate: string;
  } | null>(null);
  const [certSaving, setCertSaving] = useState(false);
  const [docUploading, setDocUploading] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== 'certificados' || certsLoading) return;
    setCertsLoading(true);
    fetch('/api/profile/professional/certificates')
      .then((r) => r.json())
      .then((data: Cert[]) => setCerts(data))
      .catch(() => setCertsMsg({ type: 'err', text: 'Erro ao carregar certificados.' }))
      .finally(() => setCertsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function onAddCert() {
    if (!certForm) return;
    setCertSaving(true);
    setCertsMsg(null);
    try {
      const res = await fetch('/api/profile/professional/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: certForm.name,
          issuingBody: certForm.issuingBody,
          issueDate: certForm.issueDate,
          expiryDate: certForm.expiryDate || null,
        }),
      });
      const data = await res.json().catch(() => ({})) as Cert & { error?: string };
      if (!res.ok) {
        setCertsMsg({ type: 'err', text: (data as { error?: string }).error ?? 'Erro ao salvar.' });
      } else {
        setCerts((prev) => [data, ...prev]);
        setCertForm(null);
        setCertsMsg({ type: 'ok', text: 'Certificado adicionado.' });
      }
    } catch {
      setCertsMsg({ type: 'err', text: 'Erro ao salvar certificado.' });
    } finally {
      setCertSaving(false);
    }
  }

  async function onDeleteCert(id: string) {
    setCertsMsg(null);
    try {
      const res = await fetch(`/api/profile/professional/certificates/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        setCerts((prev) => prev.filter((c) => c.id !== id));
      } else {
        setCertsMsg({ type: 'err', text: 'Erro ao remover certificado.' });
      }
    } catch {
      setCertsMsg({ type: 'err', text: 'Erro ao remover certificado.' });
    }
  }

  async function onUploadDocument(certId: string, file: File) {
    setDocUploading(certId);
    const form = new FormData();
    form.append('document', file);
    try {
      const res = await fetch(`/api/profile/professional/certificates/${certId}/document`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json().catch(() => ({})) as { url?: string; error?: string };
      if (!res.ok) {
        setCertsMsg({ type: 'err', text: data.error ?? 'Erro ao enviar documento.' });
      } else {
        setCerts((prev) =>
          prev.map((c) => (c.id === certId ? { ...c, documentUrl: data.url ?? null } : c)),
        );
        setCertsMsg({ type: 'ok', text: 'Documento enviado.' });
      }
    } catch {
      setCertsMsg({ type: 'err', text: 'Erro ao enviar documento.' });
    } finally {
      setDocUploading(null);
    }
  }

  function toggleArea(id: string) {
    setSelectedAreaIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function toggleModality(m: SessionModality) {
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

  const onSaveProfessional = useCallback(async () => {
    if (!professionalDirty) return;
    setProfLoading(true);
    setProfMsg(null);
    try {
      const res = await fetch('/api/profile/professional', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: bio.trim() || undefined,
          yearsExperience: years,
          crefNumber: cref.trim() || null,
          isAcceptingClients: accepting,
          classDynamics: classDyn.trim() || null,
          sessionDurationMinutes: duration === -1
            ? (parseInt(customDuration, 10) || null)
            : duration,
        }),
      });
      if (res.status === 204) {
        setProfMsg({ type: 'ok', text: 'Perfil profissional atualizado.' });
        return;
      }
      const data = await res.json().catch(() => ({}));
      setProfMsg({ type: 'err', text: readApiError(data) });
    } catch {
      setProfMsg({ type: 'err', text: 'Não foi possível salvar o perfil.' });
    } finally {
      setProfLoading(false);
    }
  }, [
    professionalDirty,
    bio,
    years,
    cref,
    accepting,
    classDyn,
    duration,
    customDuration,
  ]);

  // ── Save: serviços ────────────────────────────────────────────────────────
  const onSaveServices = useCallback(async () => {
    const priceVal = price !== '' ? parseInt(price, 10) : undefined;
    if (priceVal !== undefined && isNaN(priceVal)) {
      setServicesMsg({ type: 'err', text: 'Valor da diária inválido.' });
      return;
    }

    setServicesLoading(true);
    setServicesMsg(null);
    try {
      const res = await fetch('/api/profile/professional/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          areaIds: [...selectedAreaIds],
          modalities: [...selectedModalities],
          locationCity: svcCity.trim() || undefined,
          locationState: svcState || undefined,
          priceMin: priceVal,
          priceMax: priceVal,
        }),
      });
      if (res.status === 204) {
        initialAreaIdsRef.current = new Set(selectedAreaIds);
        initialModalitiesRef.current = new Set(selectedModalities);
        setServicesMsg({ type: 'ok', text: 'Serviços atualizados com sucesso.' });
        return;
      }
      const data = await res.json().catch(() => ({}));
      setServicesMsg({ type: 'err', text: readApiError(data) });
    } catch {
      setServicesMsg({ type: 'err', text: 'Não foi possível salvar os serviços.' });
    } finally {
      setServicesLoading(false);
    }
  }, [selectedAreaIds, selectedModalities, price, svcCity, svcState]);

  return (
    <div className="relative flex w-full flex-1 flex-col">
      {/* ── Tab nav ─────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-14 z-[45] w-full border-t border-white/5 bg-neutral-950 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] sm:top-[3.75rem]"
        aria-label="Secções do perfil"
      >
        <div className="mx-auto flex max-w-6xl items-stretch gap-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PROF_TABS.map((item) => {
            const active = tab === item.id;
            const dirty =
              item.id === 'conta'
                ? accountDirty
                : item.id === 'profissional'
                  ? professionalDirty
                  : item.id === 'servicos'
                    ? servicesDirty
                    : false;
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
                {dirty && (
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

        <div
          id="perfil-panel-conta"
          role="tabpanel"
          aria-labelledby="perfil-tab-conta"
          hidden={tab !== 'conta'}
          className="space-y-8"
        >
          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-5 py-6 sm:px-8 sm:py-7">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="relative shrink-0">
                  <div className="flex size-24 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-900/20 ring-4 ring-white sm:size-28 sm:text-3xl">
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
                    className="absolute -bottom-1 -right-1 flex size-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-md transition hover:bg-slate-800"
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
                  <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Professor
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

          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
              <h2 className="text-lg font-semibold text-slate-900">Dados pessoais</h2>
              <p className="mt-1 text-sm text-slate-500">Nome e telefone de contato.</p>
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
                  WhatsApp / Celular
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
                <FieldHint>Usado para contato inicial com alunos interessados.</FieldHint>
              </div>
            </div>
          </section>

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

        <div
          id="perfil-panel-profissional"
          role="tabpanel"
          aria-labelledby="perfil-tab-profissional"
          hidden={tab !== 'profissional'}
          className="space-y-8"
        >
          <StatusBanner msg={profMsg} />

          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
              <h2 className="text-lg font-semibold text-slate-900">Apresentação</h2>
              <p className="mt-1 text-sm text-slate-500">
                Sua bio pública — aparece no seu card de busca e perfil.
              </p>
            </div>
            <div className="px-5 py-6 sm:px-8 sm:py-7">
              <label htmlFor={`${baseId}-bio`} className={labelClass}>
                Bio / Descrição
              </label>
              <textarea
                id={`${baseId}-bio`}
                name="bio"
                rows={5}
                maxLength={2000}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte sobre sua experiência, metodologia e o que os alunos podem esperar das suas aulas…"
                className={`${inputClass} resize-none`}
              />
              <div className="mt-1.5 flex items-start justify-between gap-3">
                <p className="text-xs leading-relaxed text-amber-600">
                  {bio.trim().length === 0
                    ? 'Sem bio, seu perfil terá menos visibilidade na busca.'
                    : bio.trim().length < 50
                      ? 'Bio muito curta — adicione mais detalhes para aumentar sua visibilidade.'
                      : null}
                </p>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={`text-xs ${bio.length >= 1800 ? 'text-amber-600 font-medium' : 'text-slate-400'}`}
                  >
                    {bio.length} / 2000
                  </span>
                  <ImproveButton
                    text={bio}
                    type="bio"
                    name={name ?? undefined}
                    onImproved={setBio}
                    disabled={!!bioContact}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
              <h2 className="text-lg font-semibold text-slate-900">Credenciais</h2>
              <p className="mt-1 text-sm text-slate-500">
                Experiência e registro profissional.
              </p>
            </div>
            <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-7">
              <div>
                <label htmlFor={`${baseId}-years`} className={labelClass}>
                  Anos de experiência
                </label>
                <input
                  id={`${baseId}-years`}
                  name="yearsExperience"
                  type="number"
                  min={0}
                  max={60}
                  value={years}
                  onChange={(e) =>
                    setYears(Math.max(0, Math.min(60, parseInt(e.target.value, 10) || 0)))
                  }
                  className={`${inputClass} sm:max-w-[180px]`}
                />
                <FieldHint>Número inteiro entre 0 e 60.</FieldHint>
              </div>

              <div>
                <label htmlFor={`${baseId}-cref`} className={labelClass}>
                  Número do CREF{' '}
                  <span className="text-xs font-normal text-slate-400">(opcional)</span>
                </label>
                <input
                  id={`${baseId}-cref`}
                  name="crefNumber"
                  type="text"
                  maxLength={30}
                  placeholder="Ex.: 012345-G/SP"
                  value={cref}
                  onChange={(e) => setCref(e.target.value)}
                  className={`${inputClass} sm:max-w-xs`}
                />
                <FieldHint>
                  Registro no Conselho Regional de Educação Física. Exibido no seu perfil para
                  transmitir credibilidade aos alunos.
                </FieldHint>
              </div>
            </div>
          </section>

          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
              <h2 className="text-lg font-semibold text-slate-900">Disponibilidade</h2>
              <p className="mt-1 text-sm text-slate-500">
                Controle se você aparece nos resultados de busca.
              </p>
            </div>
            <div className="px-5 py-6 sm:px-8 sm:py-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Aceitando novos alunos</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {accepting
                      ? 'Seu perfil aparece nas buscas e alunos podem solicitar aulas.'
                      : 'Seu perfil fica oculto nas buscas — útil quando a agenda está cheia.'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={accepting}
                  onClick={() => setAccepting(!accepting)}
                  className={`relative ml-4 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
                    accepting ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      accepting ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                  <span className="sr-only">
                    {accepting ? 'Desativar aceitação de alunos' : 'Ativar aceitação de alunos'}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Como é a aula */}
          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
              <h2 className="text-lg font-semibold text-slate-900">Como é a aula</h2>
              <p className="mt-1 text-sm text-slate-500">
                Descreva sua metodologia, ritmo e estrutura — ajuda alunos a decidirem.
              </p>
            </div>
            <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-7">
              {/* Duração */}
              <div>
                <label className={labelClass}>
                  <Clock className="mr-1.5 inline size-3.5 text-slate-400" aria-hidden />
                  Duração da sessão
                  <span className="ml-1 text-xs font-normal text-slate-400">(opcional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {(DURATION_OPTIONS as readonly number[]).map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setDuration(duration === min ? null : min)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                        duration === min
                          ? 'border-blue-400 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {min} min
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDuration(duration === -1 ? null : -1)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                      duration === -1
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
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
                      className={`${inputClass} sm:max-w-[140px]`}
                    />
                    <span className="text-sm text-slate-500">minutos</span>
                  </div>
                )}
              </div>

              {/* Dinâmica da aula */}
              <div>
                <label htmlFor={`${baseId}-class-dyn`} className={labelClass}>
                  Dinâmica da aula
                  <span className="ml-1 text-xs font-normal text-slate-400">(opcional)</span>
                </label>
                <textarea
                  id={`${baseId}-class-dyn`}
                  name="classDynamics"
                  rows={5}
                  maxLength={2000}
                  value={classDyn}
                  onChange={(e) => setClassDyn(e.target.value)}
                  placeholder="Ex.: Começamos com 10 min de aquecimento, seguidos de treino funcional personalizado e finalizamos com alongamento…"
                  className={`${inputClass} resize-none`}
                />
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {classDynContact && (
                      <p className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="size-3 shrink-0" aria-hidden />
                        {classDynContact}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`text-xs ${classDyn.length >= 1800 ? 'font-medium text-amber-600' : 'text-slate-400'}`}
                    >
                      {classDyn.length} / 2000
                    </span>
                    <ImproveButton
                      text={classDyn}
                      type="classDynamics"
                      name={name}
                      onImproved={setClassDyn}
                      disabled={!!classDynContact}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div
          id="perfil-panel-servicos"
          role="tabpanel"
          aria-labelledby="perfil-tab-servicos"
          hidden={tab !== 'servicos'}
          className="space-y-6"
        >
          <StatusBanner msg={servicesMsg} />

          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
              <h2 className="text-lg font-semibold text-slate-900">Formato de atendimento</h2>
              <p className="mt-1 text-sm text-slate-500">
                Como você atende seus alunos. Selecione todos que se aplicam.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 p-5 sm:p-6">
              {(Object.values(SessionModality) as SessionModality[]).map((m) => {
                const active = selectedModalities.has(m);
                const { Icon, description } = MODALITY_META[m];
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleModality(m)}
                    className={`flex items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left transition ${
                      active
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        active ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="size-4" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold ${active ? 'text-blue-800' : 'text-slate-700'}`}
                      >
                        {MODALITY_LABELS[m]}
                      </p>
                      <p className={`mt-0.5 text-xs ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                        {description}
                      </p>
                    </div>
                    <div
                      className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                        active
                          ? 'border-blue-500 bg-blue-500 text-white'
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
          </section>

          {needsLocation && (
            <section className={sectionCardClass}>
              <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
                <h2 className="text-lg font-semibold text-slate-900">Cidade de atendimento</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Onde você realiza atendimentos presenciais.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 p-5 sm:p-6">
                <label className="col-span-2 flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-slate-700">Cidade</span>
                  <input
                    type="text"
                    value={svcCity}
                    onChange={(e) => setSvcCity(e.target.value)}
                    placeholder="Ex.: São Paulo"
                    className={inputClass}
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-slate-700">Estado</span>
                  <select
                    value={svcState}
                    onChange={(e) => setSvcState(e.target.value)}
                    className={inputClass}
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
            </section>
          )}

          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
              <h2 className="text-lg font-semibold text-slate-900">Áreas de atuação</h2>
              <p className="mt-1 text-sm text-slate-500">
                Selecione as modalidades que você ensina.{' '}
                <span className="font-medium text-slate-700">Pelo menos uma obrigatória.</span>
              </p>
            </div>
            <div className="p-5 sm:p-6">
              {areasLoading ? (
                <div className="flex items-center justify-center py-8 text-sm text-slate-400">
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Carregando áreas…
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {allAreas.map((area) => {
                    const active = selectedAreaIds.has(area.id);
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => toggleArea(area.id)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                          active
                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
                            active
                              ? 'border-blue-500 bg-blue-500 text-white'
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
          </section>

          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Valor da diária{' '}
                <span className="text-sm font-normal text-slate-400">(opcional)</span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Exibido no seu perfil — alunos sabem o que esperar antes de entrar em contato.
              </p>
            </div>
            <div className="p-5 sm:p-6">
              <label className="flex flex-col gap-1.5 text-sm sm:max-w-[220px]">
                <span className="font-medium text-slate-700">Valor por sessão (R$)</span>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-slate-400">
                    R$
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100000}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex.: 120"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </label>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void onSaveServices()}
              disabled={servicesLoading || !canSaveServices || !servicesDirty}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {servicesLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {servicesDirty ? 'Salvar serviços' : 'Sem alterações'}
            </button>
          </div>
        </div>

        <div
          id="perfil-panel-localizacao"
          role="tabpanel"
          aria-labelledby="perfil-tab-localizacao"
          hidden={tab !== 'localizacao'}
        >
          <ProfileAddressSection initial={initialAddress} />
        </div>

        {/* ── CERTIFICADOS ─────────────────────────────────────────────── */}
        <div
          id="perfil-panel-certificados"
          role="tabpanel"
          aria-labelledby="perfil-tab-certificados"
          hidden={tab !== 'certificados'}
          className="space-y-6"
        >
          <section className={sectionCardClass}>
            <div className="border-b border-slate-100 px-5 py-4 sm:px-8">
              <h2 className="text-lg font-semibold text-slate-900">Certificados e formações</h2>
              <p className="mt-1 text-sm text-slate-500">
                Adicione seus cursos, graduações e certificações. Você pode anexar o documento em PDF ou imagem.
              </p>
            </div>

            <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-7">
              <StatusBanner msg={certsMsg} />

              {certsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-slate-400" aria-hidden />
                </div>
              ) : certs.length === 0 && !certForm ? (
                <p className="text-sm text-slate-500">Nenhum certificado adicionado ainda.</p>
              ) : (
                <ul className="space-y-3">
                  {certs.map((cert) => (
                    <li
                      key={cert.id}
                      className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-start sm:gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{cert.name}</p>
                        <p className="text-sm text-slate-500 truncate">{cert.issuingBody}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(cert.issueDate).toLocaleDateString('pt-BR')}
                          {cert.expiryDate
                            ? ` — ${new Date(cert.expiryDate).toLocaleDateString('pt-BR')}`
                            : ''}
                        </p>
                        {cert.documentUrl && (
                          <a
                            href={cert.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                          >
                            Ver documento
                          </a>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <label
                          className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                          title={cert.documentUrl ? 'Substituir documento' : 'Anexar documento'}
                        >
                          {docUploading === cert.id ? (
                            <Loader2 className="size-3 animate-spin inline" aria-hidden />
                          ) : (
                            cert.documentUrl ? 'Substituir' : 'Anexar'
                          )}
                          <input
                            type="file"
                            accept="application/pdf,image/jpeg,image/png,image/webp"
                            className="sr-only"
                            disabled={docUploading !== null}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              e.target.value = '';
                              if (file) void onUploadDocument(cert.id, file);
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => void onDeleteCert(cert.id)}
                          className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Remover
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {certForm ? (
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 space-y-4">
                  <p className="text-sm font-semibold text-slate-800">Novo certificado</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Nome do curso / certificação</label>
                      <input
                        type="text"
                        value={certForm.name}
                        onChange={(e) => setCertForm((f) => f && { ...f, name: e.target.value })}
                        className={inputClass}
                        placeholder="Ex.: Personal Trainer CREF"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Instituição</label>
                      <input
                        type="text"
                        value={certForm.issuingBody}
                        onChange={(e) => setCertForm((f) => f && { ...f, issuingBody: e.target.value })}
                        className={inputClass}
                        placeholder="Ex.: CONFEF"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Data de emissão</label>
                      <input
                        type="date"
                        value={certForm.issueDate}
                        onChange={(e) => setCertForm((f) => f && { ...f, issueDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Validade <span className="text-slate-400 font-normal">(opcional)</span>
                      </label>
                      <input
                        type="date"
                        value={certForm.expiryDate}
                        onChange={(e) => setCertForm((f) => f && { ...f, expiryDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setCertForm(null)}
                      className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => void onAddCert()}
                      disabled={
                        certSaving ||
                        !certForm.name.trim() ||
                        !certForm.issuingBody.trim() ||
                        !certForm.issueDate
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {certSaving && <Loader2 className="size-4 animate-spin" aria-hidden />}
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCertForm({ name: '', issuingBody: '', issueDate: '', expiryDate: '' })}
                  className="mt-2 rounded-full border border-dashed border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:text-blue-600"
                >
                  + Adicionar certificado
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      {tab === 'conta' && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={() => void onSaveAccount()}
            disabled={accountLoading || !accountDirty}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-blue-600 px-10 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/40 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {accountLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {accountDirty ? 'Salvar alterações' : 'Sem alterações'}
          </button>
        </div>
      )}

      {tab === 'profissional' && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={() => void onSaveProfessional()}
            disabled={profLoading || !professionalDirty}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-blue-600 px-10 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/40 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {profLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {professionalDirty ? 'Salvar alterações' : 'Sem alterações'}
          </button>
        </div>
      )}
    </div>
  );
}
