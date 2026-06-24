const { callAgent } = require("../config/groqClient");
const { safeParseJSON } = require("../utils/jsonParser");

const SYSTEM_PROMPT = `You are the Optimizer Agent in CogniCraft. Analyze code for performance and efficiency improvements:
time complexity, memory usage, and industry best practices. If the code is already optimal, say so.

Respond ONLY with valid JSON, no markdown fences:
{
  "timeComplexity": "Big-O notation, e.g. O(n log n)",
  "spaceComplexity": "Big-O notation, e.g. O(n)",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "optimizedCode": "improved code if applicable, otherwise same as input, with \\n for newlines",
  "reasoning": "summary of optimization analysis",
  "confidence": number (0-100)
}`;

async function runOptimizer(code, language, reporter) {
  reporter.started("optimizer", "Optimizer Agent", "Analyzing performance characteristics...");

  const result = await callAgent({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `Language: ${language}\n\nCode:\n${code}`,
    temperature: 0.2,
    jsonMode: true,
  });

  if (!result.success) {
    reporter.failed("optimizer", "Optimizer Agent", "Optimization analysis failed");
    return null;
  }

  const output = safeParseJSON(result.content, {
    timeComplexity: "Unknown",
    spaceComplexity: "Unknown",
    suggestions: [],
    optimizedCode: code,
    reasoning: "Analysis skipped due to parsing issue",
    confidence: 50,
  });

  reporter.completed("optimizer", "Optimizer Agent", {
    message: `Complexity: ${output.timeComplexity} time, ${output.spaceComplexity} space`,
    reasoning: output.reasoning,
    confidence: output.confidence,
    data: output,
  });

  return output;
}

module.exports = { runOptimizer };
