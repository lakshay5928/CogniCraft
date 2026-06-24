import { STATUS_COLOR } from "../utils/agentDefinitions";

const STATUS_LABEL = {
  idle: "Idle",
  started: "Active",
  thinking: "Thinking",
  completed: "Done",
  failed: "Failed",
};

export default function AgentNode({ definition, state, onClick, isSelected }) {
  const status = state?.status || "idle";
  const color = STATUS_COLOR[status];
  const isActive = status === "started" || status === "thinking";
  const isDone = status === "completed";
  const isFailed = status === "failed";

  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left
        transition-all duration-300 min-w-[132px] font-mono hover:-translate-y-0.5
        ${isSelected ? "ring-2 ring-cyan ring-offset-2 ring-offset-base" : ""}
        ${isActive ? "border-amber shadow-glow-amber animate-pulse-glow bg-surface" : ""}
        ${isDone ? "border-cyan/60 bg-surface shadow-glow hover:border-cyan" : ""}
        ${isFailed ? "border-rose/60 bg-surface" : ""}
        ${status === "idle" ? "border-trace bg-surface/40 opacity-50" : ""}
      `}
      aria-label={`${definition.label}: ${STATUS_LABEL[status]}`}
    >
      <div className="flex items-center justify-between w-full gap-2">
        <span
          className="text-[10px] tracking-widest uppercase font-semibold"
          style={{ color }}
        >
          {definition.short}
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-ink leading-tight font-body">{definition.label}</span>
      <span className="text-[10px] text-ink-faint font-body">{STATUS_LABEL[status]}</span>
      {state?.confidence != null && isDone && (
        <span className="text-[10px] text-cyan/80 font-body">{state.confidence}% confidence</span>
      )}
    </button>
  );
}
