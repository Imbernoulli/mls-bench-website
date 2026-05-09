"use client";

import { useState, useMemo } from "react";
import type { EditRange, BaselineOp } from "@/lib/types";

interface Props {
  code: string;
  filename: string;
  editRanges: EditRange[];
  language?: string;
  /** Baseline ops to preview: show the file with edits applied, highlight changed lines */
  baselineOps?: BaselineOp[];
  /** Label for the baseline or agent being shown */
  baselineLabel?: string;
  /** Pre-computed set of 1-based line numbers that were changed (used for agent proposals) */
  changedLines?: Set<number>;
}

export function isLineEditable(lineNum: number, ranges: EditRange[]): boolean {
  for (const r of ranges) {
    if (r.start === -1) return true; // all lines editable
    if (lineNum >= r.start && lineNum <= r.end) return true;
  }
  return false;
}

/**
 * Apply baseline OPS to the source code to produce the modified version.
 * Returns { code, changedLines } where changedLines is a Set of 1-based line numbers.
 */
export function applyBaselineOps(
  sourceCode: string,
  ops: BaselineOp[],
  targetFile: string
): { code: string; changedLines: Set<number> } {
  const lines = sourceCode.split("\n");
  const changedLines = new Set<number>();

  // Sort ops by start_line descending so replacements don't shift line numbers
  const sorted = [...ops]
    .filter((op) => op.file === targetFile)
    .sort((a, b) => b.start_line - a.start_line);

  for (const op of sorted) {
    const newLines = op.content.replace(/\n$/, "").split("\n");
    const deleteCount = op.end_line - op.start_line + 1;
    // start_line is 1-based, splice is 0-based
    lines.splice(op.start_line - 1, deleteCount, ...newLines);
  }

  // Recompute changed line numbers after all ops applied (re-sort ascending)
  const ascending = [...ops]
    .filter((op) => op.file === targetFile)
    .sort((a, b) => a.start_line - b.start_line);

  let offset = 0;
  for (const op of ascending) {
    const newLines = op.content.replace(/\n$/, "").split("\n");
    const adjustedStart = op.start_line + offset;
    for (let i = 0; i < newLines.length; i++) {
      changedLines.add(adjustedStart + i);
    }
    const deleteCount = op.end_line - op.start_line + 1;
    offset += newLines.length - deleteCount;
  }

  return { code: lines.join("\n"), changedLines };
}

export default function AnnotatedCodeBlock({
  code,
  filename,
  editRanges,
  baselineOps,
  baselineLabel,
  changedLines: changedLinesProp,
}: Props) {
  const [collapsed, setCollapsed] = useState(true);

  const { displayCode, lineClasses } = useMemo(() => {
    // Agent proposals: pre-computed changed lines
    if (changedLinesProp && changedLinesProp.size > 0) {
      const lines = code.split("\n");
      const classes = lines.map((_, i) =>
        changedLinesProp.has(i + 1) ? "changed" : "unchanged"
      );
      return { displayCode: code, lineClasses: classes };
    }
    if (baselineOps && baselineOps.length > 0) {
      // Apply baseline edits and highlight changed lines
      const { code: modified, changedLines } = applyBaselineOps(
        code,
        baselineOps,
        filename
      );
      const lines = modified.split("\n");
      const classes = lines.map((_, i) =>
        changedLines.has(i + 1) ? "changed" : "unchanged"
      );
      return { displayCode: modified, lineClasses: classes };
    }
    // Default: highlight editable vs read-only
    const lines = code.split("\n");
    const classes = lines.map((_, i) =>
      isLineEditable(i + 1, editRanges) ? "editable" : "readonly"
    );
    return { displayCode: code, lineClasses: classes };
  }, [code, filename, editRanges, baselineOps, changedLinesProp]);

  const lines = displayCode.split("\n");
  const shortName = filename.split("/").pop() || filename;
  const previewLines = 15;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#1e1e1e] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-300">{shortName}</span>
          {baselineLabel && (
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-300">
              {baselineLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!baselineOps && !changedLinesProp && (
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500/40" />
                <span className="text-gray-400">Editable</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm bg-gray-600/40" />
                <span className="text-gray-400">Read-only</span>
              </span>
            </div>
          )}
          {(baselineOps || changedLinesProp) && (
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm bg-blue-500/40" />
                <span className="text-gray-400">Changed</span>
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            {collapsed ? `Show all (${lines.length} lines)` : "Collapse"}
          </button>
        </div>
      </div>
      {/* Code */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto bg-[#1e1e1e]">
        <pre className="text-xs leading-5">
          {(collapsed ? lines.slice(0, previewLines) : lines).map((line, i) => {
            const cls = lineClasses[i] || "readonly";
            let bgClass = "";
            if (cls === "editable") bgClass = "bg-emerald-500/10";
            else if (cls === "changed") bgClass = "bg-blue-500/15";
            else bgClass = "bg-transparent";

            return (
              <div key={i} className={`flex ${bgClass}`}>
                <span className="select-none w-12 shrink-0 text-right pr-4 text-gray-500 font-mono">
                  {i + 1}
                </span>
                <code className="text-gray-200 font-mono whitespace-pre">
                  {line}
                </code>
              </div>
            );
          })}
          {collapsed && lines.length > previewLines && (
            <div className="flex">
              <span className="w-12 shrink-0" />
              <button
                onClick={() => setCollapsed(false)}
                className="text-gray-400 hover:text-gray-200 text-xs py-1"
              >
                ... {lines.length - previewLines} more lines
              </button>
            </div>
          )}
        </pre>
      </div>
    </div>
  );
}
