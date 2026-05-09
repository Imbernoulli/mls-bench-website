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
  /** Sentinel "value" used for the y-axis domain calculation and as the bar
   *  height for baseline rows. For model rows it's max(vanilla, agent). */
  value: number;
  /** Per-model overlay values (only set when kind="model"). */
  vanilla?: number;
  agent?: number;
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

type RawKind = "baseline" | "vanilla" | "agent";
function rawRowKind(model: string): RawKind {
  if (model.startsWith("baseline:")) return "baseline";
  if (model.startsWith("vanilla:")) return "vanilla";
  return "agent";
}

/** Group vanilla + agent rows of the same canonical model into a single
 *  bar entry (with two overlay sub-values). Baselines stay one entry per row. */
function buildBars(
  rows: LeaderboardData["rows"],
  metric: string,
  models: StandardModel[]
): BarPoint[] {
  const baselines: BarPoint[] = [];
  const modelMap = new Map<
    string,
    { label: string; color: string; vanilla?: number; agent?: number }
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
    if (kind === "vanilla") entry.vanilla = v;
    else entry.agent = v;
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
      // y-axis domain & a fallback height: the larger of the two values.
      value: Math.max(e.vanilla ?? -Infinity, e.agent ?? -Infinity),
      color: e.color,
      kind: "model",
    }));

  return [...baselines, ...orderedModels];
}

function formatValue(value: unknown) {
  if (typeof value !== "number") return "-";
  if (Math.abs(value) >= 100) return value.toFixed(1);
  if (Math.abs(value) >= 10) return value.toFixed(2);
  return value.toFixed(3);
}

function metricDomain(points: BarPoint[]): [number, number] {
  const values = points.map((point) => point.value);
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
            <div className="grid gap-4 lg:grid-cols-2">
              {group.metrics.map((metric) => {
                const direction = data.metric_directions?.[metric] ?? "higher";
                const bars = buildBars(rows, metric, models);
                if (bars.length === 0) return null;
                const domain = metricDomain(bars);

                return (
                  <div key={metric} className="rounded-lg border border-border p-3">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {metricLabel(metric)}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {direction === "lower" ? "Lower is better" : "Higher is better"} · adaptive scale
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
                          barGap="-100%"
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
                            tickFormatter={(value) => formatValue(value)}
                          />
                          <Tooltip
                            formatter={(value) => formatValue(value)}
                            labelFormatter={(label) => String(label)}
                            contentStyle={{
                              background: "var(--card)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                          {/* Vanilla (darker) drawn first so the lighter
                              Agent overlay sits on top. */}
                          <Bar dataKey="vanilla" name="Vanilla" radius={[3, 3, 0, 0]}>
                            {bars.map((point) => (
                              <Cell
                                key={`v-${metric}-${point.label}`}
                                fill={point.color}
                                fillOpacity={0.85}
                              />
                            ))}
                          </Bar>
                          <Bar dataKey="agent" name="Agent" radius={[3, 3, 0, 0]}>
                            {bars.map((point) => (
                              <Cell
                                key={`a-${metric}-${point.label}`}
                                fill={point.color}
                                fillOpacity={0.3}
                              />
                            ))}
                          </Bar>
                          {/* Baseline rows have neither vanilla nor agent —
                              this Bar renders only their `value` field, so
                              their bars are at distinct x positions. */}
                          <Bar dataKey="value" name="Baseline" radius={[3, 3, 0, 0]}>
                            {bars.map((point) => (
                              <Cell
                                key={`b-${metric}-${point.label}`}
                                fill={point.kind === "baseline" ? BASELINE_COLOR : "transparent"}
                                fillOpacity={point.kind === "baseline" ? 0.55 : 0}
                              />
                            ))}
                          </Bar>
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
