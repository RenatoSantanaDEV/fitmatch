'use client';

import { useEffect, useRef } from 'react';
import type { MessageDTO } from '../../application/dtos/chat/ChatDTO';

interface UseChatStreamOptions {
  conversationId: string | null;
  onMessage: (message: MessageDTO) => void;
  /** Polling fallback interval used if SSE is unavailable or fails repeatedly. */
  pollIntervalMs?: number;
}

const DEFAULT_POLL_MS = 4000;
const MAX_SSE_FAILURES = 2;

/**
 * Subscribes to chat realtime updates for a single conversation.
 * Prefers SSE; falls back to polling on repeated failures.
 */
export function useChatStream({
  conversationId,
  onMessage,
  pollIntervalMs = DEFAULT_POLL_MS,
}: UseChatStreamOptions) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!conversationId) return;

    let cancelled = false;
    let sse: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let sseFailures = 0;
    let lastSeenIso: string | null = null;

    const startPolling = () => {
      if (pollTimer || cancelled) return;
      pollTimer = setInterval(async () => {
        try {
          const url = new URL(
            `/api/chat/conversations/${conversationId}/messages`,
            window.location.origin,
          );
          url.searchParams.set('limit', '30');
          const res = await fetch(url.toString(), { credentials: 'include' });
          if (!res.ok) return;
          const data: { items: MessageDTO[] } = await res.json();
          for (const msg of data.items) {
            if (lastSeenIso && msg.createdAt <= lastSeenIso) continue;
            lastSeenIso = msg.createdAt;
            onMessageRef.current(msg);
          }
        } catch {
          // ignore transient errors
        }
      }, pollIntervalMs);
    };

    const startSse = () => {
      if (cancelled) return;
      const url = `/api/chat/stream?conversationId=${encodeURIComponent(conversationId)}`;
      sse = new EventSource(url, { withCredentials: true });

      sse.addEventListener('message', (ev) => {
        try {
          const msg = JSON.parse((ev as MessageEvent).data) as MessageDTO;
          lastSeenIso = msg.createdAt;
          onMessageRef.current(msg);
        } catch {
          // ignore
        }
      });

      sse.addEventListener('error', () => {
        sseFailures += 1;
        sse?.close();
        sse = null;
        if (sseFailures >= MAX_SSE_FAILURES) {
          startPolling();
        } else {
          setTimeout(() => {
            if (!cancelled) startSse();
          }, 1000 * sseFailures);
        }
      });
    };

    startSse();

    return () => {
      cancelled = true;
      if (sse) sse.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [conversationId, pollIntervalMs]);
}
