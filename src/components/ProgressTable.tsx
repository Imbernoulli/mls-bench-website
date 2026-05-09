"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Category, StandardModel } from "@/lib/types";
import { categoryStyle } from "@/lib/display";

export type ProgressStatus = "final" | "first" | "missing";

export interface ProgressTask {
  id: string;
  name: string;
  summary: string;
  category: string;
  categoryLabel: string;
  statuses: Record<string, ProgressStatus>;
  firstScores: Record<string, number | null>;
  finalScores: Record<string, number | null>;
  metric: string | null;
  direction: "higher" | "lower";
}

interface Props {
  tasks: ProgressTask[];
  models: StandardModel[];
  categories: Record<string, Category>;
}

function formatScore(score: number | null) {
  if (score == null) return "-";
  if (Math.abs(score) >= 100) return score.toFixed(1);
  if (Math.abs(score) >= 10) return score.toFixed(2);
  return score.toFixed(3);
}

function statusClass(status: ProgressStatus) {
  if (status === "final") return "border-[#b9e5d6] bg-[#eaf7f2] text-[#0b684f]";
  if (status === "first") return "border-[#d8dce3] bg-[#f2f4f7] text-[#5d6470]";
  return "border-transparent text-muted-foreground";
}

export default function ProgressTable({ tasks, models, categories }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const categoryList = useMemo(
    () => Object.values(categories).filter((cat) => cat.id !== "demo"),
    [categories]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (category && task.category !== category) return false;
      if (!q) return true;
      return (
        task.id.toLowerCase().includes(q) ||
        task.name.toLowerCase().includes(q) ||
        task.summary.toLowerCase().includes(q) ||
        task.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [tasks, search, category]);

  const totals = useMemo(() => {
    return models.map((model) => {
      let final = 0;
      let firstOnly = 0;
      for (const task of tasks) {
        if (task.statuses[model.id] === "final") final++;
        if (task.statuses[model.id] === "first") firstOnly++;
      }
      return { model, final, firstOnly };
    });
  }, [tasks, models]);

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-5">
        {totals.map(({ model, final, firstOnly }) => (
          <div key={model.id} className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: model.color }}
              />
              {model.name}
            </div>
            <div className="mt-3 text-2xl font-semibold tabular-nums">
              {final}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              final runs, {firstOnly} first-only
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-64 flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categoryList.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 text-sm text-muted-foreground">
        {filtered.length} tasks shown
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="bg-muted/50 text-left">
              <th className="sticky left-0 z-10 bg-muted px-4 py-3 font-medium">
                Task
              </th>
              <th className="px-4 py-3 font-medium">Category</th>
              {models.map((model) => (
                <th key={model.id} className="px-4 py-3 text-center font-medium">
                  {model.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((task, index) => {
              const style = categoryStyle(task.category);
              return (
                <tr
                  key={task.id}
                  className={`border-t border-border ${
                    index % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  <td className="sticky left-0 z-10 bg-card px-4 py-3">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {task.name}
                    </Link>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {task.id}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: style.bg,
                        borderColor: style.border,
                        color: style.text,
                      }}
                    >
                      {task.categoryLabel}
                    </span>
                  </td>
                  {models.map((model) => {
                    const status = task.statuses[model.id] ?? "missing";
                    const firstScore = task.firstScores[model.id] ?? null;
                    const finalScore = task.finalScores[model.id] ?? null;
                    return (
                      <td
                        key={model.id}
                        className="px-4 py-3 text-center"
                        title={
                          task.metric
                            ? `${task.metric} (${task.direction === "lower" ? "lower" : "higher"} is better)`
                            : undefined
                        }
                      >
                        <span
                          className={`inline-flex min-w-28 items-center justify-center rounded-md border px-2 py-1 text-xs font-medium ${statusClass(
                            status
                          )}`}
                        >
                          <span className="tabular-nums">
                            {formatScore(firstScore)} / {formatScore(finalScore)}
                          </span>
                        </span>
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
