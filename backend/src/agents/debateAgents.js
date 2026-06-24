const { callAgent } = require("../config/groqClient");
const { safeParseJSON } = require("../utils/jsonParser");

const REVIEWER_A_PROMPT = `You are Reviewer A in CogniCraft, a code review agent focused on READABILITY, naming conventions,
code structure, and maintainability. Be specific and critical.

Respond ONLY with valid JSON, no markdown fences:
{
  "perspective": "readability",
  "findings": ["finding 1", "finding 2"],
  "verdict": "short overall verdict, 1 sentence",
  "score": number (0-100, code quality from this perspective),
  "confidence": number (0-100)
}`;

const REVIEWER_B_PROMPT = `You are Reviewer B in CogniCraft, a code review agent focused on PERFORMANCE, edge cases,
and potential bugs. Be specific and critical. Disagree with a readability-focused reviewer if performance is being sacrificed.

Respond ONLY with valid JSON, no markdown fences:
{
  "perspective": "performance_and_correctness",
  "findings": ["finding 1", "finding 2"],
  "verdict": "short overall verdict, 1 sentence",
  "score": number (0-100, code quality from this perspective),
  "confidence": number (0-100)
}`;

const JUDGE_PROMPT = `You are the Judge Agent in CogniCraft. Two reviewers (A: readability-focused, B: performance-focused)
have reviewed the same code independently. Synthesize both perspectives into one final verdict.
If they disagree, explicitly note the tradeoff and which matters more for this code.

Respond ONLY with valid JSON, no markdown fences:
{
  "finalVerdict": "1-2 sentence combined verdict",
  "agreements": ["point both reviewers agreed on"],
  "disagreements": ["point where reviewers differed, and how you resolved it"],
  "overallScore": number (0-100),
  "topRecommendation": "the single most important thing to fix or note",
  "reasoning": "why you weighed things the way you did",
  "confidence": number (0-100)
}`;

async function runReviewDebate(code, language, reporter) {
  reporter.started("reviewer_a", "Reviewer A (Readability)", "Reviewing code structure and naming...");
  reporter.started("reviewer_b", "Reviewer B (Performance)", "Reviewing performance and edge cases...");

  const [resultA, resultB] = await Promise.all([
    callAgent({
      systemPrompt: REVIEWER_A_PROMPT,
      userPrompt: `Language: ${language}\n\nCode:\n${code}`,
      temperature: 0.3,
      jsonMode: true,
    }),
    callAgent({
      systemPrompt: REVIEWER_B_PROMPT,
      userPrompt: `Language: ${language}\n\nCode:\n${code}`,
      temperature: 0.3,
      jsonMode: true,
    }),
  ]);

  const reviewA = safeParseJSON(resultA.content, {
    perspective: "readability",
    findings: [],
    verdict: "Review unavailable",
    score: 60,
    confidence: 50,
  });
  const reviewB = safeParseJSON(resultB.content, {
    perspective: "performance_and_correctness",
    findings: [],
    verdict: "Review unavailable",
    score: 60,
    confidence: 50,
  });

  reporter.completed("reviewer_a", "Reviewer A (Readability)", {
    message: reviewA.verdict,
    reasoning: `Score: ${reviewA.score}/100`,
    confidence: reviewA.confidence,
    data: reviewA,
  });
  reporter.completed("reviewer_b", "Reviewer B (Performance)", {
    message: reviewB.verdict,
    reasoning: `Score: ${reviewB.score}/100`,
    confidence: reviewB.confidence,
    data: reviewB,
  });

  reporter.started("judge", "Judge Agent", "Synthesizing both reviews into final verdict...");

  const judgeResult = await callAgent({
    systemPrompt: JUDGE_PROMPT,
    userPrompt: `Reviewer A (readability) said:\n${JSON.stringify(reviewA)}\n\nReviewer B (performance) said:\n${JSON.stringify(reviewB)}`,
    temperature: 0.2,
    jsonMode: true,
  });

  const judgeVerdict = safeParseJSON(judgeResult.content, {
    finalVerdict: "Unable to synthesize review",
    agreements: [],
    disagreements: [],
    overallScore: Math.round((reviewA.score + reviewB.score) / 2),
    topRecommendation: "N/A",
    reasoning: "Fallback due to parsing issue",
    confidence: 50,
  });

  reporter.completed("judge", "Judge Agent", {
    message: `Final score: ${judgeVerdict.overallScore}/100 — ${judgeVerdict.finalVerdict}`,
    reasoning: judgeVerdict.reasoning,
    confidence: judgeVerdict.confidence,
    data: judgeVerdict,
  });

  return { reviewA, reviewB, judgeVerdict };
}

module.exports = { runReviewDebate };
