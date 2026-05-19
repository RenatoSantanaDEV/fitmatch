'use client';

import { useMemo, useState } from 'react';
import { Search, Inbox } from 'lucide-react';
import type { ConversationDTO } from '../../application/dtos/chat/ChatDTO';

interface Props {
  conversations: ConversationDTO[];
  selectedId: string | null;
  onSelect: (conv: ConversationDTO) => void;
  loading: boolean;
}

function formatRelative(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || '?';
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
}: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      (c.counterpart.name || '').toLowerCase().includes(q) ||
      (c.lastMessagePreview || '').toLowerCase().includes(q),
    );
  }, [conversations, query]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadForRequester, 0),
    [conversations],
  );

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold tracking-tight text-slate-900">
            Mensagens
          </h1>
          {totalUnread > 0 && (
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              {totalUnread} {totalUnread === 1 ? 'nova' : 'novas'}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {conversations.length === 0 && !loading
            ? 'Nenhuma conversa'
            : `${conversations.length} ${conversations.length === 1 ? 'contato' : 'contatos'}`}
        </p>

        <div className="relative mt-3">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar conversas"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 && (
          <div className="space-y-1 p-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5">
                <div className="size-11 animate-pulse rounded-full bg-slate-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                  <div className="h-2.5 w-3/4 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Inbox className="size-5" aria-hidden />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">
              {query ? 'Nenhum resultado' : 'Sua caixa está vazia'}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {query
                ? 'Tente outra palavra-chave.'
                : 'Encontre um profissional e clique em "Entrar em contato" para começar.'}
            </p>
          </div>
        )}

        <ul>
          {filtered.map((c) => {
            const isSelected = c.id === selectedId;
            const unread = c.unreadForRequester;
            const hasUnread = unread > 0;
            const initials = getInitials(c.counterpart.name || '?');
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c)}
                  className={`group relative flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left transition ${
                    isSelected
                      ? 'border-emerald-600 bg-slate-50'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                      {c.counterpart.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.counterpart.avatarUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className={`truncate text-sm ${
                          hasUnread
                            ? 'font-semibold text-slate-900'
                            : 'font-medium text-slate-800'
                        }`}
                      >
                        {c.counterpart.name || 'Conversa'}
                      </p>
                      <span
                        className={`shrink-0 text-[11px] tabular-nums ${
                          hasUnread ? 'font-semibold text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {formatRelative(c.lastMessageAt)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p
                        className={`flex-1 truncate text-xs ${
                          hasUnread ? 'font-medium text-slate-700' : 'text-slate-500'
                        }`}
                      >
                        {c.lastMessagePreview || 'Nenhuma mensagem ainda'}
                      </p>
                      {hasUnread && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
