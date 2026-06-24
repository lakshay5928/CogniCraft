# CogniCraft — Multi-Agent AI Coding Assistant

CogniCraft is an agentic coding assistant: instead of one prompt → one response,
a chain of specialized AI agents (Planner, Generator, Self-Reviewer, Refiner,
Optimizer, Explainer, dual Reviewers + a Judge, and more) work together,
visible in real time as a glowing circuit-style pipeline.

---

## Screenshots

**Home — Clean prompt interface with example chips**
<img width="1899" height="902" alt="Screenshot 2026-06-23 232245" src="https://github.com/user-attachments/assets/6fca4ca6-9866-44a4-92e5-16d809fdbc46" />


**Agent Pipeline — Live circuit-trace node graph mid-run**
<img width="1522" height="883" alt="Screenshot 2026-06-24 124515" src="https://github.com/user-attachments/assets/92929c53-93dd-4fd6-a7b0-c8a0851a720e" />

**Debate View — Reviewer A, Reviewer B, and Judge Agent with live timeline**
<img width="1436" height="906" alt="Screenshot 2026-06-24 124529" src="https://github.com/user-attachments/assets/3b4e9efb-0979-4a73-9ee6-d13bb528b6d2" />

**Result — Syntax-highlighted output with Code / Explanation / Docs / Review / Optimization tabs**
<img width="1494" height="854" alt="Screenshot 2026-06-24 124546" src="https://github.com/user-attachments/assets/7953f9b9-d9c3-4475-804e-7fc8e0d51dac" />

---

## Features

- **Real-time agent pipeline visualization** — circuit-trace style node graph
- **Self-correction loop** — Self-Review Agent finds issues, Refiner Agent fixes them automatically
- **Multi-agent debate** — two independent Reviewer agents + a Judge Agent that synthesizes verdicts
- **Reasoning transparency** — every agent reports *why*, not just *what*, with a confidence score
- **Run history** — past prompts and results are persisted and browsable
- **Evaluation suite** — 30-case automated benchmark measuring pass rate, broken down by intent,
  difficulty, and the measurable impact of the self-refinement loop (`npm run eval`)
- **Eval dashboard** — view the evaluation report visually inside the app (History/Eval Report buttons)

---

## Why this is "agentic," not just a chatbot wrapper

- **Multi-step autonomous pipeline**: a single request triggers a chain of
  agent calls, each one feeding the next, without further user input.
- **Self-correction loop**: the Self-Review Agent checks the Generator's
  code, and the Refiner Agent automatically fixes any issues it finds —
  before the user ever sees the result.
- **Multi-agent debate**: two independent Reviewer agents (one focused on
  readability, one on performance/correctness) evaluate the same code, and
  a Judge Agent synthesizes both into a final verdict — including where
  they disagreed.
- **Transparency**: every agent reports its reasoning and a self-rated
  confidence score, streamed live over WebSockets.

---

## Architecture

```
User Prompt
     │
     ▼
Orchestrator Agent (intent detection: generate / debug / explain / review)
     │
     ├── generate ──▶ Planner → Generator → Self-Review → Refiner →
     │                 Optimizer → Explainer/Docs → Reviewer A ─┐
     │                                              Reviewer B ─┴─▶ Judge
     │
     ├── debug ─────▶ Error Detector → Fix Suggester → Optimizer →
     │                 Explainer → Reviewer A/B → Judge
     │
     ├── review ────▶ Reviewer A/B → Judge → Optimizer
     │
     └── explain ───▶ Concept Teacher → Example Generator → Exercise Generator
```

---

## Tech Stack

- **Backend**: Node.js, Express, Socket.IO (real-time agent status streaming)
- **Frontend**: React (Vite), Tailwind CSS, Socket.IO client
- **LLM**: Groq API (free tier) serving open-source models (Llama 3.3 70B)

---

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Get a free Groq API key at https://console.groq.com/keys and paste it into
`backend/.env` as `GROQ_API_KEY`.

```bash
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

Open the frontend URL, type a request (or click an example chip), and
watch the agent pipeline light up in real time.

### 3. Running the evaluation suite (optional but recommended for resume/demo)

```bash
cd backend
npm run eval
```

This runs 30 fixed test problems through the full pipeline and writes a
report to `backend/eval/eval-report.json`. Once generated, click **"Eval
Report"** in the app header to view it visually — pass rate by intent,
by difficulty, and the measured effect of the self-refinement loop.

Note: this makes ~150-250 LLM calls and may take 5-15 minutes depending on
Groq's free-tier rate limits.

---

## Security notes

- The Groq API key lives only in the backend `.env` — never sent to the
  client.
- Rate limiting (20 runs / 15 min per IP) protects the free API quota from
  abuse.
- Input length is capped and validated before reaching the LLM pipeline.
- `helmet` and scoped CORS are applied on the Express server.
- No arbitrary code execution sandbox is included in this version — by
  design, since safely executing untrusted code requires container-level
  isolation beyond this project's current scope (see Future Scope).

---

## Future Scope

These were considered and deliberately deferred to keep the current system
secure and demo-reliable:

- Sandboxed code execution (Docker/WebContainer) with auto-retry on failure
- Long-term agent memory (vector store) for cross-session personalization
- Multi-model selection (Qwen, Gemma, DeepSeek alongside Llama)
- Git/PR diff-aware code review
- Voice input and multi-modal (screenshot → code) input
- "Project Mode": decomposing a full app request into multiple file-level tasks

---

## Free deployment path

- Frontend → Vercel or Netlify (free tier)
- Backend → Render or Railway (free tier, supports WebSockets)
- LLM → Groq free tier (no cost)

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
