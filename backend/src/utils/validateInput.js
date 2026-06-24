const MAX_INPUT_LENGTH = 8000; // generous for pasted code, prevents abuse/huge token bills

/**
 * Basic input validation. Not a substitute for proper LLM safety tuning,
 * but prevents the most obvious abuse: empty requests, oversized payloads
 * that would blow through token budgets, and non-string injection attempts.
 */
function validateUserInput(input) {
  if (typeof input !== "string") {
    return { valid: false, error: "Input must be text." };
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Input cannot be empty." };
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return {
      valid: false,
      error: `Input too long. Please keep requests under ${MAX_INPUT_LENGTH} characters.`,
    };
  }

  return { valid: true, value: trimmed };
}

module.exports = { validateUserInput, MAX_INPUT_LENGTH };
