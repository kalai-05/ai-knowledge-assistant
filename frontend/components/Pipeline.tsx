import { CheckIcon } from "./icons";

export type StepStatus = "idle" | "active" | "done";

const STEPS = [
  { label: "PDF", detail: "Extract text from upload" },
  { label: "Chunk", detail: "Split into overlapping passages" },
  { label: "Embed", detail: "Gemini embeddings → pgvector" },
  { label: "Retrieve", detail: "Vector similarity search" },
  { label: "Generate", detail: "Gemini answers from context" },
];

const DOT_STYLES: Record<StepStatus, string> = {
  idle: "border-zinc-700 bg-zinc-900 text-zinc-500",
  active: "border-violet-500/60 bg-violet-500/15 text-violet-300",
  done: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
};

export default function Pipeline({ statuses }: { statuses: StepStatus[] }) {
  return (
    <section>
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        Pipeline
      </h3>
      <ol className="mt-3">
        {STEPS.map((step, index) => {
          const status = statuses[index] ?? "idle";
          return (
            <li key={step.label} className="relative flex gap-3 pb-3 last:pb-0">
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute top-6 bottom-0 left-[11px] w-px ${
                    status === "done" ? "bg-emerald-500/30" : "bg-zinc-800"
                  }`}
                />
              )}
              <span
                className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[10px] transition-colors ${DOT_STYLES[status]}`}
              >
                {status === "done" ? (
                  <CheckIcon className="h-3 w-3" />
                ) : status === "active" ? (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                ) : (
                  index + 1
                )}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={`text-xs font-medium ${
                    status === "idle" ? "text-zinc-400" : "text-zinc-100"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-zinc-500">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
