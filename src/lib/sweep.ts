import type { LeaderboardData, StandardModel } from "./types";
import { resolveCanonicalModel } from "./display";

/** "Sweep" = an agent's final submission strictly beats every baseline's
 *  final submission on every reported metric (respecting metric_directions).
 *  A metric is considered comparable for a given (agent, baseline) pair only
 *  when both have a finite numeric value for it; if any required value is
 *  missing the agent does NOT sweep (we err on the side of conservative).  */

export interface ModelSweep {
  /** Canonical model id (e.g. "claude-opus-4.6"). */
  modelId: string;
  /** Display name from models.json. */
  modelName: string;
  /** Brand color from models.json. */
  modelColor: string;
  /** Per-metric: agent value, the next-best baseline value, baseline name. */
  metricDeltas: {
    metric: string;
    direction: "higher" | "lower";
    agent: number;
    bestBaseline: number;
    bestBaselineName: string;
  }[];
}

/** Pick the canonical "final" rows: prefer the seed=mean row when present,
 *  otherwise keep per-seed rows. Filters out non-final rows. */
function finalRows(
  rows: LeaderboardData["rows"]
): LeaderboardData["rows"] {
  const final = rows.filter((r) => r.model != null && r.is_final === true);
  const meanModels = new Set(
    final.filter((r) => r.seed === "mean").map((r) => r.model as string)
  );
  return final.filter(
    (r) => r.seed === "mean" || !meanModels.has(r.model as string)
  );
}

/** Returns the agent's strict-better-than relation against `b` on `metric`,
 *  or null if either side is missing a number. */
function strictlyBeats(
  agent: number | null,
  baseline: number | null,
  direction: "higher" | "lower"
): boolean | null {
  if (typeof agent !== "number" || typeof baseline !== "number") return null;
  if (!Number.isFinite(agent) || !Number.isFinite(baseline)) return null;
  return direction === "lower" ? agent < baseline : agent > baseline;
}

/** Compute which agent models swept all baselines on a given task. */
export function computeSweeps(
  data: LeaderboardData,
  models: StandardModel[]
): ModelSweep[] {
  const rows = finalRows(data.rows);
  const metrics = data.metric_columns;
  if (rows.length === 0 || metrics.length === 0) return [];
  const directions = data.metric_directions ?? {};

  // Bucket rows by canonical model (agents) and by raw name (baselines).
  type Numeric = Record<string, number | null>;
  const agentRows = new Map<string, Numeric>(); // canonical id → metric values
  const baselineRows: { name: string; values: Numeric }[] = [];

  for (const row of rows) {
    const raw = row.model as string;
    const values: Numeric = {};
    for (const m of metrics) {
      const v = row[m];
      values[m] = typeof v === "number" && Number.isFinite(v) ? v : null;
    }
    if (raw.startsWith("baseline:")) {
      baselineRows.push({ name: raw.slice("baseline:".length), values });
      continue;
    }
    if (raw.startsWith("vanilla:")) continue; // vanilla is the "before" agent
    const canonical = resolveCanonicalModel(raw, models);
    if (!canonical) continue;
    // If multiple raw keys map to the same canonical (alias collision), keep
    // the most recent — final rows are filtered already, so just overwrite.
    agentRows.set(canonical.id, values);
  }

  if (baselineRows.length === 0 || agentRows.size === 0) return [];

  const sweeps: ModelSweep[] = [];
  for (const [canonicalId, agentVals] of agentRows.entries()) {
    const canonical = models.find((m) => m.id === canonicalId);
    if (!canonical) continue;

    let isSweep = true;
    const deltas: ModelSweep["metricDeltas"] = [];
    for (const metric of metrics) {
      const dir = directions[metric] ?? "higher";
      const agent = agentVals[metric];
      // Find the strongest baseline value on this metric (best by direction).
      let best: { value: number; name: string } | null = null;
      for (const b of baselineRows) {
        const v = b.values[metric];
        if (typeof v !== "number" || !Number.isFinite(v)) continue;
        if (
          best == null ||
          (dir === "lower" ? v < best.value : v > best.value)
        ) {
          best = { value: v, name: b.name };
        }
      }
      if (best == null) {
        // No baseline reported a value here — can't claim a sweep on a metric
        // that nobody competes on.
        isSweep = false;
        break;
      }
      const beats = strictlyBeats(
        typeof agent === "number" ? agent : null,
        best.value,
        dir
      );
      if (beats !== true) {
        isSweep = false;
        break;
      }
      deltas.push({
        metric,
        direction: dir,
        agent: agent as number,
        bestBaseline: best.value,
        bestBaselineName: best.name,
      });
    }
    if (isSweep && deltas.length > 0) {
      sweeps.push({
        modelId: canonicalId,
        modelName: canonical.name,
        modelColor: canonical.color,
        metricDeltas: deltas,
      });
    }
  }
  return sweeps;
}
