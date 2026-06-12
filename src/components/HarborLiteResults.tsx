"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import harborLite from "../../public/data/lite_harbor_moonshot.json";

interface HarborModelScore {
  id: string;
  name: string;
  company: string;
  color: string;
  score: number;
  agent: string;
}

const DATA = harborLite.models as HarborModelScore[];

export default function HarborLiteResults() {
  if (DATA.length === 0) return null;

  return (
    <div className="p-3">
      <div className="mb-2 text-center">
        <h3 className="text-sm font-semibold">
          MLS-Bench-Lite via Harbor — reported by Moonshot
        </h3>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Score on the official 30-task Lite subset, run through the Harbor
          agent harness.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div style={{ height: 220, minWidth: 480 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={DATA}
              margin={{ top: 16, right: 28, bottom: 50, left: 28 }}
            >
              <XAxis
                dataKey="name"
                interval={0}
                angle={-28}
                textAnchor="end"
                height={56}
                tick={{ fontSize: 10 }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="score"
                  position="top"
                  formatter={(value) =>
                    typeof value === "number" ? `${value.toFixed(1)}%` : ""
                  }
                  className="fill-muted-foreground text-[9px]"
                />
                {DATA.map((model) => (
                  <Cell key={model.id} fill={model.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="mx-auto mt-2 max-w-2xl text-center text-[11px] leading-relaxed text-muted-foreground">
        Each model runs in its own coding agent: Claude Opus 4.8 via Claude
        Code (max effort), GPT-5.5 via Codex (xhigh effort), and the Kimi
        models via Kimi-Code — all with a 5-hour exploration budget.
        These numbers come from the Harbor + agent harness, not the native
        MLS-Bench harness used for our main paper results, so they are not
        directly comparable to the chart above. Source:{" "}
        <a
          href={harborLite.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground"
        >
          Moonshot · Kimi-K2.7-Code model card
        </a>
        .
      </p>
    </div>
  );
}
