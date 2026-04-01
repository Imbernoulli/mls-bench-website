import {
  getTasksStatic,
  getCategoriesStatic,
  getLeaderboardStatic,
} from "@/lib/data";
import GlobalLeaderboard from "@/components/GlobalLeaderboard";
import RadarChartComponent from "@/components/RadarChart";

export default function LeaderboardPage() {
  const tasks = getTasksStatic().filter(
    (t) => t.category !== "demo"
  );
  const categories = getCategoriesStatic();

  // Collect all agent results across tasks
  const modelResults: Record<
    string,
    {
      totalTasks: number;
      tasksWithResults: number;
      winsVsBaseline: number;
      categoryScores: Record<string, { wins: number; total: number }>;
    }
  > = {};

  for (const task of tasks) {
    const lb = getLeaderboardStatic(task.id);
    if (!lb) continue;

    // Get mean rows only, filter out null models
    const validRows = lb.rows.filter((r) => r.model != null);
    const meanRows = validRows.filter((r) => r.seed === "mean" ||
      !validRows.some((r2) => r2.model === r.model && r2.seed === "mean"));

    const baselineRows = meanRows.filter((r) =>
      (r.model as string).startsWith("baseline:")
    );
    const agentRows = meanRows.filter(
      (r) => !(r.model as string).startsWith("baseline:")
    );

    if (baselineRows.length === 0 || lb.metric_columns.length === 0)
      continue;

    // For each agent, check if it beats the best baseline on the primary metric
    const primaryMetric = lb.metric_columns[0];
    const bestBaseline = Math.max(
      ...baselineRows
        .map((r) => r[primaryMetric])
        .filter((v): v is number => typeof v === "number")
    );

    for (const agentRow of agentRows) {
      const model = agentRow.model as string;
      if (!modelResults[model]) {
        modelResults[model] = {
          totalTasks: 0,
          tasksWithResults: 0,
          winsVsBaseline: 0,
          categoryScores: {},
        };
      }
      modelResults[model].tasksWithResults++;

      const agentScore = agentRow[primaryMetric];
      const wins =
        typeof agentScore === "number" && agentScore >= bestBaseline ? 1 : 0;
      modelResults[model].winsVsBaseline += wins;

      const cat = task.category;
      if (!modelResults[model].categoryScores[cat]) {
        modelResults[model].categoryScores[cat] = { wins: 0, total: 0 };
      }
      modelResults[model].categoryScores[cat].total++;
      modelResults[model].categoryScores[cat].wins += wins;
    }
  }

  // Build table data
  const tableData = Object.entries(modelResults)
    .map(([model, data]) => ({
      model,
      tasksWithResults: data.tasksWithResults,
      wins: data.winsVsBaseline,
      winRate:
        data.tasksWithResults > 0
          ? data.winsVsBaseline / data.tasksWithResults
          : 0,
      categoryScores: data.categoryScores,
    }))
    .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);

  // Get categories that have agent results
  const activeCats = new Set<string>();
  for (const d of tableData) {
    for (const cat of Object.keys(d.categoryScores)) {
      activeCats.add(cat);
    }
  }
  const sortedCats = [...activeCats].sort();

  // Build radar chart data
  const radarData = sortedCats
    .filter((cat) => (categories[cat]?.label ?? cat) !== "Demo")
    .map((cat) => {
      const point: Record<string, string | number> = {
        category: categories[cat]?.label ?? cat,
      };
      for (const row of tableData) {
        const score = row.categoryScores[cat];
        point[row.model] = score ? score.wins / score.total : 0;
      }
      return point;
    });

  const radarModels = tableData.map((d) => d.model);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Global Leaderboard</h1>
      <p className="mt-2 text-muted-foreground">
        Win rate: fraction of tasks where the agent matches or exceeds the best
        baseline on the primary metric.
      </p>

      {/* Radar chart */}
      {radarModels.length > 0 && (
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">
            Model Performance by Category
          </h2>
          <RadarChartComponent data={radarData} models={radarModels} />
        </div>
      )}

      <div className="mt-8">
        <GlobalLeaderboard
          data={tableData}
          categories={sortedCats}
          categoryLabels={Object.fromEntries(
            Object.values(categories).map((c) => [c.id, c.label])
          )}
        />
      </div>
    </div>
  );
}
