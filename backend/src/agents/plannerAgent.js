const { callAgent } = require("../config/groqClient");
const { safeParseJSON } = require("../utils/jsonParser");

const SYSTEM_PROMPT = `You are the Planner Agent in CogniCraft, a multi-agent coding assistant.
Given a coding requirement, break it down into a clear implementation plan BEFORE any code is written.
Do not write code yet.

Respond ONLY with valid JSON, no markdown fences:
{
  "language": "the programming language to use",
  "approach": "1-2 sentence summary of the implementation approach",
  "steps": ["step 1", "step 2", "step 3"],
  "edgeCases": ["edge case 1", "edge case 2"],
  "reasoning": "why this approach was chosen over alternatives",
  "confidence": number (0-100)
}`;

async function runPlanner(userInput, language, reporter) {
  reporter.started("planner", "Planner Agent", "Breaking down the requirement...");

  const userPrompt = `Requirement: ${userInput}\nPreferred language (if any): ${language}`;

  const result = await callAgent({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.2,
    jsonMode: true,
  });

  if (!result.success) {
    reporter.failed("planner", "Planner Agent", "Planning failed");
    return null;
  }

  const plan = safeParseJSON(result.content, {
    language: language || "javascript",
    approach: "Direct implementation",
    steps: ["Implement the requirement"],
    edgeCases: [],
    reasoning: "Default plan due to parsing issue",
    confidence: 50,
  });

  reporter.completed("planner", "Planner Agent", {
    message: `Plan ready: ${plan.steps.length} steps identified`,
    reasoning: plan.reasoning,
    confidence: plan.confidence,
    data: plan,
  });

  return plan;
}

module.exports = { runPlanner };
