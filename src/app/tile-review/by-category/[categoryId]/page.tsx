// Per-category 3-version review page. Each task shows 3 thumbnails
// labeled 1 / 2 / 3 corresponding to v1, v2, v3 of the generated tile.
// Annotators copy the task id + version they prefer into a spreadsheet.

import fs from "fs";
import path from "path";
import Link from "next/link";
import {
  getTasksStatic,
  getCategoriesStatic,
} from "@/lib/data";
import { categoryStyle } from "@/lib/display";

const VERSIONS = [
  { num: 1, base: "/data/task_tiles_v1", subdir: "task_tiles_v1", label: "Detailed" },
  { num: 2, base: "/data/task_tiles_v2", subdir: "task_tiles_v2", label: "Simpler" },
  { num: 3, base: "/data/task_tiles_v3", subdir: "task_tiles_v3", label: "Codex (auto-review)" },
  { num: 4, base: "/data/task_tiles_v4", subdir: "task_tiles_v4", label: "Codex (v1-fix, imgen)" },
  { num: 5, base: "/data/task_tiles_v5", subdir: "task_tiles_v5", label: "Codex sees v1, litellm" },
];

const PUBLIC_DATA = path.join(process.cwd(), "public", "data");

function tileExists(subdir: string, taskId: string): boolean {
  return fs.existsSync(path.join(PUBLIC_DATA, subdir, `${taskId}.png`));
}

export function generateStaticParams() {
  const categories = getCategoriesStatic();
  return Object.keys(categories)
    .filter((id) => id !== "demo")
    .map((id) => ({ categoryId: id }));
}

export default async function CategoryReviewPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const tasks = getTasksStatic()
    .filter((t) => t.category === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name));
  const categories = getCategoriesStatic();
  const cat = categories[categoryId];

  if (!cat || tasks.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">No tasks in this category</h1>
        <Link
          href="/tile-review/by-category"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Back to category list
        </Link>
      </div>
    );
  }

  const s = categoryStyle(categoryId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/tile-review/by-category" className="hover:text-primary">
          Tile Review
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{cat.label}</span>
      </nav>

      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">{cat.label}</h1>
        <span
          className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: s.bg,
            borderColor: s.border,
            color: s.text,
          }}
        >
          {tasks.length} tasks
        </span>
      </div>
      <p className="mt-2 text-muted-foreground">
        Five generated versions per task. Pick the one that best conveys the
        task. v1 = detailed schematic, v2 = minimal one-glance icon, v3 = codex
        auto-reviewed, v4 = codex with explicit v1-fix pass via codex's own
        imgen, v5 = codex inspects v1 then calls litellm.
      </p>

      <div className="mt-8 space-y-10">
        {tasks.map((t) => (
          <section
            key={t.id}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="mb-1 flex items-baseline gap-3">
              <h2 className="text-lg font-semibold">{t.name}</h2>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {t.id}
              </code>
            </div>
            {t.summary && (
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {t.summary}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {VERSIONS.map((v) => {
                const present = tileExists(v.subdir, t.id);
                return (
                  <div
                    key={v.num}
                    className="overflow-hidden rounded-lg border border-border bg-background"
                  >
                    <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                        {v.num}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {v.label}
                      </span>
                    </div>
                    <div className="aspect-[2/1] w-full bg-muted/20">
                      {present ? (
                        <img
                          src={`${v.base}/${t.id}.png`}
                          alt={`${t.name} (v${v.num})`}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          (generation pending)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
