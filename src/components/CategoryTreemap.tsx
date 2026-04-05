"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ResponsiveTreeMap } from "@nivo/treemap";

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

export default function CategoryTreemap({ data }: Props) {
  const router = useRouter();

  const handleClick = useCallback(
    (node: any) => {
      const id = node.data?.catId || node.data?.id;
      if (id) router.push(`/categories/${id}`);
    },
    [router]
  );

  // Nivo treemap expects a hierarchical root node
  const treeData = {
    id: "root",
    children: data.map((d, i) => ({
      id: d.name,
      catId: d.id,
      value: d.count,
      color: COLORS[i % COLORS.length],
    })),
  };

  return (
    <div style={{ height: 420 }}>
      <ResponsiveTreeMap
        data={treeData}
        identity="id"
        value="value"
        leavesOnly
        innerPadding={4}
        outerPadding={2}
        colors={(node: any) => node.data.color || "#999"}
        borderWidth={0}
        /* borderRadius not supported in this nivo version */
        label={(node: any) => `${node.id}`}
        labelSkipSize={40}
        labelTextColor="#fff"
        parentLabelTextColor="#fff"
        nodeOpacity={0.85}
        animate={false}
        onClick={handleClick}
        tooltip={({ node }: any) => (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 13,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <strong>{node.id}</strong>
            <div style={{ color: "#666", marginTop: 2 }}>
              {node.value} tasks
            </div>
          </div>
        )}
        theme={{
          labels: {
            text: {
              fontSize: 12,
              fontWeight: 400,
            },
          },
        }}
      />
    </div>
  );
}
