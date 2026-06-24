import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * Manages the socket connection and the live state of a pipeline run:
 * - agentStates: map of agentId -> latest status (drives node-graph UI)
 * - timeline: ordered log of every event (drives the live log panel)
 * - result: final structured output once pipeline_completed fires
 */
export function usePipelineSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [running, setRunning] = useState(false);
  const [agentStates, setAgentStates] = useState({});
  const [timeline, setTimeline] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("pipeline_started", () => {
      setRunning(true);
      setAgentStates({});
      setTimeline([]);
      setResult(null);
      setError(null);
    });

    socket.on("agent_update", (event) => {
      setAgentStates((prev) => ({
        ...prev,
        [event.agentId]: event,
      }));
      setTimeline((prev) => [...prev, event]);
    });

    socket.on("pipeline_completed", (payload) => {
      setRunning(false);
      setResult(payload.result);
    });

    socket.on("pipeline_error", (payload) => {
      setRunning(false);
      setError(payload.error || "Something went wrong.");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const runPipeline = useCallback((input) => {
    if (!socketRef.current) return;
    socketRef.current.emit("run_pipeline", { input });
  }, []);

  return { connected, running, agentStates, timeline, result, error, runPipeline };
}
