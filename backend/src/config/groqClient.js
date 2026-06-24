const Groq = require("groq-sdk");
require("dotenv").config();

if (!process.env.GROQ_API_KEY) {
  console.warn(
    "⚠️  GROQ_API_KEY not set. Copy .env.example to .env and add your key from https://console.groq.com/keys"
  );
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "llama-3.3-70b-versatile";

/**
 * Calls the Groq LLM with a system + user prompt.
 * Centralizing this means: one place to handle errors, retries, and
 * swapping models later (multi-model support is easy to bolt on here).
 */
async function callAgent({
  systemPrompt,
  userPrompt,
  temperature = 0.3,
  model = DEFAULT_MODEL,
  jsonMode = false,
}) {
  try {
    const completion = await groq.chat.completions.create({
      model,
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: jsonMode ? { type: "json_object" } : undefined,
    });

    return {
      success: true,
      content: completion.choices[0]?.message?.content || "",
      usage: completion.usage, // token counts - useful for transparency panel
      model,
    };
  } catch (error) {
    console.error(`Groq API error [${model}]:`, error.message);
    return {
      success: false,
      error: error.message,
      content: null,
    };
  }
}

module.exports = { callAgent, DEFAULT_MODEL };
