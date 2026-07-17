import Leaderboard from "@/components/Leaderboard";
import LeaderboardChart from "@/components/LeaderboardChart";
import { getLeaderboardChartData, HUMAN_SOTA_LITE } from "@/lib/leaderboard";

export default function LeaderboardPage() {
  const chartData = getLeaderboardChartData();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Leaderboard</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">
        MLS-Bench-Lite Score. The evaluation is based on Harbor with a 5-hour
        exploration budget for each agent.
      </p>
      <div className="mt-8 rounded-xl border border-border bg-card px-4 py-6 sm:px-6">
        <LeaderboardChart data={chartData} humanSota={HUMAN_SOTA_LITE} />
      </div>
      <div className="mt-8">
        <Leaderboard />
      </div>
    </div>
  );
}
