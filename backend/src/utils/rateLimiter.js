const rateLimit = require("express-rate-limit");

/**
 * Rate limiting matters here for two reasons:
 * 1. Groq's free tier has request limits - one abusive user could exhaust
 *    the quota for everyone.
 * 2. Each "generate" request triggers ~8 LLM calls. Without limits, a
 *    single user spamming requests could rack up a lot of API usage fast.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 pipeline runs per IP per window
  message: {
    error: "Too many requests. Please wait a few minutes before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter };
