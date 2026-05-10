import Link from "next/link";
import {
  getTasksStatic,
  getModelsStatic,
  getLeaderboardStatic,
} from "@/lib/data";
import { computeSweeps, type ModelSweep } from "@/lib/sweep";
import { categoryStyle, metricLabel } from "@/lib/display";

interface SweptTask {
  id: string;
  name: string;
  category: string;
  category_label: string;
  summary: string;
  sweeps: ModelSweep[];
}

function formatVal(v: number): string {
  if (Math.abs(v) >= 100) return v.toFixed(1);
  if (Math.abs(v) >= 10) return v.toFixed(2);
  return v.toFixed(3);
}

/** Relative-improvement string: returns e.g. "+5.2% rel." or "−12.4% rel.".
 *  Direction-aware: for "lower" metrics, improvement = (best − agent) / |best|. */
function relImprove(d: ModelSweep["metricDeltas"][number]): string {
  const denom = Math.abs(d.bestBaseline);
  if (denom < 1e-12) return "—";
  const rel =
    d.direction === "lower"
      ? (d.bestBaseline - d.agent) / denom
      : (d.agent - d.bestBaseline) / denom;
  const pct = rel * 100;
  const sign = pct >= 0 ? "+" : "−";
  return `${sign}${Math.abs(pct).toFixed(1)}% rel.`;
}

export default function HighlightsPage() {
  const tasks = getTasksStatic().filter((t) => t.category !== "demo");
  const models = getModelsStatic();

  const swept: SweptTask[] = [];
  for (const t of tasks) {
    const lb = getLeaderboardStatic(t.id);
    if (!lb) continue;
    const sweeps = computeSweeps(lb, models);
    if (sweeps.length === 0) continue;
    swept.push({
      id: t.id,
      name: t.name,
      category: t.category,
      category_label: t.category_label,
      summary: t.summary,
      sweeps,
    });
  }

  // Group by category for the summary section
  const byCategory = new Map<string, SweptTask[]>();
  for (const s of swept) {
    const arr = byCategory.get(s.category) ?? [];
    arr.push(s);
    byCategory.set(s.category, arr);
  }
  const categoriesOrdered = Array.from(byCategory.entries()).sort(
    (a, b) => b[1].length - a[1].length,
  );

  const totalSweepPairs = swept.reduce((acc, s) => acc + s.sweeps.length, 0);
  const totalTasksRendered = tasks.length;
  const sweepRate = totalTasksRendered > 0
    ? ((swept.length / totalTasksRendered) * 100).toFixed(1)
    : "0.0";

  // Per-model sweep counts
  const perModel = new Map<string, { name: string; color: string; count: number }>();
  for (const s of swept) {
    for (const sw of s.sweeps) {
      const e = perModel.get(sw.modelId) ?? {
        name: sw.modelName,
        color: sw.modelColor,
        count: 0,
      };
      e.count += 1;
      perModel.set(sw.modelId, e);
    }
  }
  const perModelOrdered = Array.from(perModel.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Highlights</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        Tasks where at least one agent's <em>final submission strictly beats every
        baseline on every reported metric</em>. The threshold is intentionally
        strict: a single tied or losing metric disqualifies the agent. Counts
        below sum over (task × model) pairs.
      </p>

      {/* Top stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Tasks with a sweep</div>
          <div className="mt-1 text-2xl font-semibold">
            {swept.length} <span className="text-base font-normal text-muted-foreground">/ {totalTasksRendered}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{sweepRate}% of tasks</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">(task × agent) sweeps</div>
          <div className="mt-1 text-2xl font-semibold">{totalSweepPairs}</div>
          <div className="mt-1 text-xs text-muted-foreground">distinct cases</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Per-agent leaders</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {perModelOrdered.map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs"
                title={`${m.name} swept ${m.count} task${m.count === 1 ? "" : "s"}`}
              >
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: m.color }}
                />
                <span className="font-medium">{m.name}</span>
                <span className="text-muted-foreground">· {m.count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* By-category summary */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">By category</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {categoriesOrdered.map(([cat, items]) => {
            const style = categoryStyle(cat);
            const label = items[0]?.category_label ?? cat;
            return (
              <span
                key={cat}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: style.bg,
                  borderColor: style.border,
                  color: style.text,
                }}
              >
                {label} <span className="opacity-70">· {items.length}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Per-task list */}
      <div className="mt-8 space-y-4">
        {swept
          .slice()
          .sort((a, b) => b.sweeps.length - a.sweeps.length || a.name.localeCompare(b.name))
          .map((task) => {
            const style = categoryStyle(task.category);
            return (
              <div key={task.id} className="rounded-lg border border-border bg-card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="text-lg font-semibold hover:text-primary hover:underline"
                  >
                    {task.name}
                  </Link>
                  <span
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: style.bg,
                      borderColor: style.border,
                      color: style.text,
                    }}
                  >
                    {task.category_label}
                  </span>
                </div>
                <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                  {task.summary}
                </p>

                <div className="mt-4 space-y-3">
                  {task.sweeps.map((s) => (
                    <div
                      key={s.modelId}
                      className="rounded-md border border-amber-200 bg-amber-50/40 p-3"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          aria-hidden
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: s.modelColor }}
                        />
                        <span className="font-medium">{s.modelName}</span>
                        <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                          🏆 sweeps {s.metricDeltas.length} metric
                          {s.metricDeltas.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                        {s.metricDeltas.map((d) => (
                          <div
                            key={d.metric}
                            className="flex items-baseline gap-2 rounded border border-border bg-white/60 px-2 py-1"
                          >
                            <span className="font-medium">
                              {metricLabel(d.metric)}
                            </span>
                            <span className="text-muted-foreground">
                              {d.direction === "lower" ? "↓" : "↑"}
                            </span>
                            <span className="ml-auto font-mono">
                              <span className="text-amber-800">
                                {formatVal(d.agent)}
                              </span>
                              <span className="mx-1 text-muted-foreground">vs</span>
                              <span className="text-muted-foreground">
                                {formatVal(d.bestBaseline)}
                              </span>
                              <span className="ml-1 text-[10px] text-muted-foreground">
                                ({d.bestBaselineName})
                              </span>
                            </span>
                            <span className="ml-2 text-[11px] font-medium text-emerald-700">
                              {relImprove(d)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        {swept.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No clean sweeps yet — every task currently has at least one baseline
            metric where no agent strictly wins.
          </p>
        )}
      </div>
    </div>
  );
}
