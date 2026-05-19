'use client';

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
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
}: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-100 px-4 py-3">
        <h1 className="text-base font-bold text-slate-900">Mensagens</h1>
        <p className="text-xs text-slate-500">
          {conversations.length === 0 && !loading
            ? 'Nenhuma conversa ainda'
            : `${conversations.length} conversa${conversations.length === 1 ? '' : 's'}`}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 && (
          <div className="space-y-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl p-2.5"
              >
                <div className="size-10 animate-pulse rounded-full bg-slate-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                  <div className="h-2.5 w-3/4 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {conversations.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Sem conversas por aqui
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Encontre um profissional e clique em &quot;Entrar em contato&quot; para começar.
            </p>
          </div>
        )}

        <ul className="divide-y divide-slate-100">
          {conversations.map((c) => {
            const isSelected = c.id === selectedId;
            const initial = (c.counterpart.name || '?').trim().charAt(0).toUpperCase();
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                    isSelected
                      ? 'bg-emerald-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="flex size-11 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-sm font-bold text-white">
                      {c.counterpart.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.counterpart.avatarUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        initial
                      )}
                    </div>
                    {c.unreadForRequester > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                        {c.unreadForRequester > 9 ? '9+' : c.unreadForRequester}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {c.counterpart.name || 'Conversa'}
                      </p>
                      <span className="shrink-0 text-[11px] font-medium text-slate-400">
                        {formatRelative(c.lastMessageAt)}
                      </span>
                    </div>
                    <p
                      className={`mt-0.5 truncate text-xs ${
                        c.unreadForRequester > 0
                          ? 'font-semibold text-slate-800'
                          : 'text-slate-500'
                      }`}
                    >
                      {c.lastMessagePreview || 'Nenhuma mensagem ainda'}
                    </p>
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
