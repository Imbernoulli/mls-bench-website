"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import type { LiteModelScore } from "@/lib/paper-results";

interface Props {
  data: LiteModelScore[];
  compact?: boolean;
}

export default function LiteIntelligenceChart({ data, compact = false }: Props) {
  if (data.length === 0) return null;

  const chartHeight = compact ? 220 : 360;
  const chartMinWidth = compact ? 720 : 980;
  const xAngle = compact ? -28 : -24;
  const xHeight = compact ? 56 : 74;
  const xFontSize = compact ? 10 : 11;
  const labelFontClass = compact ? "fill-muted-foreground text-[9px]" : "fill-muted-foreground text-[10px]";
  const margin = compact
    ? { top: 16, right: 28, bottom: 50, left: 28 }
    : { top: 20, right: 32, bottom: 70, left: 24 };

  return (
    <div className={compact ? "p-3" : "p-4"}>
      <div className={`text-center ${compact ? "mb-2" : "mb-4"}`}>
        <h3 className={compact ? "text-sm font-semibold" : "text-base font-semibold"}>
          MLS-Bench-Lite Intelligence
        </h3>
        <p className={`mt-1 ${compact ? "text-[11px]" : "text-xs"} text-muted-foreground`}>
          Average normalized score on the 30-task Lite subset.
        </p>
      </div>
      <div className="overflow-x-auto">
        <div style={{ height: chartHeight, minWidth: chartMinWidth }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={margin}>
            <XAxis
              dataKey="name"
              interval={0}
              angle={xAngle}
              textAnchor="end"
              height={xHeight}
              tick={{ fontSize: xFontSize }}
            />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="score"
                  position="top"
                  formatter={(value) =>
                    typeof value === "number" ? `${value.toFixed(1)}%` : ""
                  }
                  className={labelFontClass}
                />
                {data.map((model) => (
                  <Cell key={model.id} fill={model.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
