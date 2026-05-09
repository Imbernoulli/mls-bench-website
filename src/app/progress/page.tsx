import {
  getCategoriesStatic,
  getLeaderboardStatic,
  getModelsStatic,
  getTasksStatic,
} from "@/lib/data";
import ProgressTable, {
  type ProgressStatus,
  type ProgressTask,
} from "@/components/ProgressTable";

function aggregateRows(rows: Record<string, string | number | boolean | null>[]) {
  const finalRows = rows.filter((r) => r.model != null && r.is_final === true);
  const meanModels = new Set(
    finalRows.filter((r) => r.seed === "mean").map((r) => r.model as string)
  );
  return finalRows.filter(
    (r) => r.seed === "mean" || !meanModels.has(r.model as string)
  );
}

export default function ProgressPage() {
  const tasks = getTasksStatic().filter((task) => task.category !== "demo");
  const categories = getCategoriesStatic();
  const models = getModelsStatic();

  const progressTasks: ProgressTask[] = tasks.map((task) => {
    const leaderboard = getLeaderboardStatic(task.id);
    const rows = leaderboard ? aggregateRows(leaderboard.rows) : [];
    const statuses: Record<string, ProgressStatus> = {};
    const firstScores: Record<string, number | null> = {};
    const finalScores: Record<string, number | null> = {};
    const primaryMetric = leaderboard?.metric_columns[0] ?? null;
    const direction = primaryMetric
      ? leaderboard?.metric_directions?.[primaryMetric] ?? "higher"
      : "higher";

    for (const model of models) {
      const agentRow = rows.find((row) => row.model === model.id);
      const firstRow = rows.find((row) => row.model === `vanilla:${model.id}`);
      const hasAgent = agentRow != null;
      const hasFirst = firstRow != null;
      statuses[model.id] = hasAgent ? "final" : hasFirst ? "first" : "missing";
      firstScores[model.id] =
        primaryMetric && typeof firstRow?.[primaryMetric] === "number"
          ? (firstRow[primaryMetric] as number)
          : null;
      finalScores[model.id] =
        primaryMetric && typeof agentRow?.[primaryMetric] === "number"
          ? (agentRow[primaryMetric] as number)
          : null;
    }

    return {
      id: task.id,
      name: task.name,
      summary: task.summary,
      category: task.category,
      categoryLabel: task.category_label,
      statuses,
      firstScores,
      finalScores,
      metric: primaryMetric,
      direction,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Run Progress</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">
        Task-by-model coverage for the five standard agents. Final means a
        submitted agent result has a final leaderboard row. First is the
        agent&apos;s first tested proposal. Completed cells show primary-metric
        values for both first and final runs.
      </p>

      <div className="mt-8">
        <ProgressTable
          tasks={progressTasks}
          models={models}
          categories={categories}
        />
      </div>
    </div>
  );
}
