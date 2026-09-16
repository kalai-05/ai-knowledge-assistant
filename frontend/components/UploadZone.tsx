"use client";

import { DragEvent, useState } from "react";
import { Spinner, UploadIcon } from "./icons";

interface UploadZoneProps {
  processing: boolean;
  disabled?: boolean;
  onBrowse: () => void;
  onFile: (file: File) => void;
}

export default function UploadZone({
  processing,
  disabled,
  onBrowse,
  onFile,
}: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);

  if (processing) {
    return (
      <div
        role="status"
        className="rounded-xl border border-violet-500/25 bg-violet-500/5 px-4 py-6"
      >
        <div className="flex items-center gap-3">
          <Spinner className="h-5 w-5 text-violet-400" />
          <div>
            <p className="text-sm font-medium text-zinc-100">
              Processing document
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">
              Extracting text and generating embeddings...
            </p>
          </div>
        </div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-1/3 animate-indeterminate rounded-full bg-violet-500 motion-reduce:animate-none" />
        </div>
      </div>
    );
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (!disabled) setDragging(true);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <button
      type="button"
      onClick={onBrowse}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      disabled={disabled}
      className={`group flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-50 ${
        dragging
          ? "border-violet-500 bg-violet-500/10"
          : "border-zinc-700 bg-zinc-950/40 hover:border-violet-500/60 hover:bg-zinc-900"
      }`}
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition group-hover:border-violet-500/40 group-hover:text-violet-300">
        <UploadIcon className="h-5 w-5" />
      </span>
      <span className="mt-3 text-sm font-medium text-zinc-200">
        Drop a PDF here
      </span>
      <span className="mt-0.5 text-xs text-zinc-500">
        or <span className="text-violet-300">click to browse</span>
      </span>
      <span className="mt-3 rounded-md bg-zinc-800/70 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        PDF only
      </span>
    </button>
  );
}
