const { callAgent } = require("../config/groqClient");
const { safeParseJSON } = require("../utils/jsonParser");

const TEACHER_PROMPT = `You are the Concept Teacher Agent in CogniCraft. Explain the requested programming concept
in simple, beginner-friendly language. Use an analogy if it helps.

Respond ONLY with valid JSON, no markdown fences:
{
  "concept": "name of the concept",
  "explanation": "clear beginner-friendly explanation, 3-5 sentences",
  "analogy": "a real-world analogy if useful, otherwise empty string",
  "commonMistakes": ["mistake 1", "mistake 2"],
  "reasoning": "why this explanation approach was chosen",
  "confidence": number (0-100)
}`;

const EXAMPLE_PROMPT = `You are the Example Generator Agent in CogniCraft. Given a concept, produce one clear,
well-commented code example that demonstrates it in practice.

Respond ONLY with valid JSON, no markdown fences:
{
  "language": "language used for the example",
  "code": "the example code, with \\n for newlines, with explanatory comments",
  "walkthrough": "1-2 sentences on what the example shows",
  "reasoning": "why this particular example was chosen",
  "confidence": number (0-100)
}`;

const EXERCISE_PROMPT = `You are the Exercise Generator Agent in CogniCraft. Given a concept, create ONE practice
exercise to help a learner solidify understanding. Include a hint but NOT the full solution.

Respond ONLY with valid JSON, no markdown fences:
{
  "title": "short exercise title",
  "problem": "the exercise description",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "hint": "a helpful hint without giving away the full solution",
  "reasoning": "why this exercise reinforces the concept",
  "confidence": number (0-100)
}`;

async function runConceptTeacher(topic, reporter) {
  reporter.started("teacher", "Concept Teacher Agent", `Explaining: ${topic}...`);

  const result = await callAgent({
    systemPrompt: TEACHER_PROMPT,
    userPrompt: `Concept to explain: ${topic}`,
    temperature: 0.4,
    jsonMode: true,
  });

  const output = safeParseJSON(result.content, {
    concept: topic,
    explanation: "Explanation unavailable",
    analogy: "",
    commonMistakes: [],
    reasoning: "Fallback due to parsing issue",
    confidence: 50,
  });

  reporter.completed("teacher", "Concept Teacher Agent", {
    message: `Explained: ${output.concept}`,
    reasoning: output.reasoning,
    confidence: output.confidence,
    data: output,
  });

  return output;
}

async function runExampleGenerator(topic, reporter) {
  reporter.started("example_gen", "Example Generator Agent", "Building a practical example...");

  const result = await callAgent({
    systemPrompt: EXAMPLE_PROMPT,
    userPrompt: `Concept: ${topic}`,
    temperature: 0.3,
    jsonMode: true,
  });

  const output = safeParseJSON(result.content, {
    language: "javascript",
    code: "// Example unavailable",
    walkthrough: "",
    reasoning: "Fallback due to parsing issue",
    confidence: 50,
  });

  reporter.completed("example_gen", "Example Generator Agent", {
    message: "Example ready",
    reasoning: output.reasoning,
    confidence: output.confidence,
    data: output,
  });

  return output;
}

async function runExerciseGenerator(topic, reporter) {
  reporter.started("exercise_gen", "Exercise Generator Agent", "Creating a practice exercise...");

  const result = await callAgent({
    systemPrompt: EXERCISE_PROMPT,
    userPrompt: `Concept: ${topic}`,
    temperature: 0.5,
    jsonMode: true,
  });

  const output = safeParseJSON(result.content, {
    title: "Practice Exercise",
    problem: "Exercise unavailable",
    difficulty: "beginner",
    hint: "",
    reasoning: "Fallback due to parsing issue",
    confidence: 50,
  });

  reporter.completed("exercise_gen", "Exercise Generator Agent", {
    message: `Exercise ready: ${output.title} (${output.difficulty})`,
    reasoning: output.reasoning,
    confidence: output.confidence,
    data: output,
  });

  return output;
}

module.exports = { runConceptTeacher, runExampleGenerator, runExerciseGenerator };
