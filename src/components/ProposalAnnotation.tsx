"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

export interface Hyperparam {
  name: string;
  value: string;
  role?: string;
  learnable?: boolean;
}

export interface DiagramNode {
  id: string;
  label: string;
}
export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}
export interface DiagramSpec {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface Annotation {
  model: string;
  name: string;
  tagline: string;
  kind: "formula" | "architecture" | "pseudocode" | "hybrid";
  formula?: string;
  diagram?: DiagramSpec;
  pseudocode?: string;
  key_hyperparams?: Hyperparam[];
  init_recovers?: string;
  diff_from_baseline: string;
  confidence: "high" | "medium" | "low";
}

interface Props {
  annotation: Annotation;
  /** Display name for the model (e.g. "Claude Opus 4.6"). */
  modelName: string;
  /** Color for the accent stripe (e.g. company brand color). */
  modelColor: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Render a LaTeX string via KaTeX. Returns sanitized HTML for `dangerouslySetInnerHTML`. */
function renderMath(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: "ignore",
      output: "htmlAndMathml",
    });
  } catch {
    return `<code>${latex}</code>`;
  }
}

/** Strip outer `$$` or `$` so KaTeX gets the bare LaTeX. */
function stripDollars(s: string): string {
  const trimmed = s.trim();
  if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
    return trimmed.slice(2, -2).trim();
  }
  if (trimmed.startsWith("$") && trimmed.endsWith("$")) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

/** Render a block formula (inside or outside `$$ ... $$`). */
function FormulaBlock({ latex }: { latex: string }) {
  const inner = stripDollars(latex);
  const html = renderMath(inner, true);
  return (
    <div
      className="overflow-x-auto rounded-md border border-border bg-muted/30 px-3 py-3 text-[13px]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Render pseudocode with inline `$...$` math segments rewritten to KaTeX. */
function PseudocodeBlock({ code }: { code: string }) {
  // Split each line on $...$ pairs (non-greedy), render math segments via KaTeX.
  const lines = code.replace(/^\/\/ ?/gm, "").split("\n");
  return (
    <pre className="overflow-x-auto rounded-md border border-border bg-muted/30 px-3 py-3 font-mono text-[12.5px] leading-relaxed">
      {lines.map((line, li) => {
        // Split on $math$ (single-dollar inline). Even indices = text, odd = math.
        const parts = line.split(/\$([^$\n]+)\$/g);
        return (
          <div key={li} className="whitespace-pre-wrap">
            {parts.map((part, pi) =>
              pi % 2 === 1 ? (
                <span
                  key={pi}
                  className="inline-block align-middle"
                  dangerouslySetInnerHTML={{ __html: renderMath(part, false) }}
                />
              ) : (
                <span key={pi}>{part}</span>
              ),
            )}
          </div>
        );
      })}
    </pre>
  );
}

/** Tiny SVG renderer for {nodes, edges}. Lays nodes out in a single horizontal
 *  row with even spacing. Suitable for ≤8 nodes; longer chains will overflow. */
function DiagramBlock({ spec }: { spec: DiagramSpec }) {
  const nodes = spec.nodes;
  const edges = spec.edges ?? [];
  if (nodes.length === 0) return null;

  // Layout: even horizontal spacing, fixed node box width based on label length.
  const nodeBoxWidth = (label: string) =>
    Math.max(64, Math.min(140, 12 + label.length * 7));
  const widths = nodes.map((n) => nodeBoxWidth(n.label));
  const gap = 28;
  const padX = 12;
  const padY = 24;
  const boxHeight = 32;
  const positions: Record<string, { x: number; w: number }> = {};
  let cursor = padX;
  for (let i = 0; i < nodes.length; i++) {
    positions[nodes[i].id] = { x: cursor, w: widths[i] };
    cursor += widths[i] + gap;
  }
  const totalWidth = cursor - gap + padX;
  const totalHeight = boxHeight + padY * 2;

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-muted/30 p-3">
      <svg
        width={totalWidth}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="block"
      >
        {/* Edges first so they appear behind nodes */}
        {edges.map((e, i) => {
          const a = positions[e.from];
          const b = positions[e.to];
          if (!a || !b) return null;
          const x1 = a.x + a.w;
          const x2 = b.x;
          const y = padY + boxHeight / 2;
          // Simple horizontal arrow when nodes are adjacent; for skip edges use a small arc.
          if (Math.abs(x2 - x1 - gap) < 1) {
            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y}
                  x2={x2 - 6}
                  y2={y}
                  stroke="var(--muted-foreground)"
                  strokeWidth={1.5}
                />
                <polygon
                  points={`${x2},${y} ${x2 - 6},${y - 4} ${x2 - 6},${y + 4}`}
                  fill="var(--muted-foreground)"
                />
                {e.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={y - 6}
                    textAnchor="middle"
                    fontSize={10}
                    fill="var(--muted-foreground)"
                  >
                    {e.label}
                  </text>
                )}
              </g>
            );
          }
          // Skip edge: arc above the row
          const midX = (x1 + x2) / 2;
          const arcY = padY - 10;
          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y} Q ${midX} ${arcY} ${x2 - 6} ${y}`}
                fill="none"
                stroke="var(--muted-foreground)"
                strokeWidth={1.5}
              />
              <polygon
                points={`${x2},${y} ${x2 - 6},${y - 4} ${x2 - 6},${y + 4}`}
                fill="var(--muted-foreground)"
              />
              {e.label && (
                <text
                  x={midX}
                  y={arcY - 2}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--muted-foreground)"
                >
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {/* Node boxes */}
        {nodes.map((n) => {
          const p = positions[n.id];
          return (
            <g key={n.id}>
              <rect
                x={p.x}
                y={padY}
                width={p.w}
                height={boxHeight}
                rx={6}
                ry={6}
                fill="var(--card)"
                stroke="var(--border)"
                strokeWidth={1.5}
              />
              <text
                x={p.x + p.w / 2}
                y={padY + boxHeight / 2 + 4}
                textAnchor="middle"
                fontSize={11}
                fill="var(--foreground)"
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

const KIND_LABEL: Record<Annotation["kind"], string> = {
  formula: "Formula",
  architecture: "Architecture",
  pseudocode: "Pseudocode",
  hybrid: "Hybrid",
};

const CONFIDENCE_DOT: Record<Annotation["confidence"], string> = {
  high: "#10b981",
  medium: "#eab308",
  low: "#ef4444",
};

export default function ProposalAnnotation({
  annotation,
  modelName,
  modelColor,
}: Props) {
  const a = annotation;
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card">
      {/* Left accent stripe */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: modelColor }}
      />
      <div className="space-y-3 p-4 pl-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{modelName}</span>
              <span className="opacity-50">·</span>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide">
                {KIND_LABEL[a.kind]}
              </span>
              <span
                className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-wide"
                title={`Annotation confidence: ${a.confidence}`}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: CONFIDENCE_DOT[a.confidence] }}
                />
                {a.confidence}
              </span>
            </div>
            <h3 className="mt-1.5 text-base font-semibold text-foreground">
              {a.name}
            </h3>
            <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
              {a.tagline}
            </p>
          </div>
        </div>

        {/* Primary representation block(s) */}
        <div className="space-y-2">
          {(a.kind === "formula" || a.kind === "hybrid") && a.formula && (
            <FormulaBlock latex={a.formula} />
          )}
          {(a.kind === "architecture" || a.kind === "hybrid") && a.diagram && (
            <DiagramBlock spec={a.diagram} />
          )}
          {(a.kind === "pseudocode" || a.kind === "hybrid") && a.pseudocode && (
            <PseudocodeBlock code={a.pseudocode} />
          )}
        </div>

        {/* Diff from baseline */}
        {a.diff_from_baseline && (
          <div className="rounded-md border-l-2 border-muted-foreground/30 bg-muted/20 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mr-1 font-medium uppercase tracking-wide text-foreground/70">
              Δ vs. baseline
            </span>
            <span>{a.diff_from_baseline}</span>
          </div>
        )}

        {/* Hyperparams + init_recovers */}
        {(a.key_hyperparams?.length || a.init_recovers) && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            {a.key_hyperparams?.map((h, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background/50 px-2 py-0.5"
                title={h.role}
              >
                <span
                  className="font-mono text-foreground"
                  dangerouslySetInnerHTML={{
                    __html: renderMath(h.name, false),
                  }}
                />
                <span className="opacity-50">=</span>
                <span className="font-mono">{h.value}</span>
                {h.learnable && (
                  <span className="rounded-sm bg-primary/10 px-1 text-[9px] uppercase tracking-wider text-primary">
                    learnable
                  </span>
                )}
              </span>
            ))}
            {a.init_recovers && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/50 px-2 py-0.5">
                <span className="opacity-50">↻</span>
                <span>Recovers {a.init_recovers}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
