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
    <div className="mx-auto flex h-[calc(100vh-64px)] w-full max-w-6xl flex-col bg-slate-50 px-0 sm:px-4 sm:py-4">
      <div className="flex h-full overflow-hidden rounded-none border-y border-slate-200 bg-white sm:rounded-2xl sm:border sm:shadow-sm">
        <aside
          className={`w-full shrink-0 border-r border-slate-100 sm:w-[320px] lg:w-[360px] ${
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
          className={`flex-1 flex-col ${selectedId ? 'flex' : 'hidden sm:flex'}`}
        >
          {selectedConversation ? (
            <>
              <div className="sm:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-2 text-sm font-medium text-slate-600"
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
              />
              {sendError && (
                <div className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-700">
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
              <p className="max-w-sm text-sm text-slate-500">
                Selecione uma conversa à esquerda para começar a trocar mensagens.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
