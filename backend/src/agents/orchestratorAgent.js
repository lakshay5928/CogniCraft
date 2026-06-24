const { callAgent } = require("../config/groqClient");
const { safeParseJSON } = require("../utils/jsonParser");

const SYSTEM_PROMPT = `You are the Orchestrator Agent in a multi-agent coding assistant system called CogniCraft.
Your ONLY job is to classify the user's request and extract structured info. Do not solve the task yourself.

Classify intent into exactly one of:
- "generate": user wants new code written from a description
- "debug": user has pasted code and wants bugs found/fixed
- "explain": user wants a concept or piece of code explained (learning intent)
- "review": user wants existing code reviewed for quality

Also detect the programming language if mentionable (default "unspecified" if unclear).

Respond ONLY with valid JSON, no markdown fences, in this exact shape:
{
  "intent": "generate" | "debug" | "explain" | "review",
  "language": "string",
  "reasoning": "one short sentence on why you classified it this way",
  "confidence": number (0-100)
}`;

async function runOrchestrator(userInput, reporter) {
  reporter.started("orchestrator", "Orchestrator Agent", "Analyzing your request...");

  const result = await callAgent({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: userInput,
    temperature: 0.1,
    jsonMode: true,
  });

  if (!result.success) {
    reporter.failed("orchestrator", "Orchestrator Agent", "Could not analyze request");
    return { intent: "generate", language: "unspecified", reasoning: "Defaulted due to error", confidence: 50 };
  }

  const parsed = safeParseJSON(result.content, {
    intent: "generate",
    language: "unspecified",
    reasoning: "Defaulted to code generation",
    confidence: 60,
  });

  reporter.completed("orchestrator", "Orchestrator Agent", {
    message: `Detected intent: ${parsed.intent} (${parsed.language})`,
    reasoning: parsed.reasoning,
    confidence: parsed.confidence,
    data: parsed,
  });

  return parsed;
}

module.exports = { runOrchestrator };
