const { callAgent } = require("../config/groqClient");
const { safeParseJSON } = require("../utils/jsonParser");

const SYSTEM_PROMPT = `You are the Code Generator Agent in CogniCraft.
Given a requirement and an implementation plan, write clean, working, production-quality code.
Follow standard conventions for the target language. Include necessary imports.
Do not include explanations in the code comments beyond brief clarifying comments.

For compiled languages (C++, Java, C, etc.): if your solution uses a helper function, define that
helper function BEFORE the function that calls it (or add a forward declaration at the top), so the
code compiles top-to-bottom without "not declared in this scope" errors. Double-check this ordering
before finalizing the code.

Respond ONLY with valid JSON, no markdown fences:
{
  "code": "the complete code as a string, with \\n for newlines",
  "language": "the language used",
  "reasoning": "brief note on key implementation choices made",
  "confidence": number (0-100)
}`;

async function runGenerator(userInput, plan, reporter) {
  reporter.started("generator", "Code Generator Agent", "Generating code...");

  const userPrompt = `Requirement: ${userInput}

Plan:
- Approach: ${plan?.approach || "N/A"}
- Steps: ${(plan?.steps || []).join(", ")}
- Edge cases to handle: ${(plan?.edgeCases || []).join(", ")}
- Language: ${plan?.language || "best guess"}`;

  const result = await callAgent({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.2,
    jsonMode: true,
  });

  if (!result.success) {
    reporter.failed("generator", "Code Generator Agent", "Code generation failed");
    return null;
  }

  const output = safeParseJSON(result.content, {
    code: "// Generation failed, please retry",
    language: plan?.language || "javascript",
    reasoning: "Fallback due to parsing issue",
    confidence: 40,
  });

  reporter.completed("generator", "Code Generator Agent", {
    message: `Generated ${output.language} code (${output.code.split("\\n").length} lines)`,
    reasoning: output.reasoning,
    confidence: output.confidence,
    data: output,
  });

  return output;
}

module.exports = { runGenerator };
