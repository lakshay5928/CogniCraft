const { runOrchestrator } = require("./agents/orchestratorAgent");
const { runPlanner } = require("./agents/plannerAgent");
const { runGenerator } = require("./agents/generatorAgent");
const { runSelfReview, runRefiner } = require("./agents/selfReviewAgent");
const { runOptimizer } = require("./agents/optimizerAgent");
const { runExplainer } = require("./agents/explainerAgent");
const { runReviewDebate } = require("./agents/debateAgents");
const { runErrorDetector, runFixSuggester } = require("./agents/debugAgents");
const {
  runConceptTeacher,
  runExampleGenerator,
  runExerciseGenerator,
} = require("./agents/learningAgents");

/**
 * GENERATE pipeline:
 * Orchestrator -> Planner -> Generator -> SelfReview -> (Refiner if issues) ->
 * Optimizer -> Explainer/Docs -> Reviewer A/B -> Judge
 */
async function runGeneratePipeline(userInput, intentData, reporter) {
  const plan = await runPlanner(userInput, intentData.language, reporter);
  let generated = await runGenerator(userInput, plan, reporter);

  if (!generated) {
    return { success: false, stage: "generation" };
  }

  const review = await runSelfReview(generated.code, generated.language, reporter);
  let finalCode = generated.code;
  let refinement = null;

  if (review.hasIssues && review.issues.length > 0) {
    refinement = await runRefiner(generated.code, generated.language, review.issues, reporter);
    finalCode = refinement.code;
  }

  const optimization = await runOptimizer(finalCode, generated.language, reporter);
  const explanation = await runExplainer(finalCode, generated.language, reporter);
  const { reviewA, reviewB, judgeVerdict } = await runReviewDebate(finalCode, generated.language, reporter);

  return {
    success: true,
    intent: "generate",
    language: generated.language,
    plan,
    code: finalCode,
    selfReview: review,
    refinement,
    optimization,
    explanation,
    codeReview: { reviewA, reviewB, judgeVerdict },
  };
}

/**
 * DEBUG pipeline:
 * Orchestrator -> ErrorDetector -> FixSuggester -> Optimizer -> Explainer -> Reviewer A/B -> Judge
 */
async function runDebugPipeline(userInput, intentData, reporter) {
  // userInput is expected to contain the user's code (pasted directly)
  const detection = await runErrorDetector(userInput, intentData.language, reporter);

  let fixedCode = userInput;
  let fix = null;

  if (detection.errorsFound) {
    fix = await runFixSuggester(userInput, intentData.language, detection.errors, reporter);
    fixedCode = fix.fixedCode;
  }

  const optimization = await runOptimizer(fixedCode, intentData.language, reporter);
  const explanation = await runExplainer(fixedCode, intentData.language, reporter);
  const { reviewA, reviewB, judgeVerdict } = await runReviewDebate(fixedCode, intentData.language, reporter);

  return {
    success: true,
    intent: "debug",
    language: intentData.language,
    detection,
    fix,
    code: fixedCode,
    optimization,
    explanation,
    codeReview: { reviewA, reviewB, judgeVerdict },
  };
}

/**
 * EXPLAIN pipeline (Learning Assistant):
 * Orchestrator -> ConceptTeacher -> ExampleGenerator -> ExerciseGenerator
 */
async function runExplainPipeline(userInput, intentData, reporter) {
  const concept = await runConceptTeacher(userInput, reporter);
  const example = await runExampleGenerator(userInput, reporter);
  const exercise = await runExerciseGenerator(userInput, reporter);

  return {
    success: true,
    intent: "explain",
    concept,
    example,
    exercise,
  };
}

/**
 * REVIEW pipeline (user pastes existing code just for quality review):
 * Orchestrator -> Reviewer A/B -> Judge -> Optimizer
 */
async function runReviewPipeline(userInput, intentData, reporter) {
  const { reviewA, reviewB, judgeVerdict } = await runReviewDebate(userInput, intentData.language, reporter);
  const optimization = await runOptimizer(userInput, intentData.language, reporter);

  return {
    success: true,
    intent: "review",
    code: userInput,
    codeReview: { reviewA, reviewB, judgeVerdict },
    optimization,
  };
}

/**
 * Top-level entry point. Runs Orchestrator first, then routes.
 */
async function runFullPipeline(userInput, reporter) {
  const intentData = await runOrchestrator(userInput, reporter);

  switch (intentData.intent) {
    case "debug":
      return await runDebugPipeline(userInput, intentData, reporter);
    case "explain":
      return await runExplainPipeline(userInput, intentData, reporter);
    case "review":
      return await runReviewPipeline(userInput, intentData, reporter);
    case "generate":
    default:
      return await runGeneratePipeline(userInput, intentData, reporter);
  }
}

module.exports = { runFullPipeline };
