import type { Message } from "@/lib/types";
import AgentActivity from "./AgentActivity";
import { SparklesIcon } from "./icons";
import Markdown from "./Markdown";
import SourceChips from "./SourceChips";

export function AssistantAvatar() {
  return (
    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 text-white">
      <SparklesIcon className="h-3.5 w-3.5" />
    </div>
  );
}

export function ModeTag({ agent }: { agent: boolean }) {
  return (
    <span className="rounded border border-zinc-800 px-1 py-px text-[10px] font-medium text-zinc-500">
      {agent ? "Agent" : "RAG"}
    </span>
  );
}

export default function ChatMessage({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end">
        <span className="mb-1.5 text-[11px] font-medium text-zinc-500">You</span>
        <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-violet-600 px-4 py-2.5 text-sm leading-6 break-words whitespace-pre-wrap text-white sm:max-w-[75%]">
          {message.content}
        </div>
      </div>
    );
  }

  const sources = message.sources ?? [];

  return (
    <div className="flex gap-3">
      <AssistantAvatar />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-zinc-400">
            Knowledge AI
          </span>
          <ModeTag agent={message.mode === "agent"} />
        </div>
        <div className="mt-1.5 rounded-2xl rounded-tl-md border border-zinc-800 bg-zinc-900 px-4 py-3.5">
          <Markdown content={message.content} />
          {message.agent ? (
            <AgentActivity activity={message.agent} sources={sources} />
          ) : (
            sources.length > 0 && <SourceChips sources={sources} />
          )}
        </div>
      </div>
    </div>
  );
}
