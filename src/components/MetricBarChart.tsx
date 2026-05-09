"use client";

import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
  /** Plotted "value" used for the y-axis domain calculation and as the bar
   *  height for baseline rows. For model rows it's max(vanilla, agent).
   *  For lower-is-better metrics this is the *transformed* (referenceMax - raw)
   *  value so the bar visually grows with improvement; raw values are kept on
   *  rawValue/rawVanilla/rawAgent for the tooltip. */
  value: number;
  /** Per-model overlay values (only set when kind="model"). */
  vanilla?: number;
  agent?: number;
  /** Original raw values, preserved for tooltip display when the chart has
   *  applied a lower-is-better transformation. */
  rawValue: number;
  rawVanilla?: number;
  rawAgent?: number;
  color: string;
  kind: "baseline" | "model";
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MetricBarShape(props: any) {
  const { x, y, width, height, value, payload } = props;
  if (typeof value !== "number" || height <= 0) return <g />;
  if (payload?.kind === "baseline") {
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={3}
        ry={3}
        fill={BASELINE_COLOR}
        fillOpacity={0.55}
      />
    );
  }
  // value === max(vanilla, agent) → height is the taller bar's height.
  const baseY = y + height; // bottom of the bar in svg coords
  const pxPerUnit = height / value;
  const vanilla =
    typeof payload?.vanilla === "number" ? payload.vanilla : null;
  const agent = typeof payload?.agent === "number" ? payload.agent : null;
  const color: string = payload?.color ?? BASELINE_COLOR;
  const vH = vanilla != null ? vanilla * pxPerUnit : 0;
  const aH = agent != null ? agent * pxPerUnit : 0;
  return (
    <g>
      {vanilla != null && (
        <rect
          x={x}
          y={baseY - vH}
          width={width}
          height={vH}
          rx={3}
          ry={3}
          fill={color}
          fillOpacity={0.85}
        />
      )}
      {agent != null && (
        <rect
          x={x}
          y={baseY - aH}
          width={width}
          height={aH}
          rx={3}
          ry={3}
          fill={color}
          fillOpacity={0.32}
        />
      )}
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
 *
 *  When direction === "lower", transforms each plotted value to
 *  (referenceMax - raw) so the visual reading "taller = improvement" holds in
 *  both directions. Raw values are kept on rawValue/rawVanilla/rawAgent for
 *  the tooltip; the y-axis tickFormatter remaps ticks back to raw too. */
function buildBars(
  rows: LeaderboardData["rows"],
  metric: string,
  models: StandardModel[],
  direction: "higher" | "lower"
): { points: BarPoint[]; referenceMax: number } {
  // Pre-pass: gather raw values to compute the lower-is-better reference
  type Raw = { kind: "baseline" | "vanilla" | "agent"; raw: number; rawModel: string };
  const raws: Raw[] = [];
  for (const row of rows) {
    const v = row[metric];
    if (typeof v !== "number") continue;
    const rawModel = row.model as string;
    raws.push({ kind: rawRowKind(rawModel), raw: v, rawModel });
  }
  const referenceMax = raws.length > 0 ? Math.max(...raws.map((r) => r.raw)) : 0;
  const transform = (raw: number) =>
    direction === "lower" ? referenceMax - raw : raw;

  const baselines: BarPoint[] = [];
  const modelMap = new Map<
    string,
    {
      label: string;
      color: string;
      vanilla?: number;
      agent?: number;
      rawVanilla?: number;
      rawAgent?: number;
    }
  >();

  for (const { kind, raw, rawModel } of raws) {
    if (kind === "baseline") {
      baselines.push({
        label: modelDisplayName(rawModel, models),
        value: transform(raw),
        rawValue: raw,
        color: BASELINE_COLOR,
        kind: "baseline",
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
      entry.vanilla = transform(raw);
      entry.rawVanilla = raw;
    } else {
      entry.agent = transform(raw);
      entry.rawAgent = raw;
    }
    modelMap.set(canonical.id, entry);
  }

  // Order: baselines first, then models in canonical models.json order.
  const orderedModels: BarPoint[] = models
    .map((m) => modelMap.get(m.id))
    .filter((e): e is NonNullable<typeof e> => e != null)
    .map((e) => ({
      label: e.label,
      vanilla: e.vanilla,
      agent: e.agent,
      rawVanilla: e.rawVanilla,
      rawAgent: e.rawAgent,
      // y-axis domain & a fallback height: the larger of the two transformed
      // values. Tooltip shows rawVanilla/rawAgent separately, so rawValue
      // here is just a sentinel — pick the raw that produced the taller bar
      // (smaller raw for lower-is-better, larger raw for higher-is-better).
      value: Math.max(e.vanilla ?? -Infinity, e.agent ?? -Infinity),
      rawValue:
        direction === "lower"
          ? Math.min(e.rawVanilla ?? Infinity, e.rawAgent ?? Infinity)
          : Math.max(e.rawVanilla ?? -Infinity, e.rawAgent ?? -Infinity),
      color: e.color,
      kind: "model",
    }));

  return { points: [...baselines, ...orderedModels], referenceMax };
}

function formatValue(value: unknown) {
  if (typeof value !== "number") return "-";
  if (Math.abs(value) >= 100) return value.toFixed(1);
  if (Math.abs(value) >= 10) return value.toFixed(2);
  return value.toFixed(3);
}

function metricDomain(
  points: BarPoint[],
  direction: "higher" | "lower"
): [number, number] {
  const values = points.map((point) => point.value);
  // For lower-is-better, plotted values are (refMax - raw), always ≥ 0,
  // and we want the chart anchored at 0 so the "worst observed" sits flush
  // at the bottom and improvements grow up from there.
  if (direction === "lower") {
    const max = Math.max(...values);
    const padding = max > 0 ? max * 0.12 : 0.5;
    return [0, max + padding];
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

/** Recharts custom tooltip showing RAW metric values (i.e., undo any
 *  lower-is-better transformation we applied to the plotted value). */
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
          {typeof point.rawVanilla === "number" && (
            <div>
              <span className="opacity-70">Vanilla:</span>{" "}
              {formatValue(point.rawVanilla)}
            </div>
          )}
          {typeof point.rawAgent === "number" && (
            <div>
              <span className="opacity-70">Agent:</span>{" "}
              {formatValue(point.rawAgent)}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-1 text-muted-foreground">
          {formatValue(point.rawValue)}
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
            <span className="h-2 w-4 rounded-sm bg-foreground/85" />
            Vanilla
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
            <span className="h-2 w-4 rounded-sm bg-foreground/30" />
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
                const { points: bars, referenceMax } = buildBars(
                  rows,
                  metric,
                  models,
                  direction
                );
                if (bars.length === 0) return null;
                const domain = metricDomain(bars, direction);
                const yTick = (value: number) =>
                  direction === "lower"
                    ? formatValue(referenceMax - value)
                    : formatValue(value);

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
                            ? "Lower is better · taller bar = improvement"
                            : "Higher is better · adaptive scale"}
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
                            tickFormatter={yTick}
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
                              value). For lower-is-better metrics the value
                              is (referenceMax - raw) so the bar visually
                              grows with improvement; the y-axis tick label
                              and the tooltip remap back to raw. The custom
                              shape draws Vanilla (darker) and Agent (lighter
                              overlay) at the same x-position. */}
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
