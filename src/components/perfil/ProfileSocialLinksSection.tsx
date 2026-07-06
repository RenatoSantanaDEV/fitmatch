'use client';

import { Facebook, Globe, Instagram, Linkedin, Loader2 } from 'lucide-react';
import { useCallback, useId, useState } from 'react';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

const labelClass = 'mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700';

export type ProfileInitialSocialLinks = {
  linkedinUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  websiteUrl: string | null;
};

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

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function ProfileSocialLinksSection({ initial }: { initial: ProfileInitialSocialLinks }) {
  const baseId = useId();

  const [linkedin, setLinkedin] = useState(initial.linkedinUrl ?? '');
  const [instagram, setInstagram] = useState(initial.instagramUrl ?? '');
  const [facebook, setFacebook] = useState(initial.facebookUrl ?? '');
  const [website, setWebsite] = useState(initial.websiteUrl ?? '');

  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const onSave = useCallback(async () => {
    setSaveLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/profile/professional/social', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedinUrl: normalizeUrl(linkedin) || null,
          instagramUrl: normalizeUrl(instagram) || null,
          facebookUrl: normalizeUrl(facebook) || null,
          websiteUrl: normalizeUrl(website) || null,
        }),
      });
      if (res.status === 204) {
        setMessage({ type: 'ok', text: 'Links salvos no seu perfil.' });
        return;
      }
      const data = await res.json().catch(() => ({}));
      setMessage({ type: 'err', text: readApiError(data) });
    } catch {
      setMessage({ type: 'err', text: 'Não foi possível salvar.' });
    } finally {
      setSaveLoading(false);
    }
  }, [linkedin, instagram, facebook, website]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.02]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-5 py-5 sm:px-8">
        <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/25">
            <Globe className="size-[18px]" aria-hidden />
          </span>
          Redes sociais e site
        </h2>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-slate-600">
          Aparecem como ícones no seu perfil público. Todos os campos são opcionais.
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

        <div>
          <label htmlFor={`${baseId}-linkedin`} className={labelClass}>
            <Linkedin className="size-4 text-slate-400" aria-hidden />
            LinkedIn
          </label>
          <input
            id={`${baseId}-linkedin`}
            name="linkedinUrl"
            type="url"
            inputMode="url"
            placeholder="https://linkedin.com/in/seu-usuario"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${baseId}-instagram`} className={labelClass}>
            <Instagram className="size-4 text-slate-400" aria-hidden />
            Instagram
          </label>
          <input
            id={`${baseId}-instagram`}
            name="instagramUrl"
            type="url"
            inputMode="url"
            placeholder="https://instagram.com/seu-usuario"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${baseId}-facebook`} className={labelClass}>
            <Facebook className="size-4 text-slate-400" aria-hidden />
            Facebook
          </label>
          <input
            id={`${baseId}-facebook`}
            name="facebookUrl"
            type="url"
            inputMode="url"
            placeholder="https://facebook.com/seu-usuario"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor={`${baseId}-website`} className={labelClass}>
            <Globe className="size-4 text-slate-400" aria-hidden />
            Site / portfólio
          </label>
          <input
            id={`${baseId}-website`}
            name="websiteUrl"
            type="url"
            inputMode="url"
            placeholder="https://seusite.com.br"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saveLoading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saveLoading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Salvar redes sociais e site
          </button>
          <p className="max-w-sm text-xs leading-relaxed text-slate-500">
            Deixe em branco os campos que não quiser mostrar publicamente.
          </p>
        </div>
      </div>
    </section>
  );
}
