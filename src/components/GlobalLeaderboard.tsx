"use client";

interface ModelData {
  model: string;
  tasksWithResults: number;
  wins: number;
  winRate: number;
  categoryScores: Record<string, { wins: number; total: number }>;
}

interface Props {
  data: ModelData[];
  categories: string[];
  categoryLabels: Record<string, string>;
}

function formatPercent(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

function getHeatColor(rate: number): string {
  if (rate >= 0.7) return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
  if (rate >= 0.4) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
  if (rate > 0) return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  return "text-muted-foreground";
}

export default function GlobalLeaderboard({
  data,
  categories,
  categoryLabels,
}: Props) {
  if (data.length === 0) {
    return (
      <p className="text-muted-foreground">
        No agent results available yet. Run agents on tasks to populate the
        leaderboard.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="px-4 py-3 font-medium">Model</th>
            <th className="px-4 py-3 font-medium text-center">Tasks</th>
            <th className="px-4 py-3 font-medium text-center">Wins</th>
            <th className="px-4 py-3 font-medium text-center">Win Rate</th>
            {categories.map((cat) => (
              <th
                key={cat}
                className="px-3 py-3 font-medium text-center text-xs"
                title={categoryLabels[cat] || cat}
              >
                {cat.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.model}
              className={`border-t border-border ${
                i % 2 === 0 ? "" : "bg-muted/10"
              }`}
            >
              <td className="px-4 py-3 font-medium">{row.model}</td>
              <td className="px-4 py-3 text-center tabular-nums">
                {row.tasksWithResults}
              </td>
              <td className="px-4 py-3 text-center tabular-nums">
                {row.wins}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${getHeatColor(
                    row.winRate
                  )}`}
                >
                  {formatPercent(row.winRate)}
                </span>
              </td>
              {categories.map((cat) => {
                const score = row.categoryScores[cat];
                if (!score || score.total === 0) {
                  return (
                    <td
                      key={cat}
                      className="px-3 py-3 text-center text-muted-foreground"
                    >
                      -
                    </td>
                  );
                }
                const rate = score.wins / score.total;
                return (
                  <td key={cat} className="px-3 py-3 text-center">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${getHeatColor(
                        rate
                      )}`}
                      title={`${score.wins}/${score.total}`}
                    >
                      {score.wins}/{score.total}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
