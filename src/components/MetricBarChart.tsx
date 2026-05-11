"use client";

import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LeaderboardData, StandardModel } from "@/lib/types";
import {
  BASELINE_COLOR,
  metricLabel,
  modelColor,
  modelDisplayName,
  resolveCanonicalModel,
} from "@/lib/display";

interface Props {
  data: LeaderboardData;
  models: StandardModel[];
}

interface BarPoint {
  label: string;
  /** Plotted value used for the y-axis domain and the bar height for baseline
   *  rows. For model rows it's max(vanilla, agent). Plotted values are RAW —
   *  taller bar = larger metric value, regardless of direction. */
  value: number;
  /** Per-model overlay values (only set when kind="model"). */
  vanilla?: number;
  agent?: number;
  color: string;
  kind: "baseline" | "model";
  /** Lower-is-better → draw vanilla first, agent on top (agent expected to be
   *  shorter, stays visible). Higher-is-better → draw agent first, vanilla on
   *  top (vanilla expected to be shorter, stays visible). */
  direction: "higher" | "lower";
}

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function aggregateRows(rows: LeaderboardData["rows"]) {
  const finalRows = rows.filter((r) => r.model != null && r.is_final === true);
  const meanModels = new Set(
    finalRows.filter((r) => r.seed === "mean").map((r) => r.model as string)
  );
  return finalRows.filter(
    (r) => r.seed === "mean" || !meanModels.has(r.model as string)
  );
}

/** Custom shape for the per-metric bar.
 *  - Baseline rows: single rect, baseline grey, opacity 0.55.
 *  - Model rows: two rects at the SAME x-position — Vanilla (darker, full
 *    opacity-ish) drawn first, Agent (lighter) overlaid on top. The two
 *    must not be staggered (Recharts' default barGap would offset them).
 */
/** Mix `hex` with white by `t` ∈ [0,1] (0 = original, 1 = white). Used to
 *  produce a lighter opaque shade for the Agent overlay so we don't need any
 *  fillOpacity < 1. */
function lighten(hex: string, t: number): string {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return hex;
  const v = parseInt(m[1], 16);
  const r = (v >> 16) & 0xff;
  const g = (v >> 8) & 0xff;
  const b = v & 0xff;
  const mix = (c: number) => Math.round(c + (255 - c) * t);
  return (
    "#" +
    [mix(r), mix(g), mix(b)]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MetricBarShape(props: any) {
  const { x, y, width, height, value, payload } = props;
  if (typeof value !== "number" || height <= 0) return <g />;
  // Recharts always returns positive height. For positive values y is the bar
  // top and y+height is the zero line; for negative values y is the zero line
  // and y+height is the bar bottom. The y-axis scale is linear and uniform
  // across positive and negative regions, so deriving pxPerUnit from this
  // bar's value is globally valid for sub-bars on the other side of zero.
  const absValue = Math.abs(value);
  if (absValue === 0) return <g />;
  const pxPerUnit = height / absValue;
  const zeroY = value >= 0 ? y + height : y;

  const drawRect = (val: number, fill: string) => {
    const h = Math.abs(val) * pxPerUnit;
    const top = val >= 0 ? zeroY - h : zeroY;
    return (
      <rect x={x} y={top} width={width} height={h} rx={3} ry={3} fill={fill} />
    );
  };

  if (payload?.kind === "baseline") {
    return drawRect(value, BASELINE_COLOR);
  }
  const vanilla =
    typeof payload?.vanilla === "number" ? payload.vanilla : null;
  const agent = typeof payload?.agent === "number" ? payload.agent : null;
  const color: string = payload?.color ?? BASELINE_COLOR;
  const direction: "higher" | "lower" = payload?.direction ?? "higher";
  const agentColor = lighten(color, 0.55);
  // Both bars share the SAME x-position and the SAME width — they fully
  // overlap. Z-order is direction-aware so the (typically) shorter one
  // renders in front: lower-is-better → agent in front; higher-is-better →
  // vanilla in front. The taller one peeks out, making the gap visible.
  const vanillaRect = vanilla != null ? drawRect(vanilla, color) : null;
  const agentRect = agent != null ? drawRect(agent, agentColor) : null;
  if (direction === "lower") {
    return (
      <g>
        {vanillaRect}
        {agentRect}
      </g>
    );
  }
  return (
    <g>
      {agentRect}
      {vanillaRect}
    </g>
  );
}

type RawKind = "baseline" | "vanilla" | "agent";
function rawRowKind(model: string): RawKind {
  if (model.startsWith("baseline:")) return "baseline";
  if (model.startsWith("vanilla:")) return "vanilla";
  return "agent";
}

/** Group vanilla + agent rows of the same canonical model into a single
 *  bar entry (with two overlay sub-values). Baselines stay one entry per row.
 *  Plots raw metric values directly — no direction-dependent transform. */
function buildBars(
  rows: LeaderboardData["rows"],
  metric: string,
  models: StandardModel[],
  direction: "higher" | "lower"
): BarPoint[] {
  const baselines: BarPoint[] = [];
  const modelMap = new Map<
    string,
    {
      label: string;
      color: string;
      vanilla?: number;
      agent?: number;
    }
  >();

  for (const row of rows) {
    const v = row[metric];
    if (typeof v !== "number") continue;
    const rawModel = row.model as string;
    const kind = rawRowKind(rawModel);

    if (kind === "baseline") {
      baselines.push({
        label: modelDisplayName(rawModel, models),
        value: v,
        color: BASELINE_COLOR,
        kind: "baseline",
        direction,
      });
      continue;
    }

    const id =
      kind === "vanilla" ? rawModel.replace("vanilla:", "") : rawModel;
    const canonical = resolveCanonicalModel(id, models);
    if (!canonical) continue;
    const entry = modelMap.get(canonical.id) ?? {
      label: canonical.name,
      color: canonical.color,
    };
    if (kind === "vanilla") {
      entry.vanilla = v;
    } else {
      entry.agent = v;
    }
    modelMap.set(canonical.id, entry);
  }

  // Order: baselines first, then models in canonical models.json order.
  const orderedModels: BarPoint[] = models
    .map((m) => modelMap.get(m.id))
    .filter((e): e is NonNullable<typeof e> => e != null)
    .map((e) => {
      // Pick the sub-value with the largest |·| (preserving its sign) so that
      // Recharts allocates a bar rect tall enough to cover the dominant side.
      // MetricBarShape derives pxPerUnit from this and draws both vanilla and
      // agent at their true positions relative to zero — so a positive vanilla
      // and a negative agent both render correctly.
      const candidates = [e.vanilla, e.agent].filter(
        (v): v is number => typeof v === "number"
      );
      const value = candidates.reduce(
        (acc, v) => (Math.abs(v) > Math.abs(acc) ? v : acc),
        candidates[0] ?? 0
      );
      return {
        label: e.label,
        vanilla: e.vanilla,
        agent: e.agent,
        value,
        color: e.color,
        kind: "model" as const,
        direction,
      };
    });

  return [...baselines, ...orderedModels];
}

function formatValue(value: unknown) {
  if (typeof value !== "number") return "-";
  if (Math.abs(value) >= 100) return value.toFixed(1);
  if (Math.abs(value) >= 10) return value.toFixed(2);
  return value.toFixed(3);
}

function metricDomain(points: BarPoint[]): [number, number] {
  // Use the real sub-values (vanilla, agent, or baseline value), not
  // point.value (which is just the magnitude-dominant sub-value picked for
  // bar-height allocation). Always include 0 so the zero baseline is visible
  // — without this, a chart of all-negative values would render bars that
  // appear to "grow up from below zero" with no visible zero reference.
  const values: number[] = [0];
  for (const p of points) {
    if (p.kind === "baseline") {
      values.push(p.value);
    } else {
      if (typeof p.vanilla === "number") values.push(p.vanilla);
      if (typeof p.agent === "number") values.push(p.agent);
    }
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const scale = Math.max(Math.abs(min), Math.abs(max), 1);
  const padding = range > 0 ? range * 0.15 : scale * 0.05;

  let lower = min - padding;
  let upper = max + padding;
  if (min >= 0 && lower < 0) lower = 0;
  if (max <= 0 && upper > 0) upper = 0;
  if (lower === upper) {
    lower -= 1;
    upper += 1;
  }

  return [lower, upper];
}

/** Recharts custom tooltip showing raw metric values. */
function RawTooltip({
  active,
  label,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload,
}: {
  active?: boolean;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload as BarPoint | undefined;
  if (!point) return null;
  const isModel = point.kind === "model";
  return (
    <div
      className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs"
      style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.06)" }}
    >
      <div className="font-medium">{label}</div>
      {isModel ? (
        <div className="mt-1 space-y-0.5 text-muted-foreground">
          {typeof point.vanilla === "number" && (
            <div>
              <span className="opacity-70">Vanilla:</span>{" "}
              {formatValue(point.vanilla)}
            </div>
          )}
          {typeof point.agent === "number" && (
            <div>
              <span className="opacity-70">Agent:</span>{" "}
              {formatValue(point.agent)}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-1 text-muted-foreground">
          {formatValue(point.value)}
        </div>
      )}
    </div>
  );
}

export default function MetricBarChart({ data, models }: Props) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const rows = aggregateRows(data.rows);
  const metricGroups = data.metric_groups?.length
    ? data.metric_groups
    : [{ setting: "default", metrics: data.metric_columns }];

  if (rows.length === 0 || data.metric_columns.length === 0) {
    return null;
  }

  if (!mounted) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="mt-4 h-56 rounded-lg bg-muted/40" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Metric Breakdown</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Each model's Vanilla and Agent share one bar position; Vanilla is
            the darker fill, Agent the lighter overlay.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
            <span className="h-2 w-4 rounded-sm bg-muted-foreground/55" />
            baseline
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
            <span className="h-2 w-4 rounded-sm" style={{ background: "#444" }} />
            Vanilla
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
            <span className="h-2 w-4 rounded-sm" style={{ background: "#b3b3b3" }} />
            Agent
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {metricGroups.map((group) => (
          <section key={group.setting}>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <div className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {group.setting}
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div
              className={
                group.metrics.length === 1
                  ? "flex justify-center"
                  : "grid gap-4 lg:grid-cols-2"
              }
            >
              {group.metrics.map((metric) => {
                const direction = data.metric_directions?.[metric] ?? "higher";
                const bars = buildBars(rows, metric, models, direction);
                if (bars.length === 0) return null;
                const domain = metricDomain(bars);

                return (
                  <div
                    key={metric}
                    className={
                      group.metrics.length === 1
                        ? "w-full max-w-md rounded-lg border border-border p-3"
                        : "rounded-lg border border-border p-3"
                    }
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {metricLabel(metric)}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {direction === "lower"
                            ? "Lower is better"
                            : "Higher is better"}
                        </div>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {direction === "lower" ? "↓" : "↑"}
                      </span>
                    </div>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={bars}
                          margin={{ top: 8, right: 8, bottom: 52, left: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.35} />
                          <XAxis
                            dataKey="label"
                            interval={0}
                            tick={{ fontSize: 10 }}
                            angle={-35}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis
                            tick={{ fontSize: 10 }}
                            width={48}
                            domain={domain}
                            tickFormatter={formatValue}
                          />
                          <Tooltip
                            content={(p) => (
                              <RawTooltip
                                active={p.active}
                                label={String(p.label ?? "")}
                                payload={p.payload}
                              />
                            )}
                          />
                          {/* Single Bar driven by `value` (= max of vanilla
                              and agent for model rows, or the baseline
                              value). The custom shape draws Vanilla (darker)
                              and Agent (lighter overlay) at the same
                              x-position. */}
                          <Bar dataKey="value" radius={[3, 3, 0, 0]} shape={MetricBarShape} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
