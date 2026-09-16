import type { ApiStatus } from "@/lib/types";
import { MoonIcon, SparklesIcon } from "./icons";

const STATUS = {
  checking: { label: "Checking API", dot: "bg-amber-400 animate-pulse" },
  online: { label: "API Connected", dot: "bg-emerald-400" },
  offline: { label: "API Unavailable", dot: "bg-red-400" },
} satisfies Record<ApiStatus, { label: string; dot: string }>;

export default function Header({ status }: { status: ApiStatus }) {
  const { label, dot } = STATUS[status];

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 backdrop-blur lg:px-5">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-950/40">
          <SparklesIcon className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            Knowledge AI
          </span>
          <span className="hidden rounded-md border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[11px] font-medium text-zinc-400 sm:inline">
            RAG Workspace
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          role="status"
          className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-300"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          {label}
        </div>
        <div
          title="Dark theme"
          className="hidden h-7 w-7 place-items-center rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-400 sm:grid"
        >
          <MoonIcon className="h-3.5 w-3.5" />
          <span className="sr-only">Dark theme</span>
        </div>
      </div>
    </header>
  );
}
