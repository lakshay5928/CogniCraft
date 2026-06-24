const { callAgent } = require("../config/groqClient");
const { safeParseJSON } = require("../utils/jsonParser");

const DETECT_PROMPT = `You are the Error Detector Agent in CogniCraft. Analyze the given code for syntax errors,
logical errors, and likely runtime issues. Be precise about line/location when possible.

Respond ONLY with valid JSON, no markdown fences:
{
  "errorsFound": boolean,
  "errors": [{"type": "syntax|logical|runtime", "location": "where in the code", "description": "what's wrong"}],
  "reasoning": "summary of analysis approach",
  "confidence": number (0-100)
}`;

const FIX_PROMPT = `You are the Fix Suggester Agent in CogniCraft. Given code and a list of detected errors,
provide the corrected code and explain the root cause of each issue.

Respond ONLY with valid JSON, no markdown fences:
{
  "fixedCode": "the complete corrected code, with \\n for newlines",
  "rootCauses": ["root cause explanation for error 1", "root cause explanation for error 2"],
  "bestPractices": ["relevant best practice tip 1", "tip 2"],
  "reasoning": "summary of fixes applied",
  "confidence": number (0-100)
}`;

async function runErrorDetector(code, language, reporter) {
  reporter.started("error_detector", "Error Detector Agent", "Scanning for syntax and logical errors...");

  const result = await callAgent({
    systemPrompt: DETECT_PROMPT,
    userPrompt: `Language: ${language}\n\nCode:\n${code}`,
    temperature: 0.1,
    jsonMode: true,
  });

  if (!result.success) {
    reporter.failed("error_detector", "Error Detector Agent", "Detection failed");
    return { errorsFound: false, errors: [], reasoning: "Detection skipped", confidence: 50 };
  }

  const detection = safeParseJSON(result.content, {
    errorsFound: false,
    errors: [],
    reasoning: "No errors detected",
    confidence: 60,
  });

  reporter.completed("error_detector", "Error Detector Agent", {
    message: detection.errorsFound
      ? `Found ${detection.errors.length} issue(s)`
      : "No errors detected",
    reasoning: detection.reasoning,
    confidence: detection.confidence,
    data: detection,
  });

  return detection;
}

async function runFixSuggester(code, language, errors, reporter) {
  reporter.started("fix_suggester", "Fix Suggester Agent", "Generating fixes...");

  const userPrompt = `Language: ${language}\n\nCode:\n${code}\n\nDetected errors:\n${JSON.stringify(errors)}`;

  const result = await callAgent({
    systemPrompt: FIX_PROMPT,
    userPrompt,
    temperature: 0.2,
    jsonMode: true,
  });

  if (!result.success) {
    reporter.failed("fix_suggester", "Fix Suggester Agent", "Fix generation failed");
    return { fixedCode: code, rootCauses: [], bestPractices: [], reasoning: "Fix skipped", confidence: 50 };
  }

  const fix = safeParseJSON(result.content, {
    fixedCode: code,
    rootCauses: [],
    bestPractices: [],
    reasoning: "Fallback due to parsing issue",
    confidence: 50,
  });

  reporter.completed("fix_suggester", "Fix Suggester Agent", {
    message: `Fixes applied, ${fix.bestPractices.length} best-practice tip(s) included`,
    reasoning: fix.reasoning,
    confidence: fix.confidence,
    data: fix,
  });

  return fix;
}

module.exports = { runErrorDetector, runFixSuggester };
