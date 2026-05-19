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

  const charCount = value.length;
  const nearLimit = charCount > MAX_LENGTH * 0.9;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="border-t border-slate-200 bg-white"
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-3 sm:px-8">
      <div className="flex items-end gap-2.5">
        <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-slate-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-200">
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
            placeholder={
              disabled ? 'Conversa indisponível' : 'Escreva uma mensagem…'
            }
            rows={1}
            disabled={disabled || sending}
            className="max-h-40 w-full resize-none bg-transparent px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || sending || value.trim().length === 0}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          aria-label="Enviar"
        >
          <Send className="size-4" aria-hidden />
        </button>
      </div>
      <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-slate-400">
        <span>
          Pressione <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-mono text-[10px]">Enter</kbd> para enviar
        </span>
        {charCount > 0 && (
          <span className={nearLimit ? 'text-amber-600' : ''}>
            {charCount}/{MAX_LENGTH}
          </span>
        )}
      </div>
      </div>
    </form>
  );
}
