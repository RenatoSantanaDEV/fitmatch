'use client';

import { ExternalLink, Loader2, MapPin, Navigation, Search } from 'lucide-react';
import { useCallback, useId, useState, type ReactNode } from 'react';
import { AddressMapPreview } from './AddressMapPreview';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700';

export type ProfileInitialAddress = {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
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
      .map((e) => (typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e)))
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
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [postalCode, setPostalCode] = useState(() =>
    initial?.postalCode ? formatCepDisplay(initial.postalCode) : '',
  );
  const [street, setStreet] = useState(initial?.street ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [state, setState] = useState(initial?.state ?? '');
  const [country, setCountry] = useState(initial?.country ?? 'Brasil');
  const [latitude, setLatitude] = useState<number | null>(initial?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(initial?.longitude ?? null);
  const [formattedHint, setFormattedHint] = useState<string | null>(null);

  const [cepLoading, setCepLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
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
        bairro?: string;
        localidade?: string;
        uf?: string;
      };
      if (row.logradouro) setStreet(row.logradouro);
      if (row.localidade) setCity(row.localidade);
      if (row.uf) setState(row.uf);
      setCountry('Brasil');
      setLatitude(null);
      setLongitude(null);
      setFormattedHint(null);
      setMessage({
        type: 'ok',
        text: 'Rua, cidade e UF foram preenchidos. Complete número e complemento e avance para as coordenadas.',
      });
    } catch {
      setMessage({ type: 'err', text: 'Não foi possível consultar o CEP.' });
    } finally {
      setCepLoading(false);
    }
  }, [postalCode]);

  const onGeocode = useCallback(async () => {
    if (!street.trim() || !city.trim() || !state.trim()) {
      setMessage({ type: 'err', text: 'Preencha logradouro, cidade e UF antes de obter coordenadas.' });
      return;
    }
    setGeoLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim() || 'Brasil',
          postalCode: postalCode.replace(/\D/g, '') || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'err', text: readApiError(data) });
        return;
      }
      const payload = data as { latitude: number; longitude: number; formattedAddress?: string };
      setLatitude(payload.latitude);
      setLongitude(payload.longitude);
      setFormattedHint(payload.formattedAddress ?? null);
      setMessage({ type: 'ok', text: 'Coordenadas encontradas. Confira o mapa e salve quando estiver tudo certo.' });
    } catch {
      setMessage({ type: 'err', text: 'Falha ao obter coordenadas.' });
    } finally {
      setGeoLoading(false);
    }
  }, [street, city, state, country, postalCode]);

  const onSaveLocation = useCallback(async () => {
    if (latitude == null || longitude == null) {
      setMessage({ type: 'err', text: 'Obtenha as coordenadas antes de salvar.' });
      return;
    }
    const cepDigits = postalCode.replace(/\D/g, '');
    if (cepDigits.length !== 8) {
      setMessage({ type: 'err', text: 'CEP deve ter 8 dígitos.' });
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
          latitude,
          longitude,
        }),
      });
      if (res.status === 204) {
        setMessage({ type: 'ok', text: 'Endereço e coordenadas salvos na sua conta.' });
        return;
      }
      const data = await res.json().catch(() => ({}));
      setMessage({ type: 'err', text: readApiError(data) });
    } catch {
      setMessage({ type: 'err', text: 'Não foi possível salvar.' });
    } finally {
      setSaveLoading(false);
    }
  }, [street, city, state, country, postalCode, latitude, longitude]);

  const mapsHref =
    latitude != null && longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`
      : null;

  const inputHeightClass = 'min-h-[2.75rem]';

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.02]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-5 sm:px-8">
        <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/25">
            <MapPin className="size-[18px]" aria-hidden />
          </span>
          Endereço no mapa
        </h2>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-slate-600">
          Informe o CEP para preencher rua e cidade automaticamente, ajuste o restante e gere o ponto no mapa.
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
              {cepLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Search className="size-4 text-slate-600" aria-hidden />}
              {cepLoading ? 'Buscando…' : 'Buscar CEP'}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Dados de logradouro via ViaCEP. Você pode editar tudo depois.</p>
        </div>

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

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StepBadge>Passo 3</StepBadge>
            <h3 className="text-sm font-semibold text-slate-900">Coordenadas e mapa</h3>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => void onGeocode()}
              disabled={geoLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-60"
            >
              {geoLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Navigation className="size-4" aria-hidden />}
              {geoLoading ? 'Localizando…' : 'Obter coordenadas'}
            </button>
            {mapsHref ? (
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                <ExternalLink className="size-4" aria-hidden />
                Abrir no Google Maps
              </a>
            ) : null}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Usamos o geocodificador do Google no servidor para posicionar o marcador com precisão.
          </p>

          {formattedHint ? (
            <p className="mt-4 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-xs leading-relaxed text-slate-700">
              <span className="font-semibold text-slate-900">Endereço reconhecido:</span>{' '}
              {formattedHint}
            </p>
          ) : null}

          <div className="mt-5">
            <AddressMapPreview apiKey={mapsApiKey} latitude={latitude} longitude={longitude} />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => void onSaveLocation()}
            disabled={saveLoading || latitude == null || longitude == null}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Salvar endereço na conta
          </button>
          <p className="max-w-sm text-xs leading-relaxed text-slate-500">
            Só é possível salvar depois que as coordenadas forem obtidas. Os dados ficam ligados ao seu perfil.
          </p>
        </div>
      </div>
    </section>
  );
}
