import { useState, useMemo } from "react";
import AgentNode from "./AgentNode";
import { AGENT_DEFINITIONS } from "../utils/agentDefinitions";

const COL_WIDTH = 152;
const ROW_HEIGHT = 90;
const NODE_W = 132;
const NODE_H = 66;

// Defines which agents connect to which, per active pipeline path.
const CONNECTIONS = {
  generate: [
    ["orchestrator", "planner"],
    ["planner", "generator"],
    ["generator", "reviewer_self"],
    ["reviewer_self", "refiner"],
    ["refiner", "optimizer"],
    ["optimizer", "explainer"],
    ["explainer", "reviewer_a"],
    ["explainer", "reviewer_b"],
    ["reviewer_a", "judge"],
    ["reviewer_b", "judge"],
  ],
  debug: [
    ["orchestrator", "error_detector"],
    ["error_detector", "fix_suggester"],
    ["fix_suggester", "optimizer"],
    ["optimizer", "explainer"],
    ["explainer", "reviewer_a"],
    ["explainer", "reviewer_b"],
    ["reviewer_a", "judge"],
    ["reviewer_b", "judge"],
  ],
  explain: [
    ["orchestrator", "teacher"],
    ["teacher", "example_gen"],
    ["example_gen", "exercise_gen"],
  ],
  review: [
    ["orchestrator", "reviewer_a"],
    ["orchestrator", "reviewer_b"],
    ["reviewer_a", "judge"],
    ["reviewer_b", "judge"],
    ["judge", "optimizer"],
  ],
};

function nodeCenter(def) {
  return {
    x: def.col * COL_WIDTH + NODE_W / 2,
    y: (def.row + 2) * ROW_HEIGHT + NODE_H / 2, // +2 offset so row -1 stays in bounds
  };
}

function TracePath({ from, to, active }) {
  const a = nodeCenter(from);
  const b = nodeCenter(to);
  const midX = (a.x + b.x) / 2;

  // Right-angle PCB-trace style path instead of a smooth curve
  const d = `M ${a.x} ${a.y} L ${midX} ${a.y} L ${midX} ${b.y} L ${b.x} ${b.y}`;

  return (
    <path
      d={d}
      fill="none"
      stroke={active ? "#3DD9D6" : "#1B2333"}
      strokeWidth={active ? 2 : 1.5}
      strokeDasharray={active ? "6 4" : "none"}
      className={active ? "animate-trace-flow" : ""}
      style={{ transition: "stroke 0.4s ease" }}
    />
  );
}

export default function PipelineGraph({ agentStates, activeIntent, onSelectAgent, selectedAgentId }) {
  const [hoveredPath] = useState(null);

  const connections = CONNECTIONS[activeIntent] || CONNECTIONS.generate;

  const visibleAgentIds = useMemo(() => {
    const ids = new Set(["orchestrator"]);
    connections.forEach(([from, to]) => {
      ids.add(from);
      ids.add(to);
    });
    return Array.from(ids);
  }, [connections]);

  const maxCol = Math.max(...visibleAgentIds.map((id) => AGENT_DEFINITIONS[id].col));
  const minRow = Math.min(...visibleAgentIds.map((id) => AGENT_DEFINITIONS[id].row));
  const maxRow = Math.max(...visibleAgentIds.map((id) => AGENT_DEFINITIONS[id].row));

  const svgWidth = (maxCol + 1) * COL_WIDTH;
  const svgHeight = (maxRow - minRow + 3) * ROW_HEIGHT;

  return (
    <div className="relative overflow-x-auto pb-2">
      <div
        className="relative"
        style={{ width: svgWidth, height: svgHeight, minWidth: "100%" }}
      >
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          width={svgWidth}
          height={svgHeight}
        >
          {connections.map(([fromId, toId], idx) => {
            const fromDef = AGENT_DEFINITIONS[fromId];
            const toDef = AGENT_DEFINITIONS[toId];
            const fromState = agentStates[fromId];
            const toState = agentStates[toId];
            const active =
              fromState?.status === "completed" &&
              (toState?.status === "completed" ||
                toState?.status === "started" ||
                toState?.status === "thinking");
            return (
              <TracePath key={idx} from={fromDef} to={toDef} active={active} />
            );
          })}
        </svg>

        {visibleAgentIds.map((id) => {
          const def = AGENT_DEFINITIONS[id];
          const center = nodeCenter(def);
          return (
            <div
              key={id}
              className="absolute"
              style={{
                left: center.x - NODE_W / 2,
                top: center.y - NODE_H / 2,
              }}
            >
              <AgentNode
                definition={def}
                state={agentStates[id]}
                isSelected={selectedAgentId === id}
                onClick={() => onSelectAgent(id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
