import leaderboard from "../../public/data/leaderboard.json";
import { vendorForModel } from "./model-vendors";

export interface LeaderboardRow {
  model: string;
  company: string;
  modelOpen: boolean;
  harness: string;
  harnessOpen: boolean;
  performance: number;
}

export interface LeaderboardChartDatum {
  id: string;
  name: string;
  score: number;
  color: string;
}

/** All leaderboard rows, best first. */
export function getLeaderboardRows(): LeaderboardRow[] {
  return (leaderboard.rows as LeaderboardRow[])
    .slice()
    .sort((a, b) => b.performance - a.performance);
}

/**
 * One bar per model: the best score across its harness/effort variants
 * (e.g. GPT 5.6 Sol appears once even though both max and xhigh runs
 * are listed in the table).
 */
export function getLeaderboardChartData(): LeaderboardChartDatum[] {
  const bestByModel = new Map<string, number>();
  for (const row of leaderboard.rows as LeaderboardRow[]) {
    const best = bestByModel.get(row.model);
    if (best === undefined || row.performance > best) {
      bestByModel.set(row.model, row.performance);
    }
  }
  return [...bestByModel.entries()]
    .map(([model, score]) => ({
      id: model,
      name: model,
      score,
      color: vendorForModel(model).color,
    }))
    .sort((a, b) => b.score - a.score);
}
