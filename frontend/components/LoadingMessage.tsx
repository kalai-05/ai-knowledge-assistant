"use client";

import { useEffect, useState } from "react";
import type { ChatMode } from "@/lib/types";
import { AssistantAvatar, ModeTag } from "./ChatMessage";

const STAGES: Record<ChatMode, string[]> = {
  rag: [
    "Searching knowledge base...",
    "Retrieving relevant chunks...",
    "Generating grounded answer...",
  ],
  agent: [
    "Analyzing request...",
    "Selecting a tool...",
    "Executing tool...",
    "Generating grounded answer...",
  ],
};

export default function LoadingMessage({ mode }: { mode: ChatMode }) {
  const stages = STAGES[mode];
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((current) => Math.min(current + 1, stages.length - 1));
    }, 1500);
    return () => clearInterval(timer);
  }, [stages.length]);

  return (
    <div className="flex gap-3" role="status" aria-live="polite">
      <AssistantAvatar />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-zinc-400">
            Knowledge AI
          </span>
          <ModeTag agent={mode === "agent"} />
        </div>
        <div className="mt-1.5 inline-flex items-center gap-3 rounded-2xl rounded-tl-md border border-zinc-800 bg-zinc-900 px-4 py-3">
          <span className="flex gap-1" aria-hidden="true">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="h-1.5 w-1.5 animate-dot rounded-full bg-violet-400 motion-reduce:animate-none"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </span>
          <span className="text-sm text-zinc-400">{stages[stage]}</span>
        </div>
      </div>
    </div>
  );
}
