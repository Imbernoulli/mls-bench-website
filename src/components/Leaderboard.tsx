import leaderboard from "../../public/data/leaderboard.json";
import { getLeaderboardRows, parseHarness } from "@/lib/leaderboard";
import VendorLogo from "@/components/VendorLogo";

function Tag({ open }: { open: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
        open
          ? "border-[#10A37F]/30 bg-[#10A37F]/10 text-[#10A37F]"
          : "border-border bg-muted text-muted-foreground"
      }`}
    >
      {open ? "Open" : "Closed"}
    </span>
  );
}

function EffortBadge({ effort }: { effort: string }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide ${
        effort === "max"
          ? "bg-foreground text-background"
          : "border border-foreground/25 bg-muted text-foreground"
      }`}
    >
      {effort}
    </span>
  );
}

export default function Leaderboard() {
  const rows = getLeaderboardRows();

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Model</th>
              <th className="px-4 py-3 font-medium">Harness</th>
              <th className="px-4 py-3 text-right font-medium">Performance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const harness = parseHarness(row.harness);
              return (
                <tr
                  key={`${row.model}-${row.harness}`}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td
                    className={`px-4 py-3 tabular-nums ${
                      i < 3
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2.5">
                      <VendorLogo modelId={row.model} size={18} />
                      <span className="font-medium text-foreground">
                        {row.model}
                      </span>
                      <Tag open={row.modelOpen} />
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      {harness.name}
                      {harness.effort && <EffortBadge effort={harness.effort} />}
                      {harness.note && (
                        <span className="text-xs text-muted-foreground/70">
                          ({harness.note})
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-base font-semibold tabular-nums text-foreground">
                    {row.performance.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mx-auto mt-4 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
        {leaderboard.harnessNote}
      </p>
    </div>
  );
}
