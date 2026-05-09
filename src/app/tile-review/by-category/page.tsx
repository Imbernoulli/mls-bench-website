// Hidden index: links to each category's 3-version review page.
// Not in Navbar — internal annotator-only access.

import Link from "next/link";
import { getTasksStatic, getCategoriesStatic } from "@/lib/data";
import { categoryStyle } from "@/lib/display";

export default function ByCategoryIndexPage() {
  const tasks = getTasksStatic().filter((t) => t.category !== "demo");
  const categories = getCategoriesStatic();

  const buckets = Object.values(categories)
    .filter((c) => c.id !== "demo")
    .map((c) => ({
      ...c,
      count: tasks.filter((t) => t.category === c.id).length,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Tile Review (by Category)</h1>
      <p className="mt-2 text-muted-foreground">
        Five generated versions per task (v1 detailed / v2 simpler / v3 codex /
        v4 codex v1-fix imgen / v5 codex sees v1 → litellm). Pick a category to start.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {buckets.map((c) => {
          const s = categoryStyle(c.id);
          return (
            <Link
              key={c.id}
              href={`/tile-review/by-category/${c.id}`}
              className="rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors"
              style={{ borderLeftColor: s.border, borderLeftWidth: 4 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {c.count} tasks
                  </div>
                </div>
                <span
                  className="rounded-full border px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: s.bg,
                    borderColor: s.border,
                    color: s.text,
                  }}
                >
                  {c.id}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
