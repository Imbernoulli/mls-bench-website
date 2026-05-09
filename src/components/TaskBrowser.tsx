"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Category, TaskMeta } from "@/lib/types";
import { categoryStyle } from "@/lib/display";
import { tileSrc } from "@/lib/tile-versions";

interface Props {
  tasks: TaskMeta[];
  categories: Record<string, Category>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-border bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

export default function TaskBrowser({ tasks, categories }: Props) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const view = searchParams.get("view") === "cards" ? "cards" : "columns";

  const sortedCategories = useMemo(
    () =>
      Object.values(categories)
        .filter((category) => category.id !== "demo")
        .sort((a, b) => b.tasks.length - a.tasks.length),
    [categories]
  );

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((task) => task.category !== "demo")
      .filter((task) =>
        selectedCategory ? task.category === selectedCategory : true
      )
      .filter((task) => {
        if (!q) return true;
        return [
          task.name,
          task.summary,
          task.category_label,
          ...task.packages,
          ...task.baselines,
          ...task.environments,
        ].some((value) => value.toLowerCase().includes(q));
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks, search, selectedCategory]);

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <div className="inline-flex rounded-full border border-border bg-muted p-1 text-sm">
          {[
            { href: "/tasks?view=columns", label: "Columns", value: "columns" },
            { href: "/tasks?view=cards", label: "Cards", value: "cards" },
          ].map((item) => (
            <Link
              key={item.value}
              href={item.href}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                view === item.value
                  ? "bg-card font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-20">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Categories
          </h3>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`mb-1 block w-full rounded-md px-3 py-1.5 text-left text-sm ${
              !selectedCategory
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({tasks.filter((task) => task.category !== "demo").length})
          </button>
          {sortedCategories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                setSelectedCategory(
                  category.id === selectedCategory ? null : category.id
                )
              }
              className={`mb-1 block w-full rounded-md px-3 py-1.5 text-left text-sm ${
                selectedCategory === category.id
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {category.label} ({category.tasks.length})
            </button>
          ))}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search task names, summaries, packages, baselines, or settings..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <select
            value={selectedCategory || ""}
            onChange={(event) => setSelectedCategory(event.target.value || null)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm lg:hidden"
          >
            <option value="">All categories</option>
            {sortedCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3 text-sm text-muted-foreground">
          {filteredTasks.length} tasks
        </div>

        {view === "columns" ? (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const style = categoryStyle(task.category);
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="grid gap-4 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/30 md:grid-cols-[160px_minmax(0,1fr)_minmax(260px,0.94fr)]"
                >
                  <Image
                    src={tileSrc(task.id, "column")}
                    alt=""
                    width={320}
                    height={160}
                    className="aspect-[2/1] w-full rounded-md object-cover md:w-[160px]"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">
                        {task.name}
                      </h2>
                      <span
                        className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: style.bg,
                          borderColor: style.border,
                          color: style.text,
                        }}
                      >
                        {task.category_label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {task.summary}
                    </p>
                  </div>
                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Baselines
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {task.baselines.map((baseline) => (
                          <Badge key={baseline}>{baseline}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Settings
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {task.environments.map((setting) => (
                          <Badge key={setting}>{setting}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.map((task) => {
              const style = categoryStyle(task.category);
              return (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-muted/30"
                >
                  <Image
                    src={tileSrc(task.id, "card")}
                    alt=""
                    width={720}
                    height={360}
                    className="aspect-[2/1] w-full object-cover"
                  />
                  <div className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">
                        {task.name}
                      </h2>
                      <span
                        className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: style.bg,
                          borderColor: style.border,
                          color: style.text,
                        }}
                      >
                        {task.category_label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {task.summary}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
