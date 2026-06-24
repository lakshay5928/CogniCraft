export default function AgentDetailPanel({ agentState, definition }) {
  if (!agentState) {
    return (
      <div className="rounded-lg border border-trace bg-surface/40 p-4 text-ink-dim text-sm font-body">
        Select an agent node to see its reasoning and output.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-trace bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm text-ink font-semibold">
          {definition?.label || agentState.agentLabel}
        </h3>
        {agentState.confidence != null && (
          <span className="text-xs font-mono text-cyan">{agentState.confidence}% confidence</span>
        )}
      </div>

      <p className="text-sm text-ink-dim font-body">{agentState.message}</p>

      {agentState.reasoning && (
        <div className="pt-2 border-t border-trace">
          <p className="text-[10px] uppercase tracking-widest text-violet mb-1 font-mono">Reasoning</p>
          <p className="text-sm text-ink-dim font-body italic">{agentState.reasoning}</p>
        </div>
      )}

      {agentState.confidence != null && (
        <div className="w-full h-1.5 bg-trace rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet to-cyan transition-all duration-700"
            style={{ width: `${agentState.confidence}%` }}
          />
        </div>
      )}
    </div>
  );
}
