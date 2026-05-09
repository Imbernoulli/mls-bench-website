"use client";

import { useState, useMemo } from "react";
import { diffLines, type Change } from "diff";
import type { TaskFile, BaselineOp, StandardModel } from "@/lib/types";
import AnnotatedCodeBlock, { applyBaselineOps } from "./AnnotatedCodeBlock";
import { resolveCanonicalModel } from "@/lib/display";
import ProposalAnnotation, { type Annotation } from "./ProposalAnnotation";

/** model_name → { filename → content } */
type Proposals = Record<string, Record<string, string>>;

/**
 * Compute which lines in the modified code were actually changed or added,
 * using a proper line-level diff to avoid merging separate change blocks.
 */
function computeChangedRange(
  sourceCode: string,
  modifiedCode: string
): Set<number> {
  const changes = diffLines(sourceCode, modifiedCode);
  const changed = new Set<number>();
  let modLine = 1;

  for (const change of changes) {
    const lines = change.value.replace(/\n$/, "").split("\n");
    if (change.added) {
      for (let i = 0; i < lines.length; i++) {
        changed.add(modLine + i);
      }
      modLine += lines.length;
    } else if (change.removed) {
      // Removed lines don't appear in the modified code, skip
    } else {
      // Unchanged lines
      modLine += lines.length;
    }
  }
  return changed;
}

interface Props {
  files: TaskFile[];
  baselinesCode?: Record<string, BaselineOp[]>;
  proposals?: Proposals | null;
  models: StandardModel[];
  /** Standardized human-readable annotations, keyed by raw proposal key. */
  annotations?: Annotation[];
  /** Standardized human-readable baseline annotations, keyed by baseline name. */
  baselineAnnotations?: Annotation[];
}

type ViewKind = "source" | "baseline" | "agent";

interface ViewEntry {
  key: string;
  label: string;
  kind: ViewKind;
  /** baseline name or model name */
  name?: string;
}

/** Resolve the code string for a given view + file */
function resolveCode(
  view: ViewEntry,
  file: TaskFile,
  baselinesCode: Record<string, BaselineOp[]> | undefined,
  proposals: Proposals | null | undefined
): string | null {
  if (!file.content) return null;

  if (view.kind === "source") {
    return file.content;
  }

  if (view.kind === "baseline" && view.name && baselinesCode?.[view.name]) {
    const ops = baselinesCode[view.name].filter(
      (op) => op.file === file.filename
    );
    if (ops.length === 0) return file.content;
    const { code } = applyBaselineOps(file.content, ops, file.filename);
    return code;
  }

  if (view.kind === "agent" && view.name && proposals?.[view.name]) {
    return proposals[view.name][file.filename] ?? null;
  }

  return null;
}


// ── Diff viewer ─────────────────────────────────────────────────────────────

function DiffViewer({
  leftLabel,
  rightLabel,
  leftCode,
  rightCode,
  filename,
}: {
  leftLabel: string;
  rightLabel: string;
  leftCode: string;
  rightCode: string;
  filename: string;
}) {
  const changes = useMemo(
    () => diffLines(leftCode, rightCode),
    [leftCode, rightCode]
  );
  const shortName = filename.split("/").pop() || filename;

  // Build line numbers for left and right
  let leftLine = 1;
  let rightLine = 1;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between bg-[#1e1e1e] px-4 py-2">
        <span className="text-xs font-mono text-gray-300">{shortName}</span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-red-500/40" />
            <span className="text-gray-400">{leftLabel}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm bg-green-500/40" />
            <span className="text-gray-400">{rightLabel}</span>
          </span>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto bg-[#1e1e1e]">
        <pre className="text-xs leading-5">
          {changes.map((change: Change, ci: number) => {
            const lines = change.value.replace(/\n$/, "").split("\n");
            return lines.map((line: string, li: number) => {
              let bg = "bg-transparent";
              let leftNum = "";
              let rightNum = "";

              if (change.added) {
                bg = "bg-green-500/15";
                rightNum = String(rightLine);
                rightLine++;
              } else if (change.removed) {
                bg = "bg-red-500/15";
                leftNum = String(leftLine);
                leftLine++;
              } else {
                leftNum = String(leftLine);
                rightNum = String(rightLine);
                leftLine++;
                rightLine++;
              }

              const prefix = change.added ? "+" : change.removed ? "-" : " ";

              return (
                <div key={`${ci}-${li}`} className={`flex ${bg}`}>
                  <span className="select-none w-10 shrink-0 text-right pr-2 text-gray-600 font-mono">
                    {leftNum}
                  </span>
                  <span className="select-none w-10 shrink-0 text-right pr-2 text-gray-600 font-mono">
                    {rightNum}
                  </span>
                  <span
                    className={`select-none w-4 shrink-0 font-mono ${
                      change.added
                        ? "text-green-400"
                        : change.removed
                          ? "text-red-400"
                          : "text-gray-600"
                    }`}
                  >
                    {prefix}
                  </span>
                  <code className="text-gray-200 font-mono whitespace-pre">
                    {line}
                  </code>
                </div>
              );
            });
          })}
        </pre>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function TaskCodeViewer({
  files,
  baselinesCode,
  proposals,
  models,
  annotations,
  baselineAnnotations,
}: Props) {
  const baselineAnnotationByName = new Map<string, Annotation>(
    (baselineAnnotations ?? []).map((a) => [a.model, a]),
  );
  const baselineNames = Object.keys(baselinesCode || {});
  // Filter agent proposals to the 5 canonical models from models.json,
  // dedupe so each canonical model has at most one tab (some tasks have
  // both `claude-opus-4.6` and `anthropic/claude-opus-4.6` keys; we prefer
  // a key that has a matching annotation, then the one whose name equals
  // the canonical id, then the alphabetically-first remaining one), and
  // label each tab with the formal display name (e.g. "Claude Opus 4.6").
  const annotatedKeys = new Set(annotations?.map((a) => a.model) ?? []);
  const annotationByModel = new Map<string, Annotation>(
    (annotations ?? []).map((a) => [a.model, a]),
  );
  const byCanonical = new Map<
    string,
    { rawKey: string; label: string; canonicalId: string }
  >();
  for (const rawKey of Object.keys(proposals || {})) {
    const canonical = resolveCanonicalModel(rawKey, models);
    if (!canonical) continue;
    const candidate = { rawKey, label: canonical.name, canonicalId: canonical.id };
    const existing = byCanonical.get(canonical.id);
    if (!existing) {
      byCanonical.set(canonical.id, candidate);
      continue;
    }
    // Prefer: (1) keys that have annotations, (2) canonical-id-equals-key, (3) alphabetical
    const score = (k: string) =>
      (annotatedKeys.has(k) ? 4 : 0) + (k === canonical.id ? 2 : 0) + (k < existing.rawKey ? 1 : 0);
    if (score(rawKey) > score(existing.rawKey)) {
      byCanonical.set(canonical.id, candidate);
    }
  }
  const agentEntries = Array.from(byCanonical.values()).sort((a, b) => {
    const ai = models.findIndex((m) => m.id === a.canonicalId);
    const bi = models.findIndex((m) => m.id === b.canonicalId);
    return ai - bi;
  });

  const [activeView, setActiveView] = useState<string>("source");
  const [diffMode, setDiffMode] = useState(false);
  const [diffLeft, setDiffLeft] = useState<string>("source");
  const [diffRight, setDiffRight] = useState<string>("");

  const filesWithContent = files.filter((f) => f.content);
  if (filesWithContent.length === 0) return null;

  // Build view list
  const views: ViewEntry[] = [
    { key: "source", label: "Source", kind: "source" },
    ...baselineNames.map((name) => ({
      key: `baseline:${name}`,
      label: name,
      kind: "baseline" as ViewKind,
      name,
    })),
    ...agentEntries.map((entry) => ({
      key: `agent:${entry.rawKey}`,
      label: entry.label,
      kind: "agent" as ViewKind,
      name: entry.rawKey,
    })),
  ];

  // Initialize diffRight to first non-source view if empty
  if (diffRight === "" && views.length > 1) {
    const first = views.find((v) => v.key !== "source");
    if (first) setDiffRight(first.key);
  }

  const activeEntry = views.find((v) => v.key === activeView) || views[0];
  const diffLeftEntry = views.find((v) => v.key === diffLeft) || views[0];
  const diffRightEntry = views.find((v) => v.key === diffRight) || views[0];

  // Unified tab styling: all tabs share the same active/inactive treatment;
  // a small colored dot before the label encodes the tab's kind (source =
  // dark, baseline = neutral gray, agent = model brand color).
  function tabClass(_v: ViewEntry, isActive: boolean) {
    return isActive
      ? "bg-foreground text-background"
      : "bg-muted text-muted-foreground hover:bg-muted/80";
  }
  function tabDotColor(v: ViewEntry): string {
    if (v.kind === "source") return "#0f172a";
    if (v.kind === "baseline") return "#64748b";
    if (v.kind === "agent" && v.name) {
      const canonical = resolveCanonicalModel(v.name, models);
      return canonical?.color ?? "#7c3aed";
    }
    return "#94a3b8";
  }

  return (
    <div>
      {/* Top bar: tabs + diff toggle */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* View tabs (only in non-diff mode). All tabs use the same visual
            language; a small colored dot encodes the kind so source/baseline/
            agent are distinguishable without colored backgrounds. */}
        {!diffMode &&
          views.map((v) => (
            <button
              key={v.key}
              onClick={() => setActiveView(v.key)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${tabClass(
                v,
                activeView === v.key,
              )}`}
            >
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: tabDotColor(v) }}
              />
              {v.kind === "source" ? "Source" : v.label}
            </button>
          ))}

        {/* Diff mode selectors */}
        {diffMode && (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={diffLeft}
              onChange={(e) => setDiffLeft(e.target.value)}
              className="rounded-md border border-border bg-card px-2 py-1.5 text-xs"
            >
              {views.map((v) => (
                <option key={v.key} value={v.key}>
                  {v.kind === "source"
                    ? "Source"
                    : v.kind === "baseline"
                      ? `baseline: ${v.label}`
                      : v.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">vs</span>
            <select
              value={diffRight}
              onChange={(e) => setDiffRight(e.target.value)}
              className="rounded-md border border-border bg-card px-2 py-1.5 text-xs"
            >
              {views.map((v) => (
                <option key={v.key} value={v.key}>
                  {v.kind === "source"
                    ? "Source"
                    : v.kind === "baseline"
                      ? `baseline: ${v.label}`
                      : v.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Diff toggle */}
        {views.length > 1 && (
          <button
            onClick={() => setDiffMode(!diffMode)}
            className={`ml-auto rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              diffMode
                ? "bg-amber-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {diffMode ? "Exit diff" : "Diff"}
          </button>
        )}
      </div>

      {/* Annotation card (only when an agent tab is active and we have an annotation for it) */}
      {!diffMode && activeEntry.kind === "agent" && activeEntry.name && (() => {
        const ann = annotationByModel.get(activeEntry.name);
        if (!ann) return null;
        const canonical = resolveCanonicalModel(activeEntry.name, models);
        const color = canonical?.color ?? "var(--muted-foreground)";
        return (
          <div className="mb-4">
            <ProposalAnnotation
              annotation={ann}
              modelName={activeEntry.label}
              modelColor={color}
              mode="proposal"
            />
          </div>
        );
      })()}

      {/* Baseline annotation card (when a baseline tab is active and we have an annotation) */}
      {!diffMode && activeEntry.kind === "baseline" && activeEntry.name && (() => {
        const ann = baselineAnnotationByName.get(activeEntry.name);
        if (!ann) return null;
        return (
          <div className="mb-4">
            <ProposalAnnotation
              annotation={ann}
              modelName={activeEntry.label}
              modelColor="#6b7280"
              mode="baseline"
            />
          </div>
        );
      })()}

      {/* Code display */}
      <div className="space-y-4">
        {filesWithContent.map((file, i) => {
          if (diffMode) {
            const leftCode = resolveCode(
              diffLeftEntry,
              file,
              baselinesCode,
              proposals
            );
            const rightCode = resolveCode(
              diffRightEntry,
              file,
              baselinesCode,
              proposals
            );
            if (!leftCode || !rightCode) return null;

            const leftLabel =
              diffLeftEntry.kind === "source"
                ? "Source"
                : diffLeftEntry.kind === "baseline"
                  ? `baseline: ${diffLeftEntry.label}`
                  : diffLeftEntry.label;
            const rightLabel =
              diffRightEntry.kind === "source"
                ? "Source"
                : diffRightEntry.kind === "baseline"
                  ? `baseline: ${diffRightEntry.label}`
                  : diffRightEntry.label;

            return (
              <DiffViewer
                key={`diff-${i}`}
                leftLabel={leftLabel}
                rightLabel={rightLabel}
                leftCode={leftCode}
                rightCode={rightCode}
                filename={file.filename}
              />
            );
          }

          // Normal view
          if (activeEntry.kind === "agent" && activeEntry.name) {
            // Agent proposal: show changed lines (diff vs source template)
            const proposalCode =
              proposals?.[activeEntry.name]?.[file.filename];
            if (!proposalCode) return null;
            const changed = file.content
              ? computeChangedRange(file.content, proposalCode)
              : new Set<number>();
            return (
              <AnnotatedCodeBlock
                key={`${activeView}-${i}`}
                code={proposalCode}
                filename={file.filename}
                editRanges={file.edit_ranges}
                changedLines={changed}
                baselineLabel={activeEntry.label}
              />
            );
          }

          // Source or baseline
          const baselineOps =
            activeEntry.kind === "baseline" && activeEntry.name
              ? (baselinesCode?.[activeEntry.name] || []).filter(
                  (op) => op.file === file.filename
                )
              : undefined;

          return (
            <AnnotatedCodeBlock
              key={`${activeView}-${i}`}
              code={file.content!}
              filename={file.filename}
              editRanges={file.edit_ranges}
              baselineOps={
                baselineOps && baselineOps.length > 0 ? baselineOps : undefined
              }
              baselineLabel={
                activeEntry.kind === "baseline"
                  ? activeEntry.name
                  : undefined
              }
            />
          );
        })}
      </div>

      {/* Files without content */}
      {files.filter((f) => !f.content).length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-1">
            Additional context files (read-only):
          </p>
          <ul className="space-y-1">
            {files
              .filter((f) => !f.content)
              .map((f, i) => (
                <li key={i} className="text-xs">
                  <code className="bg-muted px-2 py-0.5 rounded text-xs">
                    {f.filename}
                  </code>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
