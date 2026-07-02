'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type {
  ConversationDTO,
  ConversationListDTO,
  MessageDTO,
  MessageListDTO,
} from '../../application/dtos/chat/ChatDTO';
import { ConversationList } from './ConversationList';
import { ChatThread } from './ChatThread';
import { MessageComposer } from './MessageComposer';
import { useChatStream } from './useChatStream';
import { CounterpartPanel } from './CounterpartPanel';

interface Props {
  currentUserId: string;
  initialConversationId: string | null;
}

export function MensagensClient({ currentUserId, initialConversationId }: Props) {
  const [conversations, setConversations] = useState<ConversationDTO[]>([]);
  const [convListLoading, setConvListLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const selectedIdRef = useRef<string | null>(selectedId);
  selectedIdRef.current = selectedId;

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations', { credentials: 'include' });
      if (!res.ok) return;
      const data: ConversationListDTO = await res.json();
      setConversations(data.items);
      if (!selectedIdRef.current && data.items[0]) {
        setSelectedId(data.items[0].id);
      }
    } finally {
      setConvListLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  // If initialConversationId points to a conversation not present in the list,
  // fetch it explicitly so it shows up even before the first message.
  useEffect(() => {
    if (!selectedId) return;
    if (conversations.some((c) => c.id === selectedId)) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/chat/conversations/${selectedId}`, {
        credentials: 'include',
      });
      if (!res.ok || cancelled) return;
      const data: ConversationDTO = await res.json();
      setConversations((prev) =>
        prev.some((c) => c.id === data.id) ? prev : [data, ...prev],
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, conversations]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const res = await fetch(
        `/api/chat/conversations/${conversationId}/messages?limit=30`,
        { credentials: 'include' },
      );
      if (!res.ok) {
        setMessages([]);
        setHasMore(false);
        return;
      }
      const data: MessageListDTO = await res.json();
      setMessages(data.items);
      setHasMore(data.hasMore);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    setDetailsOpen(false);
    if (!selectedId) {
      setMessages([]);
      setHasMore(false);
      return;
    }
    void fetchMessages(selectedId);
  }, [selectedId, fetchMessages]);

  // Mark read when the selected conversation has unread messages.
  useEffect(() => {
    if (!selectedConversation) return;
    if (selectedConversation.unreadForRequester <= 0) return;
    void fetch(`/api/chat/conversations/${selectedConversation.id}/read`, {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id ? { ...c, unreadForRequester: 0 } : c,
        ),
      );
    });
  }, [selectedConversation]);

  const handleIncomingMessage = useCallback((msg: MessageDTO) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });

    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === msg.conversationId);
      if (idx === -1) {
        void fetch(`/api/chat/conversations/${msg.conversationId}`, {
          credentials: 'include',
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((data: ConversationDTO | null) => {
            if (!data) return;
            setConversations((cur) =>
              cur.some((c) => c.id === data.id) ? cur : [data, ...cur],
            );
          });
        return prev;
      }
      const current = prev[idx];
      if (!current) return prev;
      const isFromOther = msg.senderUserId !== currentUserId;
      const isOpenedNow = selectedIdRef.current === msg.conversationId;
      const updated: ConversationDTO = {
        ...current,
        lastMessageAt: msg.createdAt,
        lastMessagePreview: msg.body.slice(0, 160),
        unreadForRequester:
          isFromOther && !isOpenedNow
            ? current.unreadForRequester + 1
            : current.unreadForRequester,
      };
      const next = [updated, ...prev.filter((_, i) => i !== idx)];
      return next;
    });

    // If the message is incoming for the open conversation, mark read immediately.
    if (msg.senderUserId !== currentUserId && selectedIdRef.current === msg.conversationId) {
      void fetch(`/api/chat/conversations/${msg.conversationId}/read`, {
        method: 'POST',
        credentials: 'include',
      });
    }
  }, [currentUserId]);

  useChatStream({
    conversationId: selectedId,
    onMessage: handleIncomingMessage,
  });

  const handleSend = useCallback(
    async (body: string) => {
      if (!selectedId) return;
      setSendError(null);
      const res = await fetch(
        `/api/chat/conversations/${selectedId}/messages`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSendError(typeof data?.error === 'string' ? data.error : 'Erro ao enviar.');
        return;
      }
      const msg: MessageDTO = await res.json();
      handleIncomingMessage(msg);
    },
    [selectedId, handleIncomingMessage],
  );

  const handleLoadMore = useCallback(async () => {
    if (!selectedId || messages.length === 0) return;
    const oldest = messages[0];
    if (!oldest) return;
    setLoadingMore(true);
    try {
      const url = new URL(
        `/api/chat/conversations/${selectedId}/messages`,
        window.location.origin,
      );
      url.searchParams.set('limit', '30');
      url.searchParams.set('before', oldest.createdAt);
      const res = await fetch(url.toString(), { credentials: 'include' });
      if (!res.ok) return;
      const data: MessageListDTO = await res.json();
      setMessages((prev) => [...data.items, ...prev]);
      setHasMore(data.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }, [selectedId, messages]);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col bg-slate-100">
      <div className="flex h-full w-full overflow-hidden bg-white">
        <aside
          className={`w-full shrink-0 border-r border-slate-200 sm:w-[320px] lg:w-[360px] xl:w-[400px] ${
            selectedId ? 'hidden sm:flex' : 'flex'
          } flex-col`}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={(c) => setSelectedId(c.id)}
            loading={convListLoading}
          />
        </aside>

        <main
          className={`min-h-0 flex-1 flex-col bg-slate-50 ${selectedId ? 'flex' : 'hidden sm:flex'}`}
        >
          {selectedConversation ? (
            <>
              <div className="sm:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="flex items-center gap-1.5 border-b border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Voltar
                </button>
              </div>
              <ChatThread
                conversation={selectedConversation}
                currentUserId={currentUserId}
                messages={messages}
                loadingMore={loadingMore}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                onOpenDetails={() => setDetailsOpen(true)}
              />
              {sendError && (
                <div className="border-t border-rose-200 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700">
                  {sendError}
                </div>
              )}
              <MessageComposer
                disabled={selectedConversation.status === 'BLOCKED' || messagesLoading}
                onSend={handleSend}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <div className="max-w-sm">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h2 className="mt-4 text-base font-semibold text-slate-900">
                  Suas conversas
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Selecione um contato à esquerda para visualizar e responder mensagens.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <CounterpartPanel
        conversationId={selectedId}
        open={detailsOpen && selectedId !== null}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
}
