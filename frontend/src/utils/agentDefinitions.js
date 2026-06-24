/**
 * Static metadata for rendering agents in the node graph.
 * Position is grid-based (col, row) so the SVG layout can be computed simply.
 */
export const AGENT_DEFINITIONS = {
  orchestrator: { label: "Orchestrator", short: "ORC", col: 0, row: 1, color: "cyan" },

  // Generate path
  planner: { label: "Planner", short: "PLN", col: 1, row: 0, color: "cyan" },
  generator: { label: "Code Generator", short: "GEN", col: 2, row: 0, color: "cyan" },
  reviewer_self: { label: "Self-Review", short: "REV", col: 3, row: 0, color: "violet" },
  refiner: { label: "Refiner", short: "RFN", col: 4, row: 0, color: "violet" },

  // Debug path
  error_detector: { label: "Error Detector", short: "ERR", col: 1, row: 1, color: "rose" },
  fix_suggester: { label: "Fix Suggester", short: "FIX", col: 2, row: 1, color: "rose" },

  // Shared downstream
  optimizer: { label: "Optimizer", short: "OPT", col: 5, row: 0, color: "amber" },
  explainer: { label: "Explainer & Docs", short: "DOC", col: 6, row: 0, color: "cyan" },
  reviewer_a: { label: "Reviewer A", short: "R-A", col: 7, row: -1, color: "violet" },
  reviewer_b: { label: "Reviewer B", short: "R-B", col: 7, row: 1, color: "violet" },
  judge: { label: "Judge", short: "JDG", col: 8, row: 0, color: "amber" },

  // Learning path
  teacher: { label: "Concept Teacher", short: "TCH", col: 1, row: 2, color: "violet" },
  example_gen: { label: "Example Generator", short: "EX", col: 2, row: 2, color: "violet" },
  exercise_gen: { label: "Exercise Generator", short: "EXR", col: 3, row: 2, color: "violet" },
};

export const STATUS_COLOR = {
  idle: "#1B2333",
  started: "#F2B33D",
  thinking: "#F2B33D",
  completed: "#3DD9D6",
  failed: "#FF6B7A",
};
