'use client';

import { useRef, useState } from 'react';
import { Send } from 'lucide-react';

interface Props {
  disabled?: boolean;
  onSend: (body: string) => Promise<void> | void;
}

const MAX_LENGTH = 4000;

export function MessageComposer({ disabled, onSend }: Props) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const submit = async () => {
    const trimmed = value.trim();
    if (!trimmed || sending || disabled) return;
    setSending(true);
    try {
      await onSend(trimmed);
      setValue('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="flex items-end gap-2 border-t border-slate-100 bg-white p-3"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value.slice(0, MAX_LENGTH));
          autoResize();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void submit();
          }
        }}
        placeholder={disabled ? 'Conversa indisponível' : 'Escreva uma mensagem…'}
        rows={1}
        disabled={disabled || sending}
        className="max-h-40 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || sending || value.trim().length === 0}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Enviar"
      >
        <Send className="size-4" aria-hidden />
      </button>
    </form>
  );
}
