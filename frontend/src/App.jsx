import { useState } from "react";
import Header from "./components/Header";
import PromptInput from "./components/PromptInput";
import PipelineGraph from "./components/PipelineGraph";
import AgentDetailPanel from "./components/AgentDetailPanel";
import TimelineLog from "./components/TimelineLog";
import ResultTabs from "./components/ResultTabs";
import HistoryPanel from "./components/HistoryPanel";
import EvalDashboard from "./components/EvalDashboard";
import EmptyState from "./components/EmptyState";
import { usePipelineSocket } from "./hooks/usePipelineSocket";
import { AGENT_DEFINITIONS } from "./utils/agentDefinitions";

export default function App() {
  const { connected, running, agentStates, timeline, result, error, runPipeline } = usePipelineSocket();
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [evalOpen, setEvalOpen] = useState(false);
  const [prefillPrompt, setPrefillPrompt] = useState("");

  const activeIntent = result?.intent || agentStates.orchestrator?.data?.intent || "generate";
  const selectedAgentState = selectedAgentId ? agentStates[selectedAgentId] : null;
  const hasStarted = running || timeline.length > 0;

  const handleSubmit = (input) => {
    setSelectedAgentId(null);
    runPipeline(input);
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-4 md:px-6">
      <Header
        connected={connected}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenEval={() => setEvalOpen(true)}
      />

      <main className="py-6 space-y-6">
        <section>
          <PromptInput onSubmit={handleSubmit} disabled={running} prefill={prefillPrompt} />
          {error && (
            <p className="mt-2 text-xs text-rose font-body animate-rise-in">{error}</p>
          )}
        </section>

        {!hasStarted && <EmptyState />}

        {hasStarted && (
          <section className="space-y-3 animate-rise-in">
            <h2 className="text-[11px] uppercase tracking-widest text-ink-faint font-mono">
              Agent Pipeline
            </h2>
            <div className="rounded-lg border border-trace bg-surface/30 p-4">
              <PipelineGraph
                agentStates={agentStates}
                activeIntent={activeIntent}
                onSelectAgent={setSelectedAgentId}
                selectedAgentId={selectedAgentId}
              />
            </div>
          </section>
        )}

        {hasStarted && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-rise-in">
            <div className="space-y-2">
              <h2 className="text-[11px] uppercase tracking-widest text-ink-faint font-mono">
                Agent Detail
              </h2>
              <AgentDetailPanel
                agentState={selectedAgentState}
                definition={selectedAgentId ? AGENT_DEFINITIONS[selectedAgentId] : null}
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-[11px] uppercase tracking-widest text-ink-faint font-mono">
                Live Timeline
              </h2>
              <TimelineLog timeline={timeline} />
            </div>
          </section>
        )}

        {result && (
          <section className="space-y-2 animate-rise-in">
            <h2 className="text-[11px] uppercase tracking-widest text-ink-faint font-mono">
              Result
            </h2>
            <div className="rounded-lg border border-trace bg-surface/30 p-4">
              <ResultTabs result={result} />
            </div>
          </section>
        )}
      </main>

      <footer className="py-8 text-center text-[11px] text-ink-faint font-mono">
        CogniCraft — built on open-source LLMs via Groq
      </footer>

      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectPrompt={(p) => setPrefillPrompt(p)}
      />

      <EvalDashboard open={evalOpen} onClose={() => setEvalOpen(false)} />
    </div>
  );
}
