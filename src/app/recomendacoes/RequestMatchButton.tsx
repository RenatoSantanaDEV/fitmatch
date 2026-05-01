'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';

interface Props {
  userId?: string;
  studentId?: string;
}

export function RequestMatchButton({ userId, studentId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestRanking() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxResults: 5, userId, studentId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = typeof body.error === 'string' ? body.error : `Erro ${res.status}`;
        throw new Error(message);
      }

      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || pending;

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={requestRanking}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {disabled ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="size-4" aria-hidden />
        )}
        {disabled ? 'Gerando lista com IA…' : 'Atualizar ranking com IA'}
      </button>
      {error && (
        <p className="max-w-xs rounded-lg bg-red-50 px-3 py-1.5 text-right text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
