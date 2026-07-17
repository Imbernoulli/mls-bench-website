"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { LeaderboardChartDatum } from "@/lib/leaderboard";

interface Props {
  data: LeaderboardChartDatum[];
  compact?: boolean;
}

export default function LeaderboardChart({ data, compact = false }: Props) {
  if (data.length === 0) return null;

  const chartHeight = compact ? 240 : 340;
  const chartMinWidth = compact ? 640 : 760;
  const margin = compact
    ? { top: 20, right: 12, bottom: 8, left: 12 }
    : { top: 24, right: 16, bottom: 8, left: 16 };

  return (
    <div className="overflow-x-auto">
      <div style={{ height: chartHeight, minWidth: chartMinWidth }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={margin} barCategoryGap="28%">
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeDasharray="3 3"
            />
            <YAxis hide domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.12)]} />
            <XAxis
              dataKey="name"
              interval={0}
              angle={-24}
              textAnchor="end"
              height={compact ? 60 : 72}
              tickLine={false}
              padding={{ left: 28, right: 28 }}
              axisLine={{ stroke: "var(--color-border)" }}
              tick={{ fontSize: compact ? 10 : 11, fill: "var(--color-muted-foreground)" }}
            />
            <Bar dataKey="score" radius={[5, 5, 0, 0]} maxBarSize={compact ? 44 : 56} isAnimationActive={false}>
              <LabelList
                dataKey="score"
                position="top"
                formatter={(value) =>
                  typeof value === "number" ? value.toFixed(1) : ""
                }
                className={
                  compact
                    ? "fill-foreground text-[10px] font-medium"
                    : "fill-foreground text-[11px] font-medium"
                }
              />
              {data.map((model) => (
                <Cell key={model.id} fill={model.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
