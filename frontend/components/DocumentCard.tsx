import type { UploadResponse } from "@/lib/api";
import { CheckIcon, FileTextIcon, RefreshIcon } from "./icons";

interface DocumentCardProps {
  document: UploadResponse;
  disabled?: boolean;
  onReplace: () => void;
}

export default function DocumentCard({
  document,
  disabled,
  onReplace,
}: DocumentCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">
          <FileTextIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-medium text-zinc-100"
            title={document.filename}
          >
            {document.filename}
          </p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-400">
            <CheckIcon className="h-3 w-3" />
            Indexed
          </span>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-zinc-900 px-3 py-2">
          <dt className="text-[11px] text-zinc-500">Chunks</dt>
          <dd className="font-mono text-sm text-zinc-100">
            {document.chunks_created}
          </dd>
        </div>
        <div className="rounded-lg bg-zinc-900 px-3 py-2">
          <dt className="text-[11px] text-zinc-500">Document ID</dt>
          <dd className="font-mono text-sm text-zinc-400">
            #{document.document_id}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3">
        <span className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Ready for questions
        </span>
        <button
          type="button"
          onClick={onReplace}
          disabled={disabled}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshIcon className="h-3.5 w-3.5" />
          Replace document
        </button>
      </div>
    </div>
  );
}
