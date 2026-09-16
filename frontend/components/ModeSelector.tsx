import type { ChatMode } from "@/lib/types";
import { SearchIcon, WorkflowIcon } from "./icons";

const MODES = [
  {
    value: "rag",
    label: "RAG",
    description: "Semantic retrieval → grounded generation",
    Icon: SearchIcon,
  },
  {
    value: "agent",
    label: "Agent",
    description: "LLM routing → tool execution → grounded generation",
    Icon: WorkflowIcon,
  },
] satisfies { value: ChatMode; label: string; description: string; Icon: typeof SearchIcon }[];

interface ModeSelectorProps {
  mode: ChatMode;
  disabled?: boolean;
  onChange: (mode: ChatMode) => void;
}

export default function ModeSelector({ mode, disabled, onChange }: ModeSelectorProps) {
  const active = MODES.find((option) => option.value === mode) ?? MODES[0];

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
      <div
        role="group"
        aria-label="Answer mode"
        className="inline-flex shrink-0 rounded-lg border border-zinc-800 bg-zinc-950/60 p-0.5"
      >
        {MODES.map(({ value, label, Icon }) => {
          const selected = value === mode;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(value)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed ${
                selected
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 disabled:hover:text-zinc-400"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 ${selected ? "text-violet-300" : ""}`}
              />
              {label}
            </button>
          );
        })}
      </div>
      <p className="truncate text-[11px] text-zinc-500">{active.description}</p>
    </div>
  );
}
