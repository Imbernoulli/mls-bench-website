"use client";

import { useMemo } from "react";
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

interface AxisTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
  byKey: Map<string, LeaderboardChartDatum>;
  compact: boolean;
}

/** Vendor logo on the axis line with an effort pill underneath, then the
    model name angled below — the Artificial Analysis layout. */
function AxisTick({ x = 0, y = 0, payload, byKey, compact }: AxisTickProps) {
  const d = payload ? byKey.get(payload.value) : undefined;
  if (!d) return <g />;

  const logoSize = compact ? 13 : 15;
  const logoY = y + 4;
  const hasEffort = d.effort !== "";
  const pillH = compact ? 11 : 12;
  const pillFont = compact ? 7 : 7.5;
  const pillW = d.effort.length * (pillFont * 0.72) + 10;
  const pillY = logoY + logoSize + 4;
  // Reserve the pill row even for runs without a recorded effort, so every
  // model name starts on the same baseline and angled labels can't collide.
  const nameY = pillY + pillH + (compact ? 8 : 9);
  const nameSize = compact ? 9.5 : 10.5;
  const isMax = d.effort === "max";

  return (
    <g>
      {d.logo ? (
        <image
          href={d.logo}
          x={x - logoSize / 2}
          y={logoY}
          width={logoSize}
          height={logoSize}
        />
      ) : (
        <circle
          cx={x}
          cy={logoY + logoSize / 2}
          r={logoSize / 3}
          fill={d.color}
        />
      )}
      {hasEffort && (
        <g>
          <rect
            x={x - pillW / 2}
            y={pillY}
            width={pillW}
            height={pillH}
            rx={3}
            fill={isMax ? "var(--color-foreground)" : "var(--color-muted)"}
            stroke={isMax ? "none" : "var(--color-border)"}
          />
          <text
            x={x}
            y={pillY + pillH / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={pillFont}
            fontWeight={600}
            letterSpacing={0.4}
            fill={isMax ? "#ffffff" : "var(--color-foreground)"}
          >
            {d.effort.toUpperCase()}
          </text>
        </g>
      )}
      <text
        x={x}
        y={nameY}
        textAnchor="end"
        transform={`rotate(-26 ${x} ${nameY})`}
        fontSize={nameSize}
        fill="var(--color-muted-foreground)"
      >
        {d.name}
      </text>
    </g>
  );
}

export default function LeaderboardChart({ data, compact = false }: Props) {
  const byKey = useMemo(() => new Map(data.map((d) => [d.key, d])), [data]);

  if (data.length === 0) return null;

  const chartHeight = compact ? 240 : 290;
  const chartMinWidth = compact ? 780 : 810;
  const margin = compact
    ? { top: 18, right: 8, bottom: 4, left: 8 }
    : { top: 20, right: 10, bottom: 4, left: 10 };

  return (
    <div className="overflow-x-auto">
      <div style={{ height: chartHeight, minWidth: chartMinWidth }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={margin} barCategoryGap="26%">
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeDasharray="3 3"
            />
            <YAxis hide domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15)]} />
            <XAxis
              dataKey="key"
              interval={0}
              height={compact ? 88 : 96}
              tickLine={false}
              padding={{ left: 34, right: 34 }}
              axisLine={{ stroke: "var(--color-border)" }}
              tick={<AxisTick byKey={byKey} compact={compact} />}
            />
            <Bar
              dataKey="score"
              radius={[4, 4, 0, 0]}
              maxBarSize={compact ? 32 : 38}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="score"
                position="top"
                formatter={(value) =>
                  typeof value === "number" ? value.toFixed(1) : ""
                }
                className={
                  compact
                    ? "fill-foreground text-[9px] font-medium"
                    : "fill-foreground text-[10px] font-medium"
                }
              />
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
