import { useState, useEffect } from "react";

const EXAMPLES = [
  "Write a Python function to find the second largest element in an array",
  "Debug this code: def add(a, b): return a + b + 1",
  "Explain how recursion works",
  "Write a SQL query to find duplicate emails in a Users table",
];

export default function PromptInput({ onSubmit, disabled, prefill }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (prefill) setValue(prefill);
  }, [prefill]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative group">
        <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-cyan/0 via-cyan/0 to-violet/0 group-focus-within:from-cyan/20 group-focus-within:to-violet/20 transition-all duration-300 pointer-events-none blur-sm" />
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe what you want to build, paste code to debug, or ask about a concept..."
          rows={3}
          maxLength={8000}
          disabled={disabled}
          className="relative w-full rounded-lg bg-surface border border-trace focus:border-cyan/60 text-ink placeholder:text-ink-faint
                     p-4 pr-28 text-sm font-body resize-none transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="absolute bottom-3.5 right-3.5 px-4 py-1.5 rounded-md bg-gradient-to-r from-cyan to-cyan/80 text-base text-xs font-display font-semibold
                     hover:shadow-glow transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none
                     flex items-center gap-1.5"
        >
          {disabled ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-base animate-pulse" />
              Running
            </>
          ) : (
            "Run Agents"
          )}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setValue(ex)}
            disabled={disabled}
            className="text-[11px] px-2.5 py-1 rounded-full border border-trace text-ink-faint hover:text-cyan hover:border-cyan/40
                       transition-colors font-body disabled:opacity-40"
          >
            {ex.length > 42 ? ex.slice(0, 42) + "…" : ex}
          </button>
        ))}
      </div>
    </form>
  );
}
