"use client";

import { useEffect, useRef } from "react";
import type { UploadResponse } from "@/lib/api";
import type { ChatMode, Message } from "@/lib/types";
import ChatComposer from "./ChatComposer";
import ChatMessage from "./ChatMessage";
import ErrorAlert from "./ErrorAlert";
import LoadingMessage from "./LoadingMessage";
import ModeSelector from "./ModeSelector";
import {
  ArrowRightIcon,
  DatabaseIcon,
  FileTextIcon,
  SearchIcon,
} from "./icons";

// Agent suggestions each exercise a different tool:
// search_document, summarize_document, get_document_info.
const SUGGESTIONS: Record<ChatMode, string[]> = {
  rag: [
    "Summarize this document",
    "What are the key points?",
    "What technologies or skills are mentioned?",
  ],
  agent: [
    "What technologies are mentioned?",
    "Summarize this document",
    "What is the filename and how many chunks does it have?",
  ],
};

interface ChatPanelProps {
  document: UploadResponse | null;
  messages: Message[];
  mode: ChatMode;
  asking: boolean;
  uploading: boolean;
  error: string;
  onAsk: (question: string) => void;
  onModeChange: (mode: ChatMode) => void;
  onDismissError: () => void;
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <div className="relative mx-auto grid h-12 w-12 place-items-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400">
          <FileTextIcon className="h-6 w-6" />
          <span className="absolute -right-1.5 -bottom-1.5 grid h-6 w-6 place-items-center rounded-lg border border-zinc-800 bg-zinc-950 text-violet-300">
            <SearchIcon className="h-3.5 w-3.5" />
          </span>
        </div>
        <h3 className="mt-5 text-base font-semibold text-zinc-100">
          Upload a document to start
        </h3>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Your PDF will be split into chunks, embedded with Gemini, and
          indexed in pgvector for semantic retrieval.
        </p>
      </div>
    </div>
  );
}

function ReadyState({
  document,
  mode,
  disabled,
  onAsk,
}: {
  document: UploadResponse;
  mode: ChatMode;
  disabled: boolean;
  onAsk: (question: string) => void;
}) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          <DatabaseIcon className="h-6 w-6" />
        </div>
        <h3 className="mt-5 text-base font-semibold text-zinc-100">
          Knowledge base ready
        </h3>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          {mode === "agent"
            ? "Ask a question and the agent will choose a tool: semantic search, a full summary, or document metadata."
            : `${document.chunks_created} chunks indexed. Ask a question and the most relevant passages will be retrieved as context.`}
        </p>
        <div className="mt-6 grid gap-2 text-left">
          {SUGGESTIONS[mode].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onAsk(suggestion)}
              disabled={disabled}
              className="group flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SearchIcon className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-violet-300" />
              <span className="flex-1">{suggestion}</span>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-zinc-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel({
  document,
  messages,
  mode,
  asking,
  uploading,
  error,
  onAsk,
  onModeChange,
  onDismissError,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasConversation = messages.length > 0 || asking;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages.length, asking]);

  return (
    <section className="flex h-[80dvh] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 lg:h-auto lg:min-h-0">
      <div className="flex shrink-0 items-center justify-between gap-4 px-5 pt-4 pb-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-100">
            Ask your knowledge
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Answers grounded in your uploaded document
          </p>
        </div>
        {document && (
          <div
            className="hidden max-w-[240px] items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-1.5 text-xs text-zinc-400 sm:flex"
            title={document.filename}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            <span className="shrink-0 text-zinc-500">Context:</span>
            <span className="truncate text-zinc-300">{document.filename}</span>
          </div>
        )}
      </div>

      <div className="shrink-0 border-b border-zinc-800/80 px-5 pb-3">
        <ModeSelector mode={mode} disabled={asking} onChange={onModeChange} />
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {!document && !hasConversation ? (
          <EmptyState />
        ) : document && !hasConversation ? (
          <ReadyState
            document={document}
            mode={mode}
            disabled={asking || uploading}
            onAsk={onAsk}
          />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {asking && <LoadingMessage key={mode} mode={mode} />}
          </div>
        )}
      </div>

      {error && (
        <div className="mx-auto w-full max-w-3xl shrink-0 px-3 pb-3 sm:px-5">
          <ErrorAlert
            title="Failed to generate answer"
            message={error}
            onDismiss={onDismissError}
          />
        </div>
      )}

      <ChatComposer
        disabled={!document || uploading}
        busy={asking}
        onSend={onAsk}
      />
    </section>
  );
}
