import Link from "next/link";
import { getTasksStatic, getCategoriesStatic } from "@/lib/data";
import CategoryTreemap from "@/components/CategoryTreemap";

const COLORS = [
  "#10a37f", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#2563eb",
  "#14b8a6", "#e11d48", "#0ea5e9", "#a855f7", "#d946ef",
  "#22c55e", "#eab308", "#3b82f6", "#f43f5e", "#7c3aed",
  "#0891b2", "#65a30d", "#ea580c", "#4f46e5",
];

export default function CategoriesPage() {
  const tasks = getTasksStatic();
  const categories = getCategoriesStatic();

  const catData = Object.values(categories)
    .filter((c) => c.id !== "demo")
    .map((c) => ({ name: c.label, count: c.tasks.length, id: c.id }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Categories</h1>
      <p className="mt-2 text-muted-foreground">
        {tasks.length} tasks across {catData.length} research categories.
        Click a category to explore its tasks.
      </p>

      <div className="mt-8">
        <CategoryTreemap data={catData} />
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catData.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.id}`}
            className="group rounded-xl border border-border p-5 hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <h2 className="font-semibold group-hover:text-accent transition-colors">
                {cat.name}
              </h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {cat.count} task{cat.count !== 1 ? "s" : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
