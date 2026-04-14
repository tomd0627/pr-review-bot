"use client";

import { useState } from "react";
import { Accessibility, Code, Download, Loader2, Play, RotateCcw, Sparkles, Zap } from "lucide-react";
import type { Finding, ReviewStatus } from "@/lib/types";
import { generateMarkdown } from "@/lib/markdown";
import { SAMPLE_DIFF } from "@/lib/sample-diff";
import { SAMPLE_FINDINGS } from "@/lib/sample-findings";
import { DiffViewer } from "./DiffViewer";

interface StreamedFinding extends Finding {
  error?: string;
}

function isValidDiff(text: string): boolean {
  return /^@@\s+-\d/m.test(text) || /^diff --git /m.test(text);
}

export function ReviewApp() {
  const [diff, setDiff] = useState("");
  const [findings, setFindings] = useState<Finding[]>([]);
  const [status, setStatus] = useState<ReviewStatus>("idle");
  const [activeDiff, setActiveDiff] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState("");

  const startReview = async (diffText: string) => {
    if (!isValidDiff(diffText)) {
      setError(
        "That doesn't look like a unified diff. Append .diff to a GitHub PR URL to get the raw format, then paste it here."
      );
      return;
    }

    setStatus("streaming");
    setFindings([]);
    setError("");
    setActiveDiff(diffText);
    setIsDemo(false);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diff: diffText }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Server error (HTTP ${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed) as StreamedFinding;
            if (parsed.error) throw new Error(parsed.error);
            setFindings((prev) => [...prev, parsed]);
          } catch {
            // skip malformed lines; errors surfaced via the thrown Error above
          }
        }
      }

      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed. Try again.");
      setStatus("error");
    }
  };

  const reset = () => {
    setDiff("");
    setActiveDiff("");
    setFindings([]);
    setStatus("idle");
    setIsDemo(false);
    setError("");
  };

  const loadDemo = () => {
    setDiff(SAMPLE_DIFF);
    setActiveDiff(SAMPLE_DIFF);
    setFindings(SAMPLE_FINDINGS);
    setStatus("done");
    setIsDemo(true);
    setError("");
  };

  const downloadMarkdown = () => {
    const md = generateMarkdown(findings);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pr-review.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const isStreaming = status === "streaming";
  const hasResults = status === "done" || isStreaming;
  const canSubmit = diff.trim().length > 0 && !isStreaming && !isDemo;

  const summary = {
    critical: findings.filter((f) => f.severity === "critical").length,
    major: findings.filter((f) => f.severity === "major").length,
    minor: findings.filter((f) => f.severity === "minor").length,
    accessibility: findings.filter((f) => f.category === "accessibility").length,
    performance: findings.filter((f) => f.category === "performance").length,
    quality: findings.filter((f) => f.category === "quality").length,
  };

  return (
    <main id="main-content" className="review-app">
      {/* ── Input Section ── */}
      <section className="input-section" aria-labelledby="input-heading">
        <div className="container">
          <div className="input-hero">
            <h1 id="input-heading" className="hero-title">
              PR Review Bot
              <span className="hero-accent"> — a11y &amp; performance</span>
            </h1>
            <p className="hero-subtitle">
              Paste a GitHub PR diff and get instant AI-powered feedback on WCAG
              2.2 violations and performance issues, displayed inline — just like
              a real code review.
            </p>
          </div>

          <div className="input-area">
            <label htmlFor="diff-input" className="input-label">
              Paste your unified diff
            </label>
            <textarea
              id="diff-input"
              className="diff-textarea"
              value={diff}
              onChange={(e) => {
                setDiff(e.target.value);
                if (isDemo) setIsDemo(false);
              }}
              placeholder={`diff --git a/src/Component.tsx b/src/Component.tsx\n--- a/src/Component.tsx\n+++ b/src/Component.tsx\n@@ -1,5 +1,10 @@\n  // paste your diff here…`}
              rows={10}
              aria-describedby="diff-hint"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />
            <p id="diff-hint" className="input-hint">
              Append{" "}
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                .diff
              </code>{" "}
              to any GitHub PR URL to get the raw diff, then paste it here.
            </p>

            <div className="input-actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => startReview(diff)}
                disabled={!canSubmit}
                aria-busy={isStreaming}
              >
                {isStreaming ? (
                  <>
                    <Loader2 size={15} aria-hidden="true" className="spinning" />
                    Reviewing…
                  </>
                ) : (
                  <>
                    <Play size={15} aria-hidden="true" />
                    Review Diff
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn--secondary"
                onClick={loadDemo}
                disabled={isStreaming}
              >
                <Sparkles size={15} aria-hidden="true" />
                Try Demo
              </button>
            </div>
          </div>

          {(status === "error" || error) && (
            <div className="error-message" role="alert">
              {error || "Something went wrong. Please try again."}
            </div>
          )}
        </div>
      </section>

      {/* ── Results Section ── */}
      {hasResults && (
        <section className="results-section" aria-labelledby="results-heading">
          <div className="container">
            <div className="results-header">
              <h2 id="results-heading" className="results-title">
                {isStreaming ? (
                  <>
                    <Loader2 size={18} aria-hidden="true" className="spinning" />
                    Analyzing…
                  </>
                ) : (
                  "Review Complete"
                )}
                <span className="finding-count" aria-live="polite" aria-atomic="true">
                  {findings.length}{" "}
                  {findings.length === 1 ? "finding" : "findings"}
                  {isStreaming && " so far"}
                </span>
                {isDemo && <span className="demo-badge">Demo</span>}
              </h2>

              <div className="results-actions">
                {status === "done" && findings.length > 0 && (
                  <button type="button" className="btn btn--ghost" onClick={downloadMarkdown}>
                    <Download size={15} aria-hidden="true" />
                    Download Review
                  </button>
                )}
                {!isStreaming && (
                  <button type="button" className="btn btn--ghost" onClick={reset}>
                    <RotateCcw size={15} aria-hidden="true" />
                    Start Over
                  </button>
                )}
              </div>
            </div>

            <div className="results-layout">
              {/* Diff + inline findings */}
              <div className="results-main">
                <DiffViewer diff={activeDiff} findings={findings} />
              </div>

              {/* Summary sidebar */}
              <aside className="results-sidebar" aria-label="Findings summary">
                <div className="summary-card">
                  <h3 className="summary-title">Summary</h3>

                  <dl>
                    <div className="summary-row">
                      <dt className="summary-label">
                        <span className="dot dot--critical" aria-hidden="true" />
                        Critical
                      </dt>
                      <dd className="summary-value">{summary.critical}</dd>
                    </div>
                    <div className="summary-row">
                      <dt className="summary-label">
                        <span className="dot dot--major" aria-hidden="true" />
                        Major
                      </dt>
                      <dd className="summary-value">{summary.major}</dd>
                    </div>
                    <div className="summary-row">
                      <dt className="summary-label">
                        <span className="dot dot--minor" aria-hidden="true" />
                        Minor
                      </dt>
                      <dd className="summary-value">{summary.minor}</dd>
                    </div>

                    {findings.length > 0 && (
                      <>
                        <div style={{ height: "0.75rem" }} />

                        {summary.accessibility > 0 && (
                          <div className="summary-row">
                            <dt className="summary-label">
                              <Accessibility size={13} aria-hidden="true" className="text-(--accent)" />
                              Accessibility
                            </dt>
                            <dd className="summary-value">{summary.accessibility}</dd>
                          </div>
                        )}
                        {summary.performance > 0 && (
                          <div className="summary-row">
                            <dt className="summary-label">
                              <Zap size={13} aria-hidden="true" className="text-[#a78bfa]" />
                              Performance
                            </dt>
                            <dd className="summary-value">{summary.performance}</dd>
                          </div>
                        )}
                        {summary.quality > 0 && (
                          <div className="summary-row">
                            <dt className="summary-label">
                              <Code size={13} aria-hidden="true" className="text-[#60a5fa]" />
                              Quality
                            </dt>
                            <dd className="summary-value">{summary.quality}</dd>
                          </div>
                        )}
                      </>
                    )}
                  </dl>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
