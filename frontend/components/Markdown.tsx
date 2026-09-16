import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Raw HTML in the answer is not rendered (react-markdown's safe default).
const components: Components = {
  h1: ({ children }) => (
    <h3 className="mt-5 mb-2 text-base font-semibold text-zinc-100 first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="mt-5 mb-2 text-[15px] font-semibold text-zinc-100 first:mt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-4 mb-1.5 text-sm font-semibold text-zinc-100 first:mt-0">
      {children}
    </h4>
  ),
  h4: ({ children }) => (
    <h5 className="mt-4 mb-1.5 text-sm font-semibold text-zinc-200 first:mt-0">
      {children}
    </h5>
  ),
  p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-zinc-100">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="my-3 list-disc space-y-1.5 pl-5 marker:text-zinc-600 first:mt-0 last:mb-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:text-zinc-500 first:mt-0 last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-1 [&>ol]:my-1.5 [&>p]:my-1 [&>ul]:my-1.5">{children}</li>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-violet-300 underline decoration-violet-500/40 underline-offset-2 transition hover:decoration-violet-300"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-200">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs leading-5 [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-zinc-700 pl-3 text-zinc-400">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-zinc-800" />,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full text-left text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-zinc-700 px-2 py-1.5 font-semibold text-zinc-200">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-zinc-800 px-2 py-1.5">{children}</td>
  ),
};

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="text-sm leading-7 break-words text-zinc-300">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
