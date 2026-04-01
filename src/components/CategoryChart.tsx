"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { name: string; count: number; id: string }[];
}

export default function CategoryChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fontSize: 13 }}
        />
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: "6px",
            fontSize: "13px",
          }}
        />
        <Bar dataKey="count" fill="#10a37f" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
