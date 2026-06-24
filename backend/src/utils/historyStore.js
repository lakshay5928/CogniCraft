const fs = require("fs");
const path = require("path");

const HISTORY_FILE = path.join(__dirname, "..", "..", "data", "history.json");
const MAX_HISTORY_ITEMS = 100;

function ensureDataDir() {
  const dir = path.dirname(HISTORY_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadHistory() {
  ensureDataDir();
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    const raw = fs.readFileSync(HISTORY_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read history file:", e.message);
    return [];
  }
}

function saveHistory(history) {
  ensureDataDir();
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (e) {
    console.error("Failed to write history file:", e.message);
  }
}

/**
 * Adds a completed run to history. Stores a lightweight summary, not the
 * full agent timeline, to keep the file small and fast to read.
 */
function addHistoryEntry({ sessionId, prompt, intent, language, summary }) {
  const history = loadHistory();
  const entry = {
    sessionId,
    prompt: prompt.length > 300 ? prompt.slice(0, 300) + "..." : prompt,
    intent,
    language,
    summary,
    timestamp: new Date().toISOString(),
  };
  history.unshift(entry); // newest first
  const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
  saveHistory(trimmed);
  return entry;
}

function getHistory(limit = 50) {
  const history = loadHistory();
  return history.slice(0, limit);
}

function clearHistory() {
  saveHistory([]);
}

module.exports = { addHistoryEntry, getHistory, clearHistory };
