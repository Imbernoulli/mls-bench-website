"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PolarCategoryTick(props: any) {
  const { x, y, payload, cx, cy } = props;
  const lines = wrapLabel(String(payload.value), 16);
  // Decide text-anchor based on which side of the center the label is.
  const dx = x - cx;
  const dy = y - cy;
  const anchor = dx > 6 ? "start" : dx < -6 ? "end" : "middle";
  // Push the label slightly outward along the radial direction so it doesn't
  // sit on the polygon vertex.
  const norm = Math.hypot(dx, dy) || 1;
  const px = x + (dx / norm) * 4;
  const py = y + (dy / norm) * 4;
  return (
    <g transform={`translate(${px}, ${py})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={i * 12 + (lines.length === 1 ? 4 : 0)}
          textAnchor={anchor}
          fill="currentColor"
          className="fill-foreground/75"
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

  const maxValue = Math.max(
    ...data.flatMap((point) =>
      series.map((item) =>
        typeof point[item.id] === "number" ? Number(point[item.id]) : 0
      )
    )
  );
  const isHumanSota = (id: string) => id === HUMAN_SOTA_ID;

  return (
    <div>
      <div className="p-4">
        <div className="mb-4 flex flex-col items-center gap-3 text-center">
          <div>
            <h3 className="text-base font-semibold">Category Averages</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Each model's bar shows Vanilla as the darker lower portion and
              Agent as the lighter overlay. Human SOTA is the dashed reference.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            {series.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-1">
                <ModelVendorMark modelId={item.id} />
                {item.name}
              </span>
            ))}
          </div>
        </div>
        <div className="w-full">
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 16, bottom: 60, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.35} />
              <XAxis
                dataKey="categoryName"
                interval={0}
                height={56}
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
                      fill={item.color}
                      fillOpacity={sota ? 0.03 : 0.88}
                      stroke={sota ? item.color : undefined}
                      strokeDasharray={sota ? "6 4" : undefined}
                      strokeWidth={sota ? 1.6 : 0}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={16}
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
        </div>
      </div>

      <div className="mt-8 p-4">
        <div className="mb-2 flex flex-col items-center gap-3 text-center">
          <div>
            <h3 className="text-base font-semibold">Capability Profile</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Same category scores in radar form. The outer ring is the 50% mark.
              {maxValue > 0.5 ? " Values above 50% are clipped at the outer ring." : ""}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            {series.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-1">
                <ModelVendorMark modelId={item.id} />
                {item.name}
              </span>
            ))}
          </div>
        </div>
        {/* Square aspect: data fills the box, no room for empty ring outside 50%. */}
        <div className="mx-auto mt-2 aspect-square w-full max-w-[460px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={data}
              cx="50%"
              cy="50%"
              outerRadius="80%"
              margin={{ top: 18, right: 18, bottom: 18, left: 18 }}
            >
              <PolarGrid strokeOpacity={0.3} />
              <PolarAngleAxis dataKey="categoryName" tick={PolarCategoryTick} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 0.5]}
                ticks={[0.125, 0.25, 0.375, 0.5]}
                tickFormatter={(value: number) => `${(value * 100).toFixed(0)}%`}
                tick={{ fontSize: 10 }}
              />
              {series.map((item) => (
                <Radar
                  key={item.id}
                  name={item.name}
                  dataKey={item.id}
                  stroke={item.color}
                  fill={item.color}
                  fillOpacity={isHumanSota(item.id) ? 0.015 : 0.075}
                  strokeDasharray={isHumanSota(item.id) ? "6 4" : undefined}
                  strokeWidth={isHumanSota(item.id) ? 1.6 : 1.8}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
