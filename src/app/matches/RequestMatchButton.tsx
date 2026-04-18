'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  userId?: string;
  studentId?: string;
}

export function RequestMatchButton({ userId, studentId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestMatch() {
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
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={requestMatch}
        disabled={disabled}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {disabled ? 'Buscando match com IA...' : 'Pedir novo match'}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
