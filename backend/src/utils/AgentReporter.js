/**
 * AgentReporter - one instance per request/session.
 * Every agent calls this to report its status. The frontend listens
 * to these events to animate the node-graph dashboard in real time.
 *
 * Event shape sent to client:
 * {
 *   agentId: "planner",
 *   agentLabel: "Planner Agent",
 *   status: "started" | "thinking" | "completed" | "failed",
 *   message: string,        // short human-readable log line
 *   reasoning: string|null, // transparency: why agent made a decision
 *   confidence: number|null,// 0-100, self-reported
 *   timestamp: ISOString,
 *   data: any                // payload (code, explanation, etc.) on completion
 * }
 */
class AgentReporter {
  constructor(socket, sessionId) {
    this.socket = socket;
    this.sessionId = sessionId;
    this.timeline = []; // full log for this run, returned at the end too
  }

  _emit(event) {
    const fullEvent = {
      ...event,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };
    this.timeline.push(fullEvent);
    if (this.socket) {
      this.socket.emit("agent_update", fullEvent);
    }
    return fullEvent;
  }

  started(agentId, agentLabel, message) {
    return this._emit({ agentId, agentLabel, status: "started", message });
  }

  thinking(agentId, agentLabel, message) {
    return this._emit({ agentId, agentLabel, status: "thinking", message });
  }

  completed(agentId, agentLabel, { message, reasoning, confidence, data }) {
    return this._emit({
      agentId,
      agentLabel,
      status: "completed",
      message,
      reasoning: reasoning || null,
      confidence: confidence ?? null,
      data: data ?? null,
    });
  }

  failed(agentId, agentLabel, message) {
    return this._emit({ agentId, agentLabel, status: "failed", message });
  }

  getTimeline() {
    return this.timeline;
  }
}

module.exports = AgentReporter;
