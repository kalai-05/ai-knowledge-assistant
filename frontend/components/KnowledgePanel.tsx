"use client";

import { ChangeEvent, useRef } from "react";
import type { UploadResponse } from "@/lib/api";
import DocumentCard from "./DocumentCard";
import ErrorAlert from "./ErrorAlert";
import Pipeline, { StepStatus } from "./Pipeline";
import UploadZone from "./UploadZone";

const TECH_STACK = ["Next.js", "FastAPI", "PostgreSQL", "pgvector", "Gemini"];

interface KnowledgePanelProps {
  document: UploadResponse | null;
  uploading: boolean;
  asking: boolean;
  answered: boolean;
  error: string;
  onUpload: (file: File) => void;
  onDismissError: () => void;
}

function pipelineStatuses(
  document: UploadResponse | null,
  uploading: boolean,
  asking: boolean,
  answered: boolean
): StepStatus[] {
  if (uploading) return ["active", "active", "active", "idle", "idle"];
  if (!document) return ["idle", "idle", "idle", "idle", "idle"];
  if (asking) return ["done", "done", "done", "active", "active"];
  if (answered) return ["done", "done", "done", "done", "done"];
  return ["done", "done", "done", "idle", "idle"];
}

export default function KnowledgePanel({
  document,
  uploading,
  asking,
  answered,
  error,
  onUpload,
  onDismissError,
}: KnowledgePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = uploading || asking;

  function openPicker() {
    inputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onUpload(file);
  }

  return (
    <aside className="flex flex-col gap-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 lg:min-h-0 lg:overflow-y-auto">
      <div>
        <h2 className="text-sm font-semibold text-zinc-100">Knowledge Base</h2>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Upload documents to build your searchable context.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {document && !uploading ? (
          <DocumentCard
            document={document}
            disabled={busy}
            onReplace={openPicker}
          />
        ) : (
          <UploadZone
            processing={uploading}
            disabled={busy}
            onBrowse={openPicker}
            onFile={onUpload}
          />
        )}

        {error && (
          <ErrorAlert
            title="PDF upload failed"
            message={error}
            onDismiss={onDismissError}
          />
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={busy}
          className="hidden"
        />
      </div>

      <div className="border-t border-zinc-800/80 pt-5">
        <Pipeline
          statuses={pipelineStatuses(document, uploading, asking, answered)}
        />
      </div>

      <div className="mt-auto border-t border-zinc-800/80 pt-5">
        <h3 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          Built with
        </h3>
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {TECH_STACK.map((item) => (
            <li
              key={item}
              className="rounded-md border border-zinc-800 px-2 py-0.5 text-[11px] text-zinc-500"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
