import { useState } from "react";
import CodeOutput from "./CodeOutput";

const TAB_CONFIG = {
  generate: ["code", "explanation", "docs", "review", "optimization"],
  debug: ["code", "fixes", "explanation", "review", "optimization"],
  review: ["code", "review", "optimization"],
  explain: ["concept", "example", "exercise"],
};

function Section({ title, children }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-widest text-violet font-mono">{title}</p>
      <div className="text-sm text-ink-dim font-body leading-relaxed">{children}</div>
    </div>
  );
}

function BulletList({ items }) {
  if (!items || items.length === 0) return <p className="text-ink-faint italic">None noted.</p>;
  return (
    <ul className="list-disc list-inside space-y-1">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function ResultTabs({ result }) {
  const tabs = TAB_CONFIG[result?.intent] || TAB_CONFIG.generate;
  const [active, setActive] = useState(tabs[0]);

  if (!result) return null;

  const language = result.language || result.code?.language || "javascript";

  return (
    <div className="space-y-3">
      <div className="flex gap-1 border-b border-trace overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-3 py-2 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              active === tab
                ? "text-cyan border-cyan"
                : "text-ink-faint border-transparent hover:text-ink-dim"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[200px]">
        {active === "code" && <CodeOutput code={result.code} language={language} />}

        {active === "fixes" && (
          <div className="space-y-4">
            <Section title="Errors Detected">
              <BulletList items={result.detection?.errors?.map((e) => `[${e.type}] ${e.location}: ${e.description}`)} />
            </Section>
            <Section title="Root Causes">
              <BulletList items={result.fix?.rootCauses} />
            </Section>
            <Section title="Best Practices">
              <BulletList items={result.fix?.bestPractices} />
            </Section>
          </div>
        )}

        {active === "explanation" && (
          <div className="space-y-4">
            <Section title="Summary">{result.explanation?.summary}</Section>
            <Section title="Line by Line">
              <div className="space-y-2">
                {(result.explanation?.lineByLine || []).map((item, i) => (
                  <div key={i} className="border-l-2 border-trace pl-3">
                    <code className="text-cyan text-xs block mb-0.5">{item.line}</code>
                    <span>{item.explanation}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {active === "docs" && (
          <div className="space-y-4">
            <Section title="Docstring">
              <pre className="bg-base p-3 rounded border border-trace text-xs font-mono whitespace-pre-wrap">
                {result.explanation?.docstring}
              </pre>
            </Section>
            <Section title="README">
              <pre className="bg-base p-3 rounded border border-trace text-xs font-mono whitespace-pre-wrap">
                {result.explanation?.readme}
              </pre>
            </Section>
          </div>
        )}

        {active === "review" && result.codeReview && (
          <div className="space-y-4">
            <Section title={`Judge Verdict — ${result.codeReview.judgeVerdict?.overallScore}/100`}>
              {result.codeReview.judgeVerdict?.finalVerdict}
            </Section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Section title="Reviewer A — Readability">
                <BulletList items={result.codeReview.reviewA?.findings} />
              </Section>
              <Section title="Reviewer B — Performance">
                <BulletList items={result.codeReview.reviewB?.findings} />
              </Section>
            </div>
            <Section title="Disagreements Resolved">
              <BulletList items={result.codeReview.judgeVerdict?.disagreements} />
            </Section>
          </div>
        )}

        {active === "optimization" && result.optimization && (
          <div className="space-y-4">
            <div className="flex gap-4 font-mono text-sm">
              <span className="text-amber">Time: {result.optimization.timeComplexity}</span>
              <span className="text-amber">Space: {result.optimization.spaceComplexity}</span>
            </div>
            <Section title="Suggestions">
              <BulletList items={result.optimization.suggestions} />
            </Section>
          </div>
        )}

        {active === "concept" && (
          <div className="space-y-4">
            <Section title={result.concept?.concept}>{result.concept?.explanation}</Section>
            {result.concept?.analogy && <Section title="Analogy">{result.concept.analogy}</Section>}
            <Section title="Common Mistakes">
              <BulletList items={result.concept?.commonMistakes} />
            </Section>
          </div>
        )}

        {active === "example" && (
          <div className="space-y-4">
            <CodeOutput code={result.example?.code} language={result.example?.language} />
            <Section title="Walkthrough">{result.example?.walkthrough}</Section>
          </div>
        )}

        {active === "exercise" && result.exercise && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-display text-ink font-semibold">{result.exercise.title}</h4>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-violet/20 text-violet">
                {result.exercise.difficulty}
              </span>
            </div>
            <p className="text-sm text-ink-dim font-body">{result.exercise.problem}</p>
            <Section title="Hint">{result.exercise.hint}</Section>
          </div>
        )}
      </div>
    </div>
  );
}
