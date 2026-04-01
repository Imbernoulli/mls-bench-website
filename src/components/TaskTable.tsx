"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { TaskMeta, Category } from "@/lib/types";

interface Props {
  tasks: TaskMeta[];
  categories: Record<string, Category>;
}

const CATEGORY_COLORS: Record<string, string> = {
  rl: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  cv: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  llm: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  ai4sci: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  ai4bio: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  dl: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  graph: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  ts: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  causal: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  opt: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  ml: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
  pde: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
  quant: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  security: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  speech: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
};

function getCategoryColor(catId: string): string {
  return CATEGORY_COLORS[catId] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
}

export default function TaskTable({ tasks, categories }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "category" | "baselines" | "environments">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filteredTasks = useMemo(() => {
    let result = tasks.filter((t) => t.id !== "demo-task-1" && t.id !== "demo-task-2");

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
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
          cmp = a.id.localeCompare(b.id);
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

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => {
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
                  Task <SortIcon col="name" />
                </th>
                <th
                  className="px-4 py-3 font-medium cursor-pointer hover:text-primary"
                  onClick={() => handleSort("category")}
                >
                  Category <SortIcon col="category" />
                </th>
                <th className="px-4 py-3 font-medium">Packages</th>
                <th
                  className="px-4 py-3 font-medium cursor-pointer hover:text-primary text-center"
                  onClick={() => handleSort("baselines")}
                >
                  Baselines <SortIcon col="baselines" />
                </th>
                <th
                  className="px-4 py-3 font-medium cursor-pointer hover:text-primary text-center"
                  onClick={() => handleSort("environments")}
                >
                  Envs <SortIcon col="environments" />
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
                      {task.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(
                        task.category
                      )}`}
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
