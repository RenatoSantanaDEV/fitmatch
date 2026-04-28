'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

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
        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Sparkles className="size-4" aria-hidden />
        {disabled ? 'A gerar a sua lista…' : 'Atualizar lista com IA'}
      </button>
      {error && <p className="max-w-xs text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
