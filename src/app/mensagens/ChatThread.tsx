'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Check, CheckCheck, Info, ShieldCheck } from 'lucide-react';
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
  onOpenDetails: () => void;
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || '?';
}

export function ChatThread({
  conversation,
  currentUserId,
  messages,
  loadingMore,
  hasMore,
  onLoadMore,
  onOpenDetails,
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

  const initials = getInitials(conversation.counterpart.name || '?');
  const roleLabel =
    conversation.counterpart.role === 'PROFESSIONAL' ? 'Profissional' : 'Aluno';

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3.5 sm:px-8">
          <button
            type="button"
            onClick={onOpenDetails}
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1.5 py-1 text-left transition hover:bg-slate-50"
            aria-label="Ver detalhes do contato"
          >
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
              {conversation.counterpart.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={conversation.counterpart.avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-tight text-slate-900 group-hover:text-emerald-700">
                {conversation.counterpart.name || 'Conversa'}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                <span>{roleLabel}</span>
                {conversation.fromMatchId && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700 ring-1 ring-inset ring-violet-200">
                      via match
                    </span>
                  </>
                )}
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={onOpenDetails}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            aria-label="Ver detalhes"
          >
            <Info className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Detalhes</span>
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="mx-auto w-full max-w-4xl space-y-3 px-4 py-5 sm:px-8 sm:py-7">
        {hasMore && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              {loadingMore ? 'Carregando…' : 'Carregar mensagens anteriores'}
            </button>
          </div>
        )}

        {messages.length === 0 && !hasMore && (
          <div className="flex h-full items-center justify-center px-6">
            <div className="max-w-sm rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100">
                <ShieldCheck className="size-5" aria-hidden />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                Conversa segura
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Suas mensagens são privadas. Apresente-se ao profissional e explique seus
                objetivos para começar.
              </p>
            </div>
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.day} className="space-y-2">
            <div className="my-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {group.label}
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            {group.items.map((msg, idx) => {
              const isOwn = msg.senderUserId === currentUserId;
              const prev = group.items[idx - 1];
              const isContinuation = prev?.senderUserId === msg.senderUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                    isContinuation ? 'mt-1' : 'mt-3'
                  }`}
                >
                  <div
                    className={`max-w-[min(78%,620px)] px-4 py-2.5 text-sm shadow-sm ${
                      isOwn
                        ? `bg-emerald-600 text-white ${
                            isContinuation
                              ? 'rounded-2xl rounded-tr-md'
                              : 'rounded-2xl rounded-br-md'
                          }`
                        : `border border-slate-200 bg-white text-slate-800 ${
                            isContinuation
                              ? 'rounded-2xl rounded-tl-md'
                              : 'rounded-2xl rounded-bl-md'
                          }`
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                      {msg.body}
                    </p>
                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[10px] tabular-nums ${
                        isOwn ? 'text-emerald-50/80' : 'text-slate-400'
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
    </div>
  );
}
