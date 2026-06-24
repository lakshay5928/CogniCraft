require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const { v4: uuidv4 } = require("uuid");

const { apiLimiter } = require("./utils/rateLimiter");
const { validateUserInput } = require("./utils/validateInput");
const AgentReporter = require("./utils/AgentReporter");
const { runFullPipeline } = require("./pipeline");
const { addHistoryEntry, getHistory, clearHistory } = require("./utils/historyStore");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

// --- Security middleware ---
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: "100kb" })); // small body limit, code goes via socket not REST body mostly

// --- Health check ---
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "CogniCraft backend" });
});

app.get("/api/info", (req, res) => {
  res.json({
    name: "CogniCraft",
    description: "Multi-agent AI coding assistant",
    agents: [
      "Orchestrator", "Planner", "Code Generator", "Self-Review", "Refiner",
      "Optimizer", "Explainer", "Error Detector", "Fix Suggester",
      "Reviewer A", "Reviewer B", "Judge", "Concept Teacher",
      "Example Generator", "Exercise Generator",
    ],
  });
});

// --- History endpoints ---
app.get("/api/history", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  res.json({ history: getHistory(limit) });
});

app.delete("/api/history", (req, res) => {
  clearHistory();
  res.json({ success: true });
});

// --- Evaluation report endpoint (serves output of `npm run eval`) ---
app.get("/api/eval-report", (req, res) => {
  const reportPath = path.join(__dirname, "..", "eval", "eval-report.json");
  if (!fs.existsSync(reportPath)) {
    return res.status(404).json({ error: "No evaluation report found. Run `npm run eval` first." });
  }
  try {
    const raw = fs.readFileSync(reportPath, "utf8");
    res.json(JSON.parse(raw));
  } catch (e) {
    res.status(500).json({ error: "Failed to read evaluation report." });
  }
});

// --- Socket.IO: real-time pipeline execution ---
io.use((socket, next) => {
  // basic per-connection rate limiting could be added here later;
  // REST-layer limiter below covers the HTTP trigger route.
  next();
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("run_pipeline", async (payload) => {
    const sessionId = uuidv4();
    const userInput = payload?.input;

    const validation = validateUserInput(userInput);
    if (!validation.valid) {
      socket.emit("pipeline_error", { sessionId, error: validation.error });
      return;
    }

    const reporter = new AgentReporter(socket, sessionId);
    socket.emit("pipeline_started", { sessionId, timestamp: new Date().toISOString() });

    try {
      const result = await runFullPipeline(validation.value, reporter);
      socket.emit("pipeline_completed", {
        sessionId,
        result,
        timeline: reporter.getTimeline(),
      });

      // Persist a lightweight summary to history (non-blocking, best-effort)
      try {
        addHistoryEntry({
          sessionId,
          prompt: validation.value,
          intent: result?.intent,
          language: result?.language || result?.code?.language || null,
          summary:
            result?.codeReview?.judgeVerdict?.finalVerdict ||
            result?.explanation?.summary ||
            result?.concept?.explanation ||
            "Run completed",
        });
      } catch (historyErr) {
        console.error("History save failed (non-fatal):", historyErr.message);
      }
    } catch (error) {
      console.error("Pipeline error:", error);
      socket.emit("pipeline_error", {
        sessionId,
        error: "Something went wrong while processing your request.",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 CogniCraft backend running on port ${PORT}`);
  console.log(`   Frontend allowed origin: ${FRONTEND_URL}`);
});
