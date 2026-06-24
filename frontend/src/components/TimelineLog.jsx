import { useEffect, useRef } from "react";
import { STATUS_COLOR } from "../utils/agentDefinitions";

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function TimelineLog({ timeline }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [timeline.length]);

  return (
    <div className="rounded-lg border border-trace bg-[#080B14] p-3 h-56 overflow-y-auto font-mono text-xs">
      {timeline.length === 0 && (
        <p className="text-ink-faint">Awaiting pipeline execution...</p>
      )}
      {timeline.map((event, idx) => (
        <div key={idx} className="flex gap-2 py-0.5 leading-relaxed">
          <span className="text-ink-faint flex-shrink-0">{formatTime(event.timestamp)}</span>
          <span
            className="flex-shrink-0"
            style={{ color: STATUS_COLOR[event.status] }}
          >
            [{event.agentLabel}]
          </span>
          <span className="text-ink-dim break-words">{event.message}</span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
