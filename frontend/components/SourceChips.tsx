import { DatabaseIcon } from "./icons";

export function SourceChipList({ sources }: { sources: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {sources.map((source, index) => {
        // Backend returns labels like "Chunk 13"; show the number as a chip.
        const chunkNumber = source.match(/\d+/)?.[0];
        return (
          <li
            key={`${source}-${index}`}
            title={source}
            className="inline-flex items-center gap-1 rounded-md border border-violet-500/20 bg-violet-500/5 px-2 py-1 text-[11px] transition hover:border-violet-500/40 hover:bg-violet-500/10"
          >
            {chunkNumber ? (
              <>
                <span className="text-zinc-500">Chunk</span>
                <span className="font-mono font-medium text-violet-200">
                  #{chunkNumber}
                </span>
              </>
            ) : (
              <span className="font-mono text-violet-200">{source}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function SourceChips({ sources }: { sources: string[] }) {
  return (
    <div className="mt-4 border-t border-zinc-800 pt-3">
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
        <DatabaseIcon className="h-3.5 w-3.5 text-violet-400/80" />
        <span className="font-medium uppercase tracking-wider">
          Retrieved sources
        </span>
        <span className="text-zinc-600">
          · {sources.length} {sources.length === 1 ? "chunk" : "chunks"} via
          semantic search
        </span>
      </div>
      <div className="mt-2">
        <SourceChipList sources={sources} />
      </div>
    </div>
  );
}
