"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import ModelVendorMark from "@/components/ModelVendorMark";
import { HUMAN_SOTA_ID } from "@/lib/paper-results";

interface Series {
  id: string;
  name: string;
  color: string;
}

interface Props {
  data: Record<string, string | number>[];
  series: Series[];
}


/** Wrap a long category label by splitting on " & " or whitespace into
 *  at most 2 lines so axis labels stay horizontal and don't overlap. */
function wrapLabel(text: string, maxCharsPerLine = 14): string[] {
  if (text.length <= maxCharsPerLine) return [text];
  // Prefer splitting on " & " when present.
  if (text.includes(" & ")) {
    const [a, b] = text.split(" & ", 2);
    return [a, "& " + b];
  }
  const words = text.split(/\s+/);
  let current = "";
  const lines: string[] = [];
  for (const word of words) {
    if ((current + " " + word).trim().length > maxCharsPerLine) {
      lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
    if (lines.length === 1 && current && words.indexOf(word) === words.length - 1) {
      // Last word — keep on the second line even if over.
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HorizontalCategoryTick(props: any) {
  const { x, y, payload } = props;
  const lines = wrapLabel(String(payload.value));
  return (
    <g transform={`translate(${x}, ${y + 6})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={i * 12}
          textAnchor="middle"
          fill="currentColor"
          className="fill-foreground/70"
          style={{ fontSize: 11 }}
        >
          {line}
        </text>
      ))}
    </g>
  );
}


/** Draws Recharts' default agent rect plus a thin "vanilla" horizontal
 *  tick at the y-position the same model's vanilla score would land at,
 *  so Category Averages shows both Vanilla and Agent without doubling
 *  the bar count per category. */
function ModelBarWithVanillaTick(modelId: string, color: string) {
  // Recharts passes any number of props to a Bar shape; type as `any` here
  // since the public ActiveShape signature isn't exported in a useful form.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function Shape(props: any) {
    const { x, y, width, height, value, payload } = props;
    if (typeof value !== "number" || value <= 0) {
      return <g />;
    }
    const vanillaRaw = payload[`${modelId}__vanilla`];
    const vanilla = typeof vanillaRaw === "number" ? vanillaRaw : null;
    const baseY = y + height; // bottom of bar (in svg coords)
    const pxPerUnit = height / value;

    // Lighter Agent fill (the user wants Agent to be the lighter shade).
    const agentRect = (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={2}
        ry={2}
        fill={color}
        fillOpacity={0.32}
      />
    );
    if (vanilla == null) return <g>{agentRect}</g>;

    const vanillaPx = vanilla * pxPerUnit;
    const vTop = baseY - vanillaPx;
    // Darker Vanilla rect rendered behind the lighter Agent overlay so
    // the bottom-min portion reads as the darker baseline both bars share.
    // Color contrast carries the boundary; no separate cap line — the user
    // found that horizontal divider visually jarring.
    const vanillaRect = (
      <rect
        x={x}
        y={vTop}
        width={width}
        height={vanillaPx}
        rx={2}
        ry={2}
        fill={color}
        fillOpacity={0.85}
      />
    );

    return (
      <g>
        {vanillaRect}
        {agentRect}
      </g>
    );
  };
}

export default function CategoryPerformanceCharts({ data, series }: Props) {
  if (data.length === 0 || series.length === 0) return null;

  const isHumanSota = (id: string) => id === HUMAN_SOTA_ID;

  return (
    <div>
      <div className="p-4">
        <div className="mb-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {series.map((item) => (
            <span key={item.id} className="inline-flex items-center gap-1">
              <ModelVendorMark modelId={item.id} />
              {item.name}
            </span>
          ))}
        </div>
        {/* 12 categories in a single row was too cramped — split into two
            half-charts of 6 stacked vertically so each label gets full width. */}
        {(() => {
          const mid = Math.ceil(data.length / 2);
          const halves: Array<typeof data> = [data.slice(0, mid), data.slice(mid)];
          return (
            <div className="space-y-4">
              {halves.map((rowData, rowIdx) => (
                <div key={rowIdx} className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={rowData}
                      margin={{ top: 8, right: 16, bottom: 50, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.35} />
                      <XAxis
                        dataKey="categoryName"
                        interval={0}
                        height={48}
                        tickLine={false}
                        tick={HorizontalCategoryTick}
                      />
                      <YAxis
                        domain={[0, 0.5]}
                        ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => `${(Number(value) * 100).toFixed(0)}%`}
                        width={46}
                      />
                      {series.map((item) => {
                        const sota = isHumanSota(item.id);
                        return (
                          <Bar
                            key={item.id}
                            dataKey={item.id}
                            name={item.name}
                            fill={sota ? "#6e6e80" : item.color}
                            fillOpacity={sota ? 0.32 : 0.88}
                            radius={[3, 3, 0, 0]}
                            maxBarSize={20}
                            shape={
                              sota
                                ? undefined
                                : ModelBarWithVanillaTick(item.id, item.color)
                            }
                          />
                        );
                      })}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
