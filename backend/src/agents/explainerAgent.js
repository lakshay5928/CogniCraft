const { callAgent } = require("../config/groqClient");
const { safeParseJSON } = require("../utils/jsonParser");

const SYSTEM_PROMPT = `You are the Explainer & Documentation Agent in CogniCraft.
Given a piece of code, produce a beginner-friendly explanation AND professional documentation.

Respond ONLY with valid JSON, no markdown fences:
{
  "summary": "1-2 sentence plain-English summary of what the code does",
  "lineByLine": [{"line": "code snippet or line range", "explanation": "what it does"}],
  "docstring": "a properly formatted docstring/comment block for the function/class",
  "readme": "a short markdown README section: ## Usage, example, parameters, return value",
  "reasoning": "note on what was emphasized in the explanation and why",
  "confidence": number (0-100)
}`;

async function runExplainer(code, language, reporter) {
  reporter.started("explainer", "Explainer Agent", "Writing explanation and docs...");

  const result = await callAgent({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Language: ${language}\n\nCode:\n${code}`,
    temperature: 0.3,
    jsonMode: true,
  });

  if (!result.success) {
    reporter.failed("explainer", "Explainer Agent", "Explanation generation failed");
    return null;
  }

  const output = safeParseJSON(result.content, {
    summary: "Explanation unavailable",
    lineByLine: [],
    docstring: "",
    readme: "",
    reasoning: "Fallback due to parsing issue",
    confidence: 50,
  });

  reporter.completed("explainer", "Explainer Agent", {
    message: "Explanation and documentation ready",
    reasoning: output.reasoning,
    confidence: output.confidence,
    data: output,
  });

  return output;
}

module.exports = { runExplainer };
