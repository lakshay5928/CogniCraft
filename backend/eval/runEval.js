require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const { testCases } = require("./testCases");
const { runFullPipeline } = require("../src/pipeline");

/**
 * Minimal reporter that swallows socket emission (no live socket in eval mode)
 * but still records the full timeline, so we can inspect what each agent did.
 */
class SilentReporter {
  constructor() {
    this.timeline = [];
  }
  _record(e) { this.timeline.push({ ...e, timestamp: new Date().toISOString() }); }
  started(agentId, agentLabel, message) { this._record({ agentId, agentLabel, status: "started", message }); }
  thinking(agentId, agentLabel, message) { this._record({ agentId, agentLabel, status: "thinking", message }); }
  completed(agentId, agentLabel, payload) { this._record({ agentId, agentLabel, status: "completed", ...payload }); }
  failed(agentId, agentLabel, message) { this._record({ agentId, agentLabel, status: "failed", message }); }
  getTimeline() { return this.timeline; }
}

function findEvent(timeline, agentId) {
  return timeline.find((e) => e.agentId === agentId && e.status === "completed");
}

async function runCase(testCase) {
  const reporter = new SilentReporter();
  const startedAt = Date.now();

  let result;
  let errorMsg = null;
  try {
    result = await runFullPipeline(testCase.prompt, reporter);
  } catch (e) {
    errorMsg = e.message;
  }

  const durationMs = Date.now() - startedAt;
  const timeline = reporter.getTimeline();

  const selfReviewEvent = findEvent(timeline, "reviewer_self");
  const refinerEvent = findEvent(timeline, "refiner");
  const hadIssuesFound = selfReviewEvent?.data?.hasIssues === true;
  const wasRefined = !!refinerEvent;

  const finalCode = result?.code || "";
  let checkPassed = false;
  try {
    checkPassed = testCase.check(finalCode);
  } catch (e) {
    checkPassed = false;
  }

  return {
    id: testCase.id,
    intent: testCase.intent,
    difficulty: testCase.difficulty,
    language: testCase.language,
    success: !!result?.success && !errorMsg,
    checkPassed,
    selfReviewFoundIssue: hadIssuesFound,
    wasRefined,
    finalConfidence:
      result?.codeReview?.judgeVerdict?.confidence ??
      result?.explanation?.confidence ??
      result?.concept?.confidence ??
      null,
    durationMs,
    error: errorMsg,
  };
}

async function main() {
  console.log(`Running CogniCraft evaluation suite: ${testCases.length} cases...\n`);

  const results = [];
  for (const tc of testCases) {
    process.stdout.write(`  [${tc.id}] ${tc.intent}/${tc.difficulty}/${tc.language} ... `);
    const r = await runCase(tc);
    results.push(r);
    console.log(r.checkPassed ? "PASS" : r.error ? `ERROR (${r.error})` : "FAIL");
  }

  // --- Aggregate metrics ---
  const total = results.length;
  const passed = results.filter((r) => r.checkPassed).length;
  const errored = results.filter((r) => r.error).length;

  const byIntent = {};
  const byDifficulty = {};
  for (const r of results) {
    byIntent[r.intent] = byIntent[r.intent] || { total: 0, passed: 0 };
    byIntent[r.intent].total++;
    if (r.checkPassed) byIntent[r.intent].passed++;

    byDifficulty[r.difficulty] = byDifficulty[r.difficulty] || { total: 0, passed: 0 };
    byDifficulty[r.difficulty].total++;
    if (r.checkPassed) byDifficulty[r.difficulty].passed++;
  }

  const generateCases = results.filter((r) => r.intent === "generate" || r.intent === "debug");
  const issuesFoundCount = generateCases.filter((r) => r.selfReviewFoundIssue).length;
  const refinedCount = generateCases.filter((r) => r.wasRefined).length;

  // Pass rate among cases where the self-review/refiner loop actually fired
  const refinedAndPassed = generateCases.filter((r) => r.wasRefined && r.checkPassed).length;
  const notRefinedAndPassed = generateCases.filter((r) => !r.wasRefined && r.checkPassed).length;
  const notRefinedTotal = generateCases.filter((r) => !r.wasRefined).length;

  const avgDuration = Math.round(results.reduce((a, r) => a + r.durationMs, 0) / total);

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalCases: total,
      passed,
      failed: total - passed - errored,
      errored,
      overallPassRate: `${((passed / total) * 100).toFixed(1)}%`,
      avgDurationMs: avgDuration,
    },
    byIntent: Object.fromEntries(
      Object.entries(byIntent).map(([k, v]) => [k, { ...v, passRate: `${((v.passed / v.total) * 100).toFixed(1)}%` }])
    ),
    byDifficulty: Object.fromEntries(
      Object.entries(byDifficulty).map(([k, v]) => [k, { ...v, passRate: `${((v.passed / v.total) * 100).toFixed(1)}%` }])
    ),
    selfRefinementImpact: {
      casesWhereSelfReviewFoundIssue: issuesFoundCount,
      casesRefined: refinedCount,
      passRateWhenRefined: refinedCount ? `${((refinedAndPassed / refinedCount) * 100).toFixed(1)}%` : "N/A",
      passRateWhenNotRefined: notRefinedTotal ? `${((notRefinedAndPassed / notRefinedTotal) * 100).toFixed(1)}%` : "N/A",
      note: "Compares correctness on cases the Refiner touched vs cases it judged clean already.",
    },
    detailedResults: results,
  };

  const outPath = path.join(__dirname, "eval-report.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log("\n========== SUMMARY ==========");
  console.log(`Overall pass rate: ${report.summary.overallPassRate} (${passed}/${total})`);
  console.log(`Errored runs: ${errored}`);
  console.log(`Avg duration/case: ${avgDuration}ms`);
  console.log("\nBy intent:");
  for (const [k, v] of Object.entries(report.byIntent)) {
    console.log(`  ${k}: ${v.passRate} (${v.passed}/${v.total})`);
  }
  console.log("\nBy difficulty:");
  for (const [k, v] of Object.entries(report.byDifficulty)) {
    console.log(`  ${k}: ${v.passRate} (${v.passed}/${v.total})`);
  }
  console.log("\nSelf-refinement impact:");
  console.log(`  Self-Review flagged issues in ${issuesFoundCount} cases; Refiner ran ${refinedCount} times`);
  console.log(`  Pass rate when refined: ${report.selfRefinementImpact.passRateWhenRefined}`);
  console.log(`  Pass rate when already clean: ${report.selfRefinementImpact.passRateWhenNotRefined}`);
  console.log(`\nFull report written to: ${outPath}`);
}

main().catch((e) => {
  console.error("Eval run failed:", e);
  process.exit(1);
});
