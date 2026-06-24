# CogniCraft — Multi-Agent AI Coding Assistant

> *Not a chatbot. A pipeline of specialized AI agents that think, debate, self-correct, and explain — streamed live.*

CogniCraft transforms a single coding request into a coordinated chain of specialized AI agents — Planner, Generator, Self-Reviewer, Refiner, Optimizer, Explainer, dual independent Reviewers, and a Judge — each one visible in real time as a glowing, animated circuit-style pipeline on your screen.

Unlike a typical "wrapper" that forwards your prompt to an LLM and returns a response, CogniCraft runs a fully autonomous multi-step pipeline where every agent has a distinct role, reports its own reasoning, and hands off to the next agent — without any further input from you.

---

## Screenshots

**Home — Clean prompt interface with example chips**
(<Screenshot 2026-06-23 232245.png>)

**Agent Pipeline — Live circuit-trace node graph mid-run**
![Agent Pipeline](screenshots/pipeline.png)

**Debate View — Reviewer A, Reviewer B, and Judge Agent with live timeline**
![Multi-Agent Debate](screenshots/debate.png)

**Result — Syntax-highlighted output with Code / Explanation / Docs / Review / Optimization tabs**
![Result Output](screenshots/result.png)

---

## What Makes This Different

| Feature | Typical AI Tool | CogniCraft |
|---|---|---|
| Agent count | 1 | 15 specialized agents |
| Self-correction | ❌ | ✅ Auto self-review + refine loop |
| Multi-agent debate | ❌ | ✅ Reviewer A vs B + Judge |
| Reasoning visibility | ❌ | ✅ Per-agent rationale + confidence score |
| Evaluation suite | ❌ | ✅ 30-case automated benchmark |
| Real-time pipeline UI | ❌ | ✅ Live glowing circuit-trace node graph |

---

## Features

### Real-Time Agent Pipeline Visualization
Watch the full agent pipeline light up as your request flows through it. Each node in the circuit-style graph glows as its agent activates, dims when done, and passes control to the next — streamed live over WebSockets.

### Self-Correction Loop
The Generator Agent produces initial code. Before you ever see it, the Self-Review Agent checks for bugs, edge cases, and anti-patterns. If issues are found, the Refiner Agent automatically fixes them. You only receive output that has already passed an internal quality gate.

### Multi-Agent Debate
Two independent Reviewer Agents evaluate the same code in parallel:
- **Reviewer A** focuses on readability and maintainability
- **Reviewer B** focuses on performance and correctness

A **Judge Agent** then synthesizes both reviews, highlights where they agreed and disagreed, and produces a final verdict — mimicking a real code review process.

### Reasoning Transparency
Every agent in the pipeline reports:
- What it decided
- *Why* it decided it (reasoning chain)
- A self-rated confidence score (0–100)

All of this streams live to the UI — you see the agents thinking, not just the result.

### Run History
Every prompt and its full pipeline result is persisted locally. Browse past runs, compare outputs, and re-examine agent reasoning at any time.

### Evaluation Suite
A 30-case automated benchmark runs the full pipeline against fixed test problems and measures:
- Overall pass rate
- Pass rate by intent (generate / debug / review / explain)
- Pass rate by difficulty (easy / medium / hard)
- Measured improvement from the self-refinement loop (with vs without Refiner Agent)

```bash
cd backend
npm run eval
```

Once generated, click **"Eval Report"** in the app header to view the results as a visual dashboard inside the app — no separate tool required.

---

## Architecture

A single user request is routed through one of four intent flows:

```
User Prompt
     │
     ▼
Orchestrator Agent
(intent detection: generate / debug / explain / review)
     │
     ├── generate ──▶ Planner → Generator → Self-Review → Refiner
     │                → Optimizer → Explainer/Docs
     │                → Reviewer A ─┐
     │                  Reviewer B ─┴──▶ Judge
     │
     ├── debug ─────▶ Error Detector → Fix Suggester → Optimizer
     │                → Explainer → Reviewer A/B → Judge
     │
     ├── review ────▶ Reviewer A/B → Judge → Optimizer
     │
     └── explain ───▶ Concept Teacher → Example Generator → Exercise Generator
```

**Total agents across all flows: 15**

The pipeline is fully autonomous — once you submit your prompt, each agent calls the next without any further user interaction.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Real-time streaming | Socket.IO (WebSockets) |
| Frontend | React (Vite), Tailwind CSS |
| LLM | Groq API — Llama 3.3 70B (free tier) |
| Persistence | Local JSON (run history + eval report) |

---

## Setup

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com/keys) (no credit card required)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and paste your Groq API key:

```
GROQ_API_KEY=your_key_here
```

```bash
npm run dev
```

Backend starts at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend starts at `http://localhost:5173`.

Open the URL in your browser, type a prompt (or click one of the example chips), and watch the agent pipeline light up in real time.

### 3. Evaluation Suite (optional — strongly recommended for demo/resume)

```bash
cd backend
npm run eval
```

Runs 30 test cases through the full pipeline. Writes a report to `backend/eval/eval-report.json`. Then click **"Eval Report"** in the app to view it visually.

> **Note:** The eval suite makes ~150–250 LLM calls. On Groq's free tier, this takes 5–15 minutes depending on rate limits.

---

## Security

- The Groq API key lives exclusively in `backend/.env` — it is never sent to the client or exposed in any API response.
- Rate limiting: 20 pipeline runs per 15 minutes per IP, to protect free-tier quota.
- Input is length-capped and validated before reaching any LLM call.
- `helmet` and scoped CORS headers are applied to the Express server.
- No arbitrary code execution sandbox is included by design — safely running untrusted code requires container-level isolation (Docker / WebContainers) that is out of scope for this version. See Future Scope below.

---

## Future Scope

The following features were considered and deliberately deferred to keep the current system secure, stable, and demo-reliable:

- **Sandboxed code execution** — Docker or WebContainer isolation with auto-retry on test failure
- **Long-term agent memory** — vector store for cross-session personalization and context
- **Multi-model selection** — swap between Qwen, Gemma, DeepSeek, and Llama per agent
- **Git/PR-aware review** — review code in the context of a diff, not just a snippet
- **Voice + multimodal input** — describe in voice or paste a screenshot to generate code
- **Project Mode** — decompose a full app request into file-level tasks assigned to parallel agents

---

## Free Deployment

| Layer | Platform |
|---|---|
| Frontend | Vercel or Netlify (free tier) |
| Backend | Render or Railway (free tier, WebSocket support included) |
| LLM | Groq free tier (no cost) |

Total hosting cost: **$0**

---

## Author

**Lakshay Verma**

---

## License

```
MIT License

Copyright (c) 2026 Lakshay Verma

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```