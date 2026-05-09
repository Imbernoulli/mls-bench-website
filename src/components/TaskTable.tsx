"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { TaskMeta, Category } from "@/lib/types";
import { categoryStyle } from "@/lib/display";

interface Props {
  tasks: TaskMeta[];
  categories: Record<string, Category>;
}

type SortColumn = "name" | "category" | "baselines" | "environments";

export default function TaskTable({ tasks, categories }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortColumn>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filteredTasks = useMemo(() => {
    let result = tasks.filter((t) => t.id !== "demo-task-1" && t.id !== "demo-task-2");

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.category_label.toLowerCase().includes(q) ||
          t.packages.some((p) => p.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      result = result.filter((t) => t.category === selectedCategory);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "category":
          cmp = a.category_label.localeCompare(b.category_label);
          break;
        case "baselines":
          cmp = a.baselines.length - b.baselines.length;
          break;
        case "environments":
          cmp = a.environments.length - b.environments.length;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [tasks, search, selectedCategory, sortBy, sortDir]);

  const sortedCategories = useMemo(() => {
    return Object.values(categories)
      .filter((c) => c.id !== "demo")
      .sort((a, b) => b.tasks.length - a.tasks.length);
  }, [categories]);

  const handleSort = (col: SortColumn) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const renderSortIcon = (col: SortColumn) => {
    if (sortBy !== col) return <span className="text-muted-foreground/30 ml-1">{"\u2195"}</span>;
    return <span className="ml-1">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>;
  };

  return (
    <div className="flex gap-6">
      {/* Category sidebar */}
      <div className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-20">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Categories</h3>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`block w-full text-left px-3 py-1.5 text-sm rounded-md mb-1 ${
              !selectedCategory
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({tasks.filter((t) => t.category !== "demo").length})
          </button>
          {sortedCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(cat.id === selectedCategory ? null : cat.id)
              }
              className={`block w-full text-left px-3 py-1.5 text-sm rounded-md mb-1 ${
                selectedCategory === cat.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label} ({cat.tasks.length})
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Search + mobile category filter */}
        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="lg:hidden rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {sortedCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-muted-foreground mb-3">
          {filteredTasks.length} tasks
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th
                  className="px-4 py-3 font-medium cursor-pointer hover:text-primary"
                  onClick={() => handleSort("name")}
                >
                  Task {renderSortIcon("name")}
                </th>
                <th
                  className="px-4 py-3 font-medium cursor-pointer hover:text-primary"
                  onClick={() => handleSort("category")}
                >
                  Category {renderSortIcon("category")}
                </th>
                <th className="px-4 py-3 font-medium">Packages</th>
                <th
                  className="px-4 py-3 font-medium cursor-pointer hover:text-primary text-center"
                  onClick={() => handleSort("baselines")}
                >
                  Baselines {renderSortIcon("baselines")}
                </th>
                <th
                  className="px-4 py-3 font-medium cursor-pointer hover:text-primary text-center"
                  onClick={() => handleSort("environments")}
                >
                  Envs {renderSortIcon("environments")}
                </th>
                <th className="px-4 py-3 font-medium text-center">Logs</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, i) => (
                <tr
                  key={task.id}
                  className={`border-t border-border hover:bg-muted/30 ${
                    i % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  <td className="px-4 py-3">
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
                        backgroundColor: categoryStyle(task.category).bg,
                        borderColor: categoryStyle(task.category).border,
                        color: categoryStyle(task.category).text,
                      }}
                    >
                      {task.category_label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {task.packages.join(", ")}
                  </td>
                  <td className="px-4 py-3 text-center">{task.baselines.length}</td>
                  <td className="px-4 py-3 text-center">
                    {task.environments.length}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {task.has_agent_logs ? (
                      <span className="text-accent">{"\u2713"}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
