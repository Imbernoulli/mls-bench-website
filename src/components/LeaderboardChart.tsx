"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { LeaderboardChartDatum } from "@/lib/leaderboard";

type Layout = "columns" | "rows";

interface Props {
  data: LeaderboardChartDatum[];
  compact?: boolean;
  /** Draws a dashed reference line at this score with a "Human SOTA" label. */
  humanSota?: number;
  /** Optional title rendered at the card's top left, next to the layout toggle. */
  title?: string;
}

interface TickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
  index?: number;
  byKey: Map<string, LeaderboardChartDatum>;
  compact: boolean;
}

/**
 * Tokenize a model name for rendering. Everything after the leading family
 * word (Claude/GPT/Kimi/GLM-/DeepSeek/...) is the distinguishing part —
 * tier word, version numbers, and qualifiers like Pro/Code — and gets
 * bolded; spaces and hyphen boundaries are preserved.
 *
 * The letter→digit boundary matters for names that glue the version straight
 * onto the family word: without it "Qwen3.8-Max" splits as "Qwen3.8-" + "Max"
 * and the version is left unbolded along with the family word.
 */
function modelNameSegments(name: string): { text: string; bold: boolean }[] {
  return name
    .split(/(\s+|(?<=-)|(?<=[A-Za-z])(?=\d))/)
    .filter((text) => text !== "")
    .map((text, i) => ({
      text,
      bold: i > 0 && !/^\s+$/.test(text),
    }));
}

/** Columns layout: vendor logo + effort pill on the axis line, model name
    angled below on a shared baseline. */
function ColumnTick({ x = 0, y = 0, payload, index = 0, byKey, compact }: TickProps) {
  const d = payload ? byKey.get(payload.value) : undefined;
  if (!d) return <g />;

  const logoSize = compact ? 13 : 15;
  const logoY = y + 4;
  const hasEffort = d.effort !== "";
  const pillH = compact ? 11 : 12;
  const pillFont = compact ? 7 : 7.5;
  const pillW = d.effort.length * (pillFont * 0.72) + 10;
  const pillY = logoY + logoSize + 4;
  // Reserve the pill row even without a recorded effort so every model name
  // starts on the same baseline and angled labels can't collide.
  const nameY = pillY + pillH + (compact ? 8 : 9);
  const nameSize = compact ? 9.5 : 10.5;
  const isMax = d.effort === "max";
  // The first label's angled tail would overflow the svg's left edge;
  // nudge just that one right instead of padding the whole axis.
  const nameX = x + (index === 0 ? (compact ? 18 : 24) : 0);

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
            fill={isMax ? "#e9e9ee" : "var(--color-muted)"}
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
            fill="var(--color-foreground)"
          >
            {d.effort.toUpperCase()}
          </text>
        </g>
      )}
      <text
        x={nameX}
        y={nameY}
        textAnchor="end"
        transform={`rotate(-26 ${nameX} ${nameY})`}
        fontSize={nameSize}
        fill="var(--color-muted-foreground)"
      >
        {modelNameSegments(d.name).map((seg, i) =>
          seg.bold ? (
            <tspan key={i} fontWeight={600} fill="var(--color-foreground)">
              {seg.text}
            </tspan>
          ) : (
            <tspan key={i}>{seg.text}</tspan>
          )
        )}
      </text>
    </g>
  );
}

/** Rows layout: model name right-aligned, vendor logo immediately right of
    the name (fixed column next to the bars), effort pill under the name. */
function RowTick({
  x = 0,
  y = 0,
  payload,
  byKey,
  compact,
}: TickProps) {
  const d = payload ? byKey.get(payload.value) : undefined;
  if (!d) return <g />;

  const logoSize = compact ? 13 : 15;
  const logoX = x - logoSize - 2;
  const nameSize = compact ? 10 : 11;
  const pillH = compact ? 10 : 11;
  const pillFont = compact ? 6.8 : 7.2;
  const pillW = d.effort.length * (pillFont * 0.72) + 9;
  const hasEffort = d.effort !== "";
  const isMax = d.effort === "max";
  const rightEdge = logoX - 4; // name and pill align their right edge here

  return (
    <g>
      <text
        x={rightEdge}
        y={hasEffort ? y - 2 : y}
        textAnchor="end"
        dominantBaseline={hasEffort ? "auto" : "central"}
        fontSize={nameSize}
        fill="var(--color-muted-foreground)"
      >
        {modelNameSegments(d.name).map((seg, i) =>
          seg.bold ? (
            <tspan key={i} fontWeight={600} fill="var(--color-foreground)">
              {seg.text}
            </tspan>
          ) : (
            <tspan key={i}>{seg.text}</tspan>
          )
        )}
      </text>
      {d.logo ? (
        <image
          href={d.logo}
          x={logoX}
          y={y - logoSize / 2}
          width={logoSize}
          height={logoSize}
        />
      ) : (
        <circle
          cx={logoX + logoSize / 2}
          cy={y}
          r={logoSize / 3}
          fill={d.color}
        />
      )}
      {hasEffort && (
        <g>
          <rect
            x={rightEdge - pillW}
            y={y + 3}
            width={pillW}
            height={pillH}
            rx={3}
            fill={isMax ? "#e9e9ee" : "var(--color-muted)"}
            stroke={isMax ? "none" : "var(--color-border)"}
          />
          <text
            x={rightEdge - pillW / 2}
            y={y + 3 + pillH / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={pillFont}
            fontWeight={600}
            letterSpacing={0.4}
            fill="var(--color-foreground)"
          >
            {d.effort.toUpperCase()}
          </text>
        </g>
      )}
    </g>
  );
}

export default function LeaderboardChart({ data, compact = false, humanSota, title }: Props) {
  const [layout, setLayout] = useState<Layout>("columns");
  const byKey = useMemo(() => new Map(data.map((d) => [d.key, d])), [data]);

  if (data.length === 0) return null;

  // Fixed chart width keeps the HTML SOTA overlays in exact sync with the
  // recharts geometry. Must stay below the card's inner width (~790px) or
  // the overflow-x-auto container clips the right edge.
  const chartWidth = compact ? 700 : 760;

  // Shared by the hidden axis domain and the HTML "Human SOTA" overlays.
  const yDomainMax = (dataMax: number) => Math.ceil(dataMax * 1.15);
  const domainMax = yDomainMax(Math.max(...data.map((d) => d.score)));

  // ---- columns (vertical bars) geometry ----
  const colChartHeight = compact ? 210 : 250;
  const colXAxisHeight = compact ? 88 : 96;
  const colMargin = compact
    ? { top: 14, right: 8, bottom: 4, left: 8 }
    : { top: 16, right: 10, bottom: 4, left: 10 };
  const colPlotHeight =
    colChartHeight - colMargin.top - colMargin.bottom - colXAxisHeight;

  // ---- rows (horizontal bars) geometry ----
  const rowSlot = compact ? 26 : 30;
  const rowGutterWidth = compact ? 132 : 150;
  const rowMargin = compact
    ? { top: 6, right: 34, bottom: 22, left: 6 }
    : { top: 8, right: 38, bottom: 24, left: 6 };
  const rowChartHeight =
    rowMargin.top + data.length * rowSlot + rowMargin.bottom;
  const rowPlotWidth =
    chartWidth - rowMargin.left - rowGutterWidth - rowMargin.right;

  const chartHeight = layout === "columns" ? colChartHeight : rowChartHeight;
  const sotaFraction = humanSota !== undefined ? humanSota / domainMax : 0;
  // columns: horizontal line at this y; rows: vertical line at this x.
  const sotaY =
    colMargin.top + colPlotHeight * (1 - sotaFraction);
  const sotaX = rowMargin.left + rowGutterWidth + rowPlotWidth * sotaFraction;

  return (
    <div className="mx-auto" style={{ width: chartWidth, maxWidth: "100%" }}>
      <div className={`mb-1 flex items-center ${title ? "justify-between" : "justify-end"}`}>
        {title && (
          <span
            className="text-base font-semibold text-foreground sm:text-lg"
            style={{ marginLeft: compact ? 34 : 36 }}
          >
            {title}
          </span>
        )}
        <div
          role="group"
          aria-label="Chart layout"
          className="inline-flex rounded-lg border border-border p-0.5"
        >
          {(["columns", "rows"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLayout(l)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                layout === l
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l === "columns" ? "Columns" : "Rows"}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <div
          className="relative"
          style={{ height: chartHeight, width: chartWidth, minWidth: chartWidth }}
        >
          {humanSota !== undefined && layout === "columns" && (
            <div
              aria-hidden="true"
              className="absolute z-0"
              style={{
                top: sotaY,
                left: colMargin.left,
                right: colMargin.right,
                borderTop: "1px dashed #b6b6c2",
              }}
            />
          )}
          {humanSota !== undefined && layout === "columns" && (
            <span
              className="pointer-events-none absolute z-[2] text-muted-foreground"
              style={{
                top: sotaY - (compact ? 13 : 14),
                right: colMargin.right + 2,
                fontSize: compact ? 9 : 10,
              }}
            >
              Human SOTA
            </span>
          )}
          {humanSota !== undefined && layout === "rows" && (
            <div
              aria-hidden="true"
              className="absolute z-0"
              style={{
                left: sotaX,
                top: rowMargin.top,
                height: rowChartHeight - rowMargin.top - rowMargin.bottom,
                borderLeft: "1px dashed #b6b6c2",
              }}
            />
          )}
          {humanSota !== undefined && layout === "rows" && (
            <span
              className="pointer-events-none absolute z-[2] text-muted-foreground"
              style={{
                left: sotaX + 4,
                top: rowChartHeight - rowMargin.bottom - (compact ? 12 : 13),
                fontSize: compact ? 9 : 10,
              }}
            >
              Human SOTA
            </span>
          )}
          <div className="relative z-[1] h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              {layout === "columns" ? (
                <BarChart data={data} margin={colMargin} barCategoryGap="16%">
                  <defs>
                    {data.map((d, i) =>
                      d.gradient ? (
                        <linearGradient
                          key={d.key}
                          id={`lg-${i}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor={d.gradient[0]} />
                          <stop offset="100%" stopColor={d.gradient[1]} />
                        </linearGradient>
                      ) : null
                    )}
                  </defs>
                  <YAxis hide domain={[0, yDomainMax]} />
                  <XAxis
                    dataKey="key"
                    interval={0}
                    height={colXAxisHeight}
                    tickLine={false}
                    padding={{ left: 26, right: 14 }}
                    axisLine={{ stroke: "var(--color-border)" }}
                    tick={<ColumnTick byKey={byKey} compact={compact} />}
                  />
                  <Bar
                    dataKey="score"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={compact ? 40 : 48}
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
                    {data.map((d, i) => (
                      <Cell
                        key={d.key}
                        fill={d.gradient ? `url(#lg-${i})` : d.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={rowMargin}
                  barCategoryGap="24%"
                >
                  <defs>
                    {data.map((d, i) =>
                      d.gradient ? (
                        <linearGradient
                          key={d.key}
                          id={`lg-${i}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor={d.gradient[1]} />
                          <stop offset="100%" stopColor={d.gradient[0]} />
                        </linearGradient>
                      ) : null
                    )}
                  </defs>
                  <XAxis type="number" hide domain={[0, yDomainMax]} />
                  <YAxis
                    type="category"
                    dataKey="key"
                    interval={0}
                    width={rowGutterWidth}
                    tickLine={false}
                    axisLine={{ stroke: "var(--color-border)" }}
                    tick={<RowTick byKey={byKey} compact={compact} />}
                  />
                  <Bar
                    dataKey="score"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={compact ? 16 : 18}
                    isAnimationActive={false}
                  >
                    <LabelList
                      dataKey="score"
                      position="right"
                      formatter={(value) =>
                        typeof value === "number" ? value.toFixed(1) : ""
                      }
                      className={
                        compact
                          ? "fill-foreground text-[9px] font-medium"
                          : "fill-foreground text-[10px] font-medium"
                      }
                    />
                    {data.map((d, i) => (
                      <Cell
                        key={d.key}
                        fill={d.gradient ? `url(#lg-${i})` : d.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
