import { useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";
interface FormattedMarkdownProps {
  content: string;
}
export const FormattedMarkdown = ({ content }: FormattedMarkdownProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const handleCopy = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded bg-white/10 text-sky-300 font-mono text-xs border border-white/10"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };
  const blocks = content.split(/(```[\s\S]*?```)/g);
  let codeBlockCounter = 0;
  return (
    <div className="space-y-3 text-sm leading-relaxed text-neutral-200">
      {blocks.map((block, bIdx) => {
        if (block.startsWith("```") && block.endsWith("```")) {
          const currentCodeIdx = codeBlockCounter++;
          const firstLineEnd = block.indexOf("\n");
          const rawLang = block.slice(3, firstLineEnd).trim();
          const lang = rawLang || "code";
          const codeText = block.slice(firstLineEnd + 1, -3).trim();
          return (
            <div
              key={bIdx}
              className="my-4 rounded-xl bg-[#050507] border border-white/10 overflow-hidden shadow-2xl font-mono text-xs"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 text-neutral-400">
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-sky-400" />
                  <span className="uppercase tracking-wider text-[11px] font-semibold text-neutral-300">
                    {lang}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(codeText, currentCodeIdx)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-neutral-300 transition-all text-[11px] cursor-pointer"
                >
                  {copiedIndex === currentCodeIdx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 overflow-x-auto text-sky-100 bg-[#08080c] leading-relaxed">
                <pre>{codeText}</pre>
              </div>
            </div>
          );
        }
        const lines = block.split("\n");
        return (
          <div key={bIdx} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1.5" />;
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={lIdx} className="text-base font-semibold text-white pt-2 pb-1 border-b border-white/10">
                    {parseInline(trimmed.slice(4))}
                  </h3>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h2 key={lIdx} className="text-lg font-bold text-white pt-3 pb-1 border-b border-white/10">
                    {parseInline(trimmed.slice(3))}
                  </h2>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h1 key={lIdx} className="text-xl font-extrabold text-white pt-3 pb-1">
                    {parseInline(trimmed.slice(2))}
                  </h1>
                );
              }
              const matchOrdered = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (matchOrdered) {
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 pl-2 py-0.5">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-white/10 text-sky-300 font-mono text-xs flex items-center justify-center font-bold">
                      {matchOrdered[1]}
                    </span>
                    <p className="flex-1 text-neutral-200">{parseInline(matchOrdered[2])}</p>
                  </div>
                );
              }
              if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 pl-3 py-0.5">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-sky-400 mt-2" />
                    <p className="flex-1 text-neutral-200">{parseInline(trimmed.slice(2))}</p>
                  </div>
                );
              }
              return (
                <p key={lIdx} className="text-neutral-200">
                  {parseInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

