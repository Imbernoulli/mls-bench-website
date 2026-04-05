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

interface SubCat {
  name: string;
  count: number;
}

interface CatItem {
  name: string;
  count: number;
  id: string;
  subcategories: SubCat[];
}

interface Props {
  data: CatItem[];
}

export default function CategoryTreemap({ data }: Props) {
  const router = useRouter();

  const handleClick = useCallback(
    (node: any) => {
      // Navigate to category page when clicking any node
      const catId = node.data?.catId || node.data?.parentCatId;
      if (catId) router.push(`/categories/${catId}`);
    },
    [router]
  );

  // Build color map: category id → color
  const colorMap: Record<string, string> = {};
  data.forEach((d, i) => {
    colorMap[d.id] = COLORS[i % COLORS.length];
  });

  // Build hierarchical tree for nivo
  const treeData = {
    id: "MLS-Bench",
    children: data.map((cat) => ({
      id: cat.name,
      catId: cat.id,
      color: colorMap[cat.id],
      children: cat.subcategories.map((sub) => ({
        id: sub.name,
        parentCatId: cat.id,
        value: sub.count,
      })),
    })),
  };

  return (
    <div style={{ height: 460 }}>
      <ResponsiveTreeMap
        data={treeData}
        identity="id"
        value="value"
        tile="squarify"
        leavesOnly={false}
        innerPadding={3}
        outerPadding={3}
        parentLabelPosition="top"
        parentLabelPadding={14}
        parentLabelSize={20}
        parentLabelTextColor="#fff"
        colors={(node: any) => {
          // Use parent's color for leaves, own color for parents
          const c = node.data?.color || colorMap[node.data?.parentCatId] || "#999";
          return c;
        }}
        nodeOpacity={0.88}
        borderWidth={2}
        borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
        label={(node: any) => node.id}
        labelSkipSize={28}
        labelTextColor="#fff"
        animate={false}
        onClick={handleClick}
        tooltip={({ node }: any) => {
          const isLeaf = !node.data?.children;
          const parentName = node.parent?.id;
          return (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 13,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {isLeaf && parentName && parentName !== "MLS-Bench" && (
                <div style={{ color: "#999", fontSize: 11, marginBottom: 2 }}>
                  {parentName}
                </div>
              )}
              <strong>{node.id}</strong>
              <div style={{ color: "#666", marginTop: 2 }}>
                {node.value} task{node.value !== 1 ? "s" : ""}
              </div>
            </div>
          );
        }}
        theme={{
          labels: {
            text: { fontSize: 11, fontWeight: 400 },
          },
        }}
      />
    </div>
  );
}
