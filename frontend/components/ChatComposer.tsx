"use client";

import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { ArrowUpIcon, Spinner } from "./icons";

const MAX_HEIGHT = 160;

interface ChatComposerProps {
  disabled: boolean;
  busy: boolean;
  onSend: (question: string) => void;
}

export default function ChatComposer({ disabled, busy, onSend }: ChatComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !disabled && !busy && value.trim().length > 0;

  function resize() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
  }

  function submit() {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
    requestAnimationFrame(resize);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="shrink-0 border-t border-zinc-800/80 bg-zinc-950/40 px-3 py-3 sm:px-5 sm:py-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        <div
          className={`flex items-end gap-2 rounded-xl border bg-zinc-900 p-2 transition ${
            disabled
              ? "border-zinc-800 opacity-60"
              : "border-zinc-700/80 focus-within:border-violet-500/60 focus-within:ring-4 focus-within:ring-violet-500/10"
          }`}
        >
          <label htmlFor="question" className="sr-only">
            Question
          </label>
          <textarea
            id="question"
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              resize();
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              disabled
                ? "Upload a PDF to start asking questions..."
                : "Ask anything about this document..."
            }
            className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label={busy ? "Generating answer" : "Send question"}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            {busy ? <Spinner className="h-4 w-4" /> : <ArrowUpIcon className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-zinc-500">
          <span>Answers are generated from retrieved document context.</span>
          <span className="hidden sm:inline">
            <kbd className="font-sans text-zinc-400">Enter</kbd> to send ·{" "}
            <kbd className="font-sans text-zinc-400">Shift + Enter</kbd> for newline
          </span>
        </div>
      </form>
    </div>
  );
}
