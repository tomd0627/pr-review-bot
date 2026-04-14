"use client";

import { useMemo } from "react";
import type { AddChange, NormalChange } from "parse-diff";
import parseDiff from "parse-diff";
import type { Finding } from "@/lib/types";
import { FindingCard } from "./FindingCard";

interface DiffViewerProps {
  diff: string;
  findings: Finding[];
}

export function DiffViewer({ diff, findings }: DiffViewerProps) {
  const files = useMemo(() => parseDiff(diff), [diff]);

  const findingMap = useMemo(() => {
    const map = new Map<string, Map<number, Finding[]>>();
    for (const finding of findings) {
      if (!map.has(finding.file)) {
        map.set(finding.file, new Map());
      }
      const lineMap = map.get(finding.file) ?? new Map<number, Finding[]>();
      const existing = lineMap.get(finding.line) ?? [];
      lineMap.set(finding.line, [...existing, finding]);
      map.set(finding.file, lineMap);
    }
    return map;
  }, [findings]);

  if (files.length === 0) {
    return (
      <p className="text-[var(--text-secondary)] text-sm">
        No diff content to display.
      </p>
    );
  }

  return (
    <section className="diff-viewer" aria-label="Pull request diff with review findings">
      {files.map((file) => {
        const fileName =
          file.to && file.to !== "/dev/null" ? file.to : (file.from ?? "");
        const lineMap = findingMap.get(fileName) ?? new Map<number, Finding[]>();
        const fileHasFindings = lineMap.size > 0;
        const findingCount = Array.from(lineMap.values()).reduce(
          (acc, arr) => acc + arr.length,
          0
        );

        return (
          <article key={fileName} className="diff-file">
            <header className="diff-file-header">
              <code className="diff-file-name">{fileName || "(unknown file)"}</code>
              {fileHasFindings ? (
                <span className="diff-file-badge diff-file-badge--findings">
                  {findingCount} {findingCount === 1 ? "finding" : "findings"}
                </span>
              ) : (
                findings.length > 0 && (
                  <span className="diff-file-badge diff-file-badge--clean">
                    Clean
                  </span>
                )
              )}
            </header>

            <div>
              {file.chunks.map((chunk) => (
                <div key={chunk.content}>
                  <div className="diff-hunk-header" aria-hidden="true">
                    {chunk.content}
                  </div>
                  {chunk.changes.map((change) => {
                    const isAdd = change.type === "add";
                    const isDel = change.type === "del";

                    const oldLineNum =
                      isDel
                        ? (change as unknown as AddChange).ln
                        : change.type === "normal"
                        ? (change as NormalChange).ln1
                        : undefined;

                    const newLineNum =
                      isAdd
                        ? (change as AddChange).ln
                        : change.type === "normal"
                        ? (change as NormalChange).ln2
                        : undefined;

                    const rowFindings = isAdd
                      ? (lineMap.get((change as AddChange).ln) ?? [])
                      : [];

                    // Stable key: type + old line + new line + content hash
                    const changeKey = `${change.type}-${oldLineNum ?? "x"}-${newLineNum ?? "x"}`;

                    return (
                      <div key={changeKey}>
                        <div className={`diff-line diff-line--${change.type}`}>
                          <span className="diff-line-num" aria-hidden="true">
                            {oldLineNum ?? ""}
                          </span>
                          <span className="diff-line-num" aria-hidden="true">
                            {newLineNum ?? ""}
                          </span>
                          <span className="diff-line-gutter" aria-hidden="true">
                            {isAdd ? "+" : isDel ? "-" : " "}
                          </span>
                          <code className="diff-line-content">
                            {change.content.slice(1)}
                          </code>
                        </div>
                        {rowFindings.map((finding) => (
                          <FindingCard
                            key={`${finding.file}-${finding.line}-${finding.title}`}
                            finding={finding}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </section>
  );
}
