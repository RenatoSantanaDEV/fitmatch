'use client';

import { Loader2, MapPin, Search } from 'lucide-react';
import { useCallback, useId, useState, type ReactNode } from 'react';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

export type ProfileInitialAddress = {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

function formatCepDisplay(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
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

function StepBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-700">
      {children}
    </span>
  );
}

export function ProfileAddressSection({ initial }: { initial: ProfileInitialAddress | null }) {
  const baseId = useId();

  const [postalCode, setPostalCode] = useState(() =>
    initial?.postalCode ? formatCepDisplay(initial.postalCode) : '',
  );
  const [street, setStreet] = useState(initial?.street ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [state, setState] = useState(initial?.state ?? '');
  const [country, setCountry] = useState(initial?.country ?? 'Brasil');

  const [cepLoading, setCepLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const onCepLookup = useCallback(async () => {
    const digits = postalCode.replace(/\D/g, '');
    if (digits.length !== 8) {
      setMessage({ type: 'err', text: 'Digite um CEP com 8 dígitos.' });
      return;
    }
    setCepLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/viacep?cep=${encodeURIComponent(digits)}`);
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'err', text: readApiError(data) });
        return;
      }
      const row = data as {
        logradouro?: string;
        localidade?: string;
        uf?: string;
      };
      if (row.logradouro) setStreet(row.logradouro);
      if (row.localidade) setCity(row.localidade);
      if (row.uf) setState(row.uf);
      setCountry('Brasil');
      setMessage({
        type: 'ok',
        text: 'Rua, cidade e UF preenchidos. Complete o número e complemento e depois salve.',
      });
    } catch {
      setMessage({ type: 'err', text: 'Não foi possível consultar o CEP.' });
    } finally {
      setCepLoading(false);
    }
  }, [postalCode]);

  const onSaveLocation = useCallback(async () => {
    const cepDigits = postalCode.replace(/\D/g, '');
    if (cepDigits.length !== 8) {
      setMessage({ type: 'err', text: 'CEP deve ter 8 dígitos.' });
      return;
    }
    if (!street.trim() || !city.trim() || !state.trim()) {
      setMessage({ type: 'err', text: 'Preencha logradouro, cidade e UF antes de salvar.' });
      return;
    }
    setSaveLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/profile/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim() || 'Brasil',
          postalCode: cepDigits,
        }),
      });
      if (res.status === 204) {
        setMessage({ type: 'ok', text: 'Endereço salvo na sua conta.' });
        return;
      }
      const data = await res.json().catch(() => ({}));
      setMessage({ type: 'err', text: readApiError(data) });
    } catch {
      setMessage({ type: 'err', text: 'Não foi possível salvar.' });
    } finally {
      setSaveLoading(false);
    }
  }, [street, city, state, country, postalCode]);

  const inputHeightClass = 'min-h-[2.75rem]';

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.02]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-5 sm:px-8">
        <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/25">
            <MapPin className="size-[18px]" aria-hidden />
          </span>
          Endereço
        </h2>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-slate-600">
          Informe o CEP para preencher rua e cidade automaticamente, ajuste o restante e salve.
        </p>
      </div>

      <div className="space-y-6 px-5 py-6 sm:space-y-8 sm:px-8 sm:py-8">
        {message ? (
          <div
            role="status"
            className={
              message.type === 'ok'
                ? 'rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-900'
                : 'rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-800'
            }
          >
            {message.text}
          </div>
        ) : null}

        {/* Passo 1 — CEP */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StepBadge>Passo 1</StepBadge>
            <h3 className="text-sm font-semibold text-slate-900">CEP</h3>
          </div>
          <label htmlFor={`${baseId}-cep`} className={labelClass}>
            Código postal
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
            <input
              id={`${baseId}-cep`}
              name="postalCode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              value={postalCode}
              onChange={(e) => setPostalCode(formatCepDisplay(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void onCepLookup();
                }
              }}
              className={`${inputClass} ${inputHeightClass} sm:min-w-0 sm:flex-1`}
            />
            <button
              type="button"
              onClick={() => void onCepLookup()}
              disabled={cepLoading}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99] disabled:opacity-60 sm:w-[11.5rem] ${inputHeightClass}`}
            >
              {cepLoading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Search className="size-4 text-slate-600" aria-hidden />
              )}
              {cepLoading ? 'Buscando…' : 'Buscar CEP'}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Dados de logradouro via ViaCEP. Você pode editar tudo depois.
          </p>
        </div>

        {/* Passo 2 — Endereço completo */}
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StepBadge>Passo 2</StepBadge>
            <h3 className="text-sm font-semibold text-slate-900">Endereço completo</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label htmlFor={`${baseId}-street`} className={labelClass}>
                Logradouro, número e complemento
              </label>
              <input
                id={`${baseId}-street`}
                name="street"
                type="text"
                autoComplete="street-address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className={inputClass}
                placeholder="Rua, número, apartamento…"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-5">
              <div className="sm:col-span-3">
                <label htmlFor={`${baseId}-city`} className={labelClass}>
                  Cidade
                </label>
                <input
                  id={`${baseId}-city`}
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`${baseId}-state`} className={labelClass}>
                  UF
                </label>
                <input
                  id={`${baseId}-state`}
                  name="state"
                  type="text"
                  autoComplete="address-level1"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                  className={inputClass}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="max-w-md">
              <label htmlFor={`${baseId}-country`} className={labelClass}>
                País
              </label>
              <input
                id={`${baseId}-country`}
                name="country"
                type="text"
                autoComplete="country-name"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Salvar */}
        <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => void onSaveLocation()}
            disabled={saveLoading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Salvar endereço na conta
          </button>
          <p className="max-w-sm text-xs leading-relaxed text-slate-500">
            Os dados ficam ligados ao seu perfil e são usados para sugestões de profissionais na sua
            cidade.
          </p>
        </div>
      </div>
    </section>
  );
}
