"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#10a37f", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#2563eb",
  "#14b8a6", "#e11d48", "#0ea5e9", "#a855f7", "#d946ef",
  "#22c55e", "#eab308", "#3b82f6", "#f43f5e", "#7c3aed",
  "#0891b2", "#65a30d", "#ea580c", "#4f46e5",
];

interface CatItem {
  name: string;
  count: number;
  id: string;
}

interface Props {
  data: CatItem[];
}

// Custom treemap cell with label
function CustomCell(props: any) {
  const {
    x, y, width, height, index, name, count, id,
    hoveredId, onHover, onLeave, onClick,
  } = props;

  if (width < 2 || height < 2) return null;

  const color = COLORS[index % COLORS.length];
  const isHovered = hoveredId === id;
  const showLabel = width > 50 && height > 30;
  const showCount = width > 60 && height > 45;

  return (
    <g
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onLeave()}
      onClick={() => onClick(id)}
      style={{ cursor: "pointer" }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        opacity={isHovered ? 1 : 0.85}
        stroke="#fff"
        strokeWidth={2}
        rx={4}
        ry={4}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 + (showCount ? -7 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontSize={Math.min(14, Math.max(10, width / 10))}
          fontWeight={600}
          style={{ pointerEvents: "none" }}
        >
          {name}
        </text>
      )}
      {showCount && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(255,255,255,0.8)"
          fontSize={Math.min(12, Math.max(9, width / 12))}
          style={{ pointerEvents: "none" }}
        >
          {count} tasks
        </text>
      )}
    </g>
  );
}

export default function CategoryTreemap({ data }: Props) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleClick = useCallback(
    (id: string) => router.push(`/categories/${id}`),
    [router]
  );

  // Recharts Treemap expects data with a `children` field or flat with dataKey
  const treeData = data.map((d, i) => ({
    name: d.name,
    size: d.count,
    count: d.count,
    id: d.id,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={420}>
      <Treemap
        data={treeData}
        dataKey="size"
        aspectRatio={4 / 3}
        stroke="#fff"
        content={
          <CustomCell
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onLeave={() => setHoveredId(null)}
            onClick={handleClick}
          />
        }
      >
        <Tooltip
          content={({ payload }) => {
            if (!payload || !payload.length) return null;
            const d = payload[0].payload;
            return (
              <div className="rounded-md border border-border bg-background px-3 py-2 text-sm shadow-md">
                <div className="font-medium">{d.name}</div>
                <div className="text-muted-foreground">{d.count} tasks</div>
              </div>
            );
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
