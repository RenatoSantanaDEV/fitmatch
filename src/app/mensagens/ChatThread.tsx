'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import type {
  ConversationDTO,
  MessageDTO,
} from '../../application/dtos/chat/ChatDTO';

interface Props {
  conversation: ConversationDTO;
  currentUserId: string;
  messages: MessageDTO[];
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(iso) === dayKey(today.toISOString())) return 'Hoje';
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return 'Ontem';
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: today.getFullYear() !== d.getFullYear() ? 'numeric' : undefined,
  });
}

export function ChatThread({
  conversation,
  currentUserId,
  messages,
  loadingMore,
  hasMore,
  onLoadMore,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | null>(null);

  const grouped = useMemo(() => {
    const groups: { day: string; label: string; items: MessageDTO[] }[] = [];
    for (const m of messages) {
      const day = dayKey(m.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.day === day) {
        last.items.push(m);
      } else {
        groups.push({ day, label: formatDayLabel(m.createdAt), items: [m] });
      }
    }
    return groups;
  }, [messages]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last) return;
    if (lastIdRef.current === last.id) return;
    lastIdRef.current = last.id;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, [messages]);

  const initial = (conversation.counterpart.name || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-sm font-bold text-white">
          {conversation.counterpart.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={conversation.counterpart.avatarUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            initial
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {conversation.counterpart.name || 'Conversa'}
          </p>
          <p className="text-xs text-slate-500">
            {conversation.counterpart.role === 'PROFESSIONAL' ? 'Profissional' : 'Aluno'}
            {conversation.fromMatchId ? ' · via match' : ''}
          </p>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5"
      >
        {hasMore && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {loadingMore ? 'Carregando…' : 'Carregar mensagens anteriores'}
            </button>
          </div>
        )}

        {messages.length === 0 && !hasMore && (
          <div className="flex h-full items-center justify-center px-4">
            <p className="max-w-xs text-center text-sm text-slate-500">
              Diga olá! Esta é a primeira mensagem da conversa.
            </p>
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.day} className="space-y-2">
            <div className="flex items-center justify-center">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {group.label}
              </span>
            </div>
            {group.items.map((msg) => {
              const isOwn = msg.senderUserId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                      isOwn
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-100 bg-white text-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                        isOwn ? 'text-emerald-50/90' : 'text-slate-400'
                      }`}
                    >
                      <span>{formatTime(msg.createdAt)}</span>
                      {isOwn &&
                        (msg.readAt ? (
                          <CheckCheck className="size-3" aria-hidden />
                        ) : (
                          <Check className="size-3" aria-hidden />
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
