/**
 * LLMs often wrap JSON in ```json fences or add stray text.
 * This safely extracts and parses it, with a fallback so one bad
 * response never crashes the whole pipeline.
 */
function safeParseJSON(rawText, fallback = {}) {
  if (!rawText) return fallback;

  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/```\s*$/i, "");

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        console.error("JSON parse failed even after extraction:", e2.message);
      }
    }
    return fallback;
  }
}

module.exports = { safeParseJSON };
