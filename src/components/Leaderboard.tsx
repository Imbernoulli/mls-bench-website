import leaderboard from "../../public/data/leaderboard.json";
import { vendorForModel } from "@/lib/model-vendors";

interface Row {
  model: string;
  company: string;
  modelOpen: boolean;
  harness: string;
  harnessOpen: boolean;
  performance: number;
}

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

export default function Leaderboard() {
  const rows = (leaderboard.rows as Row[])
    .slice()
    .sort((a, b) => b.performance - a.performance);

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
              const vendor = vendorForModel(row.model);
              return (
                <tr
                  key={row.model}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: vendor.color }}
                      />
                      <span className="font-medium text-foreground">
                        {row.model}
                      </span>
                      <Tag open={row.modelOpen} />
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-muted-foreground">{row.harness}</span>
                      <Tag open={row.harnessOpen} />
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
        Results are from the{" "}
        <a
          href={leaderboard.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground"
        >
          {leaderboard.source.label}
        </a>
        . {leaderboard.verified} {leaderboard.harnessNote}
      </p>
    </div>
  );
}
