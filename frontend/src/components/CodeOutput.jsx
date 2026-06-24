import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CodeOutput({ code, language = "javascript" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const handleDownload = () => {
    const extMap = { python: "py", javascript: "js", java: "java", cpp: "cpp", c: "c", sql: "sql", typescript: "ts" };
    const ext = extMap[language?.toLowerCase()] || "txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cognicraft-output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!code) {
    return (
      <div className="rounded-lg border border-dashed border-trace bg-surface/30 p-8 text-center text-ink-faint text-sm font-body">
        Generated code will appear here once the pipeline completes.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-trace overflow-hidden animate-rise-in shadow-[0_0_0_1px_rgba(61,217,214,0.06)]">
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-surface to-base border-b border-trace">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose/70" />
          <span className="w-2 h-2 rounded-full bg-amber/70" />
          <span className="w-2 h-2 rounded-full bg-cyan/70" />
          <span className="text-xs font-mono text-cyan uppercase tracking-wider ml-2">{language}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="text-[11px] px-2.5 py-1 rounded border border-trace text-ink-dim hover:text-cyan hover:border-cyan/50 transition-colors font-body"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="text-[11px] px-2.5 py-1 rounded border border-trace text-ink-dim hover:text-cyan hover:border-cyan/50 transition-colors font-body"
          >
            Download
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language?.toLowerCase()}
        style={vscDarkPlus}
        showLineNumbers
        lineNumberStyle={{ color: "#3A4258", minWidth: "2.5em", userSelect: "none" }}
        customStyle={{
          margin: 0,
          background: "#080B14",
          fontSize: "13px",
          padding: "16px",
          maxHeight: "480px",
        }}
        codeTagProps={{ style: { fontFamily: "JetBrains Mono, monospace" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
