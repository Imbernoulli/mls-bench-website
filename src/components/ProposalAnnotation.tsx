"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

export interface Hyperparam {
  name: string;
  value: string;
  role?: string;
  learnable?: boolean;
}

/** Typed visual vocabulary for diagram blocks. Each kind has a distinct color
 *  so a reader can scan a diagram and tell tensors from norm layers from
 *  attention blocks at a glance, without having to read every label.
 *
 *  Main blocks (rectangles): tensor / linear / norm / act / attn / ffn /
 *  embed / pos / softmax / loss / conv / rnn / op (generic typed op).
 *  Operator nodes (small symbols): add / mul / concat / split / param. */
export type BlockKind =
  | "tensor"
  | "linear"
  | "norm"
  | "act"
  | "attn"
  | "ffn"
  | "embed"
  | "pos"
  | "softmax"
  | "loss"
  | "conv"
  | "rnn"
  | "op"
  | "add"
  | "mul"
  | "concat"
  | "split"
  | "param";

export interface DiagramNode {
  id: string;
  /** Optional typed kind. Defaults to "op" if omitted (legacy nodes). */
  kind?: BlockKind;
  /** Primary label shown inside the block (e.g. "RMSNorm", "Q proj"). */
  label?: string;
  /** Small subtitle below the label (e.g. "ε=1e-6", "→ 4d hidden"). */
  sub?: string;
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
  /** Display name for the model or baseline (e.g. "Claude Opus 4.6", "GELU"). */
  modelName: string;
  /** Color for the accent stripe (e.g. company brand color). */
  modelColor: string;
  /** "proposal" relabels diff_from_baseline as "Δ vs. baseline";
   *  "baseline" relabels it as "Reference". Default "proposal". */
  mode?: "proposal" | "baseline";
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

/** A hyperparam name like `weight_decay` should NOT be passed through KaTeX
 *  (which would interpret `_d` as subscript and shrink the rest). Only treat
 *  as math if it clearly is — explicit LaTeX (`\\beta`), or a short
 *  Greek/single-letter prefix before `_` (`τ_split`, `β_1`, `η_max`). Code
 *  identifiers (`weight_decay`, `lr_warmup_steps`) render as plain monospace. */
function looksLikeMathName(name: string): boolean {
  if (name.includes("\\")) return true;
  if (!name.includes("_")) {
    // Single Greek letter or symbol with no underscore — also math
    return /^[α-ωΑ-Ω]$/.test(name) || /^[a-zA-Z]$/.test(name);
  }
  const head = name.split("_")[0];
  // 1-2 chars before underscore, all letters → math (e.g. β_1, τ_split, lr_max)
  // For 1-2 char heads like "lr" we'd lose the underscore-as-subscript intent;
  // restrict to truly short identifiers OR Greek letters.
  if (/^[α-ωΑ-Ω]$/.test(head)) return true;
  if (head.length === 1 && /^[a-zA-Z]$/.test(head)) return true;
  return false;
}

/** Render a block-formula string. Annotators sometimes pack MULTIPLE equations
 *  into one `formula` field as `$$ a $$ $$ b $$ $$ c $$` — split on every `$$`
 *  separator and render each non-empty piece as its own KaTeX block, stacked
 *  vertically. Single-equation strings work too because the split yields just
 *  one piece after filtering blanks. */
function FormulaBlock({ latex }: { latex: string }) {
  const pieces = latex
    .split(/\$\$/g)
    .map((p) => p.trim())
    .filter(Boolean);
  if (pieces.length === 0) return null;
  return (
    <div className="space-y-2 overflow-x-auto rounded-md border border-border bg-muted/30 px-3 py-3 text-[13px]">
      {pieces.map((p, i) => (
        <div key={i} dangerouslySetInnerHTML={{ __html: renderMath(p, true) }} />
      ))}
    </div>
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

/** Visual style per typed block kind. The colors are the block's identity at
 *  a glance — a reader scans a diagram and sees orange = FFN, purple = Attn,
 *  yellow = Norm, etc. without reading every label. */
const BLOCK_STYLE: Record<
  BlockKind,
  { bg: string; border: string; text: string; isOp: boolean; symbol?: string }
> = {
  tensor:  { bg: "#f3f4f6", border: "#9ca3af", text: "#374151", isOp: false },
  linear:  { bg: "#dbeafe", border: "#3b82f6", text: "#1e3a8a", isOp: false },
  norm:    { bg: "#fef3c7", border: "#d97706", text: "#92400e", isOp: false },
  act:     { bg: "#d1fae5", border: "#059669", text: "#065f46", isOp: false },
  attn:    { bg: "#ede9fe", border: "#7c3aed", text: "#4c1d95", isOp: false },
  ffn:     { bg: "#fed7aa", border: "#ea580c", text: "#7c2d12", isOp: false },
  embed:   { bg: "#ccfbf1", border: "#0d9488", text: "#134e4a", isOp: false },
  pos:     { bg: "#cffafe", border: "#0891b2", text: "#164e63", isOp: false },
  softmax: { bg: "#fce7f3", border: "#db2777", text: "#831843", isOp: false },
  loss:    { bg: "#fee2e2", border: "#dc2626", text: "#7f1d1d", isOp: false },
  conv:    { bg: "#e0e7ff", border: "#4f46e5", text: "#312e81", isOp: false },
  rnn:     { bg: "#fef3c7", border: "#b45309", text: "#78350f", isOp: false },
  op:      { bg: "#f1f5f9", border: "#64748b", text: "#334155", isOp: false },
  add:     { bg: "#ffffff", border: "#374151", text: "#374151", isOp: true, symbol: "+" },
  mul:     { bg: "#ffffff", border: "#374151", text: "#374151", isOp: true, symbol: "×" },
  concat:  { bg: "#ffffff", border: "#374151", text: "#374151", isOp: true, symbol: "‖" },
  split:   { bg: "#ffffff", border: "#374151", text: "#374151", isOp: true, symbol: "⤳" },
  param:   { bg: "#fffbeb", border: "#d97706", text: "#7c2d12", isOp: true, symbol: "θ" },
};

/** Auto-grid layout for typed-block diagrams. Topologically levels nodes by
 *  longest path from a source; within a level, stacks vertically. Edges become
 *  bezier curves so cross-row connections route cleanly. */
function computeLayout(nodes: DiagramNode[], edges: DiagramEdge[]) {
  const COL_W = 130;
  const ROW_H = 56;
  const PAD = 16;
  const NODE_W = 110;
  const NODE_H = 36;
  const OP_R = 12;

  const out = new Map<string, string[]>();
  const inDegInit = new Map<string, number>();
  for (const n of nodes) {
    out.set(n.id, []);
    inDegInit.set(n.id, 0);
  }
  for (const e of edges) {
    out.get(e.from)?.push(e.to);
    inDegInit.set(e.to, (inDegInit.get(e.to) ?? 0) + 1);
  }

  // Longest-path levels via Kahn-style topological sweep.
  const level = new Map<string, number>();
  const remaining = new Map(inDegInit);
  const queue: string[] = [];
  for (const n of nodes) {
    if ((remaining.get(n.id) ?? 0) === 0) {
      level.set(n.id, 0);
      queue.push(n.id);
    }
  }
  while (queue.length) {
    const id = queue.shift()!;
    for (const nxt of out.get(id) ?? []) {
      const newL = (level.get(id) ?? 0) + 1;
      if (newL > (level.get(nxt) ?? -1)) level.set(nxt, newL);
      remaining.set(nxt, (remaining.get(nxt) ?? 1) - 1);
      if ((remaining.get(nxt) ?? 0) === 0 && !level.has(nxt)) {
        // shouldn't happen since we set level above, but be safe
        level.set(nxt, newL);
        queue.push(nxt);
      } else if ((remaining.get(nxt) ?? 0) === 0) {
        queue.push(nxt);
      }
    }
  }
  // Any unvisited (cycle / disconnected) → put at level 0
  for (const n of nodes) if (!level.has(n.id)) level.set(n.id, 0);

  // Bucket by level, preserve declaration order
  const byLevel = new Map<number, DiagramNode[]>();
  for (const n of nodes) {
    const l = level.get(n.id) ?? 0;
    if (!byLevel.has(l)) byLevel.set(l, []);
    byLevel.get(l)!.push(n);
  }

  const levels = Array.from(byLevel.keys()).sort((a, b) => a - b);
  const maxRows = Math.max(1, ...Array.from(byLevel.values()).map((a) => a.length));

  const positions = new Map<
    string,
    { x: number; y: number; w: number; h: number; cx: number; cy: number; isOp: boolean }
  >();
  for (const l of levels) {
    const ns = byLevel.get(l)!;
    ns.forEach((n, i) => {
      const isOp = BLOCK_STYLE[n.kind ?? "op"].isOp;
      const w = isOp ? OP_R * 2 : NODE_W;
      const h = isOp ? OP_R * 2 : NODE_H;
      const colCenter = PAD + l * COL_W + NODE_W / 2;
      const rowCenter = PAD + ROW_H * (i + (maxRows - ns.length) / 2) + ROW_H / 2;
      positions.set(n.id, {
        x: colCenter - w / 2,
        y: rowCenter - h / 2,
        w,
        h,
        cx: colCenter,
        cy: rowCenter,
        isOp,
      });
    });
  }

  const lastLevel = levels.length > 0 ? levels[levels.length - 1] : 0;
  const totalW = PAD * 2 + lastLevel * COL_W + NODE_W;
  const totalH = PAD * 2 + maxRows * ROW_H;
  return { positions, totalW, totalH };
}

/** Typed-block diagram renderer. Each node has an optional `kind` (default
 *  "op") that picks a colored visual style; layout is computed automatically
 *  via topological levels with bezier-curve edges. */
function DiagramBlock({ spec }: { spec: DiagramSpec }) {
  const nodes = spec.nodes;
  const edges = spec.edges ?? [];
  if (nodes.length === 0) return null;

  const { positions, totalW, totalH } = computeLayout(nodes, edges);

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-muted/30 p-3">
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="block"
      >
        {/* Edges first so nodes overlay them */}
        {edges.map((e, i) => {
          const a = positions.get(e.from);
          const b = positions.get(e.to);
          if (!a || !b) return null;
          const x1 = a.x + a.w;
          const y1 = a.cy;
          const x2 = b.x;
          const y2 = b.cy;
          const dx = Math.max(20, x2 - x1);
          const cp = dx * 0.4;
          const path = `M ${x1} ${y1} C ${x1 + cp} ${y1}, ${x2 - cp} ${y2}, ${x2 - 5} ${y2}`;
          return (
            <g key={i}>
              <path d={path} fill="none" stroke="#94a3b8" strokeWidth={1.4} />
              <polygon
                points={`${x2},${y2} ${x2 - 6},${y2 - 4} ${x2 - 6},${y2 + 4}`}
                fill="#94a3b8"
              />
              {e.label && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#64748b"
                >
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {/* Nodes */}
        {nodes.map((n) => {
          const p = positions.get(n.id);
          if (!p) return null;
          const k = n.kind ?? "op";
          const s = BLOCK_STYLE[k];
          if (s.isOp) {
            // Small operator node
            return (
              <g key={n.id}>
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={12}
                  fill={s.bg}
                  stroke={s.border}
                  strokeWidth={1.5}
                />
                <text
                  x={p.cx}
                  y={p.cy + 4}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  fill={s.text}
                >
                  {s.symbol}
                </text>
                {n.label && (
                  <text
                    x={p.cx + 16}
                    y={p.cy + 4}
                    fontSize={10}
                    fill="#64748b"
                  >
                    {n.label}
                  </text>
                )}
              </g>
            );
          }
          // Main typed block
          const labelY = n.sub ? p.cy - 2 : p.cy + 4;
          return (
            <g key={n.id}>
              <rect
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                rx={5}
                ry={5}
                fill={s.bg}
                stroke={s.border}
                strokeWidth={1.4}
              />
              <text
                x={p.cx}
                y={labelY}
                textAnchor="middle"
                fontSize={11}
                fontWeight={500}
                fill={s.text}
              >
                {n.label ?? n.id}
              </text>
              {n.sub && (
                <text
                  x={p.cx}
                  y={p.cy + 11}
                  textAnchor="middle"
                  fontSize={9}
                  fill={s.text}
                  opacity={0.7}
                >
                  {n.sub}
                </text>
              )}
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
  mode = "proposal",
}: Props) {
  const a = annotation;
  const diffLabel = mode === "baseline" ? "Reference" : "Δ vs. baseline";
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

        {/* Diff from baseline (proposal mode) / Reference (baseline mode) */}
        {a.diff_from_baseline && (
          <div className="rounded-md border-l-2 border-muted-foreground/30 bg-muted/20 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mr-1 font-medium uppercase tracking-wide text-foreground/70">
              {diffLabel}
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
                {looksLikeMathName(h.name) ? (
                  <span
                    className="text-foreground"
                    dangerouslySetInnerHTML={{
                      __html: renderMath(h.name, false),
                    }}
                  />
                ) : (
                  <span className="font-mono text-foreground">{h.name}</span>
                )}
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
