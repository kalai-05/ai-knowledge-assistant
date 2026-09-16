import type { AgentActivity as AgentActivityData } from "@/lib/types";
import { WorkflowIcon } from "./icons";
import { SourceChipList } from "./SourceChips";

interface AgentActivityProps {
  activity: AgentActivityData;
  sources?: string[];
}

export default function AgentActivity({ activity, sources = [] }: AgentActivityProps) {
  return (
    <div className="mt-4 border-t border-zinc-800 pt-3">
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
        <WorkflowIcon className="h-3.5 w-3.5 text-violet-400/80" />
        <span className="font-medium uppercase tracking-wider">
          Agent activity
        </span>
      </div>

      <dl className="mt-2.5 grid grid-cols-[minmax(0,1fr)] gap-x-4 gap-y-2 text-xs sm:grid-cols-[108px_minmax(0,1fr)]">
        <dt className="text-[11px] text-zinc-500 sm:pt-0.5">Tool</dt>
        <dd>
          <code className="inline-block rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[11px] text-emerald-300">
            {activity.toolUsed}
          </code>
        </dd>

        <dt className="text-[11px] text-zinc-500">Reason</dt>
        <dd className="leading-5 text-zinc-400">{activity.toolReason}</dd>

        {sources.length > 0 && (
          <>
            <dt className="text-[11px] text-zinc-500 sm:pt-1">
              Retrieved context
            </dt>
            <dd>
              <SourceChipList sources={sources} />
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}
