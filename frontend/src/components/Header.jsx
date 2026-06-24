export default function Header({ connected, onOpenHistory, onOpenEval }) {
  return (
    <header className="flex items-center justify-between py-5 border-b border-trace">
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-md bg-gradient-to-br from-cyan to-violet flex items-center justify-center font-display font-bold text-base text-sm shadow-glow">
          C
        </div>
        <div>
          <h1 className="font-display text-lg font-semibold text-ink leading-none tracking-tight">
            CogniCraft
          </h1>
          <p className="text-[10px] text-ink-faint font-mono tracking-wide mt-0.5">
            multi-agent coding system
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenEval}
          className="flex items-center gap-1.5 text-xs text-ink-dim hover:text-violet transition-colors font-body
                     px-2.5 py-1.5 rounded-md border border-trace hover:border-violet/40"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M18 17V9M13 17V5M8 17v-3" />
          </svg>
          <span className="hidden sm:inline">Eval Report</span>
        </button>

        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 text-xs text-ink-dim hover:text-cyan transition-colors font-body
                     px-2.5 py-1.5 rounded-md border border-trace hover:border-cyan/40"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
          <span className="hidden sm:inline">History</span>
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${connected ? "bg-cyan shadow-glow animate-pulse-glow" : "bg-rose"}`}
          />
          <span className="text-xs text-ink-faint font-mono hidden sm:inline">
            {connected ? "connected" : "disconnected"}
          </span>
        </div>
      </div>
    </header>
  );
}
