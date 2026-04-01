"use client";

import { useMemo, useState } from "react";
import type { LeaderboardData } from "@/lib/types";

interface Props {
  data: LeaderboardData;
}

export default function LeaderboardTable({ data }: Props) {
  const [showPerSeed, setShowPerSeed] = useState(false);

  const rows = useMemo(() => {
    const validRows = data.rows.filter((r) => r.model != null);
    if (showPerSeed) return validRows;
    const meanModels = new Set(
      validRows.filter((r) => r.seed === "mean").map((r) => r.model as string)
    );
    return validRows.filter(
      (r) => r.seed === "mean" || !meanModels.has(r.model as string)
    );
  }, [data.rows, showPerSeed]);

  const metricCols = data.metric_columns;

  // Find best value per metric column (among mean/aggregate rows)
  const bestValues = useMemo(() => {
    const bests: Record<string, number> = {};
    const aggregateRows = rows.filter(
      (r) => r.seed === "mean" || !data.rows.some((r2) => r2.model === r.model && r2.seed === "mean")
    );
    for (const col of metricCols) {
      const values = aggregateRows
        .map((r) => r[col])
        .filter((v): v is number => typeof v === "number");
      if (values.length > 0) {
        bests[col] = Math.max(...values);
      }
    }
    return bests;
  }, [rows, metricCols, data.rows]);

  const formatValue = (v: unknown): string => {
    if (v === null || v === undefined || v === "") return "-";
    if (typeof v === "number") return v.toFixed(3);
    return String(v);
  };

  const formatModel = (model: string): { name: string; isBaseline: boolean } => {
    if (model.startsWith("baseline:")) {
      return { name: model.replace("baseline:", ""), isBaseline: true };
    }
    return { name: model, isBaseline: false };
  };

  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm">No results yet.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showPerSeed}
            onChange={(e) => setShowPerSeed(e.target.checked)}
            className="rounded"
          />
          Show per-seed results
        </label>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium">Model</th>
              <th className="px-4 py-3 font-medium">Type</th>
              {showPerSeed && (
                <th className="px-4 py-3 font-medium">Seed</th>
              )}
              {metricCols.map((col) => (
                <th key={col} className="px-4 py-3 font-medium text-right">
                  {col.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const { name, isBaseline } = formatModel(row.model as string);
              const isMean = row.seed === "mean";
              return (
                <tr
                  key={i}
                  className={`border-t border-border ${
                    isMean ? "font-medium" : ""
                  } ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                >
                  <td className="px-4 py-2">{name}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        isBaseline
                          ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      }`}
                    >
                      {isBaseline ? "baseline" : "agent"}
                    </span>
                  </td>
                  {showPerSeed && (
                    <td className="px-4 py-2 text-muted-foreground">
                      {String(row.seed)}
                    </td>
                  )}
                  {metricCols.map((col) => {
                    const val = row[col];
                    const isBest =
                      typeof val === "number" &&
                      isMean &&
                      Math.abs(val - bestValues[col]) < 0.0001;
                    return (
                      <td
                        key={col}
                        className={`px-4 py-2 text-right tabular-nums ${
                          isBest ? "text-accent font-bold" : ""
                        }`}
                      >
                        {formatValue(val)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
