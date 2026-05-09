// Hidden review page (not linked in Navbar). Shows the 140 generated
// task tiles. Images live in /public/data/task_tiles/ and are served
// directly from the website host (jsDelivr can't reach the source repo
// because MLS-Bench-dev is private).

import { getTasksStatic } from "@/lib/data";
import { categoryStyle } from "@/lib/display";

const TILE_BASE = "/data/task_tiles";

export default function TileReviewPage() {
  const tasks = getTasksStatic()
    .filter((t) => t.category !== "demo")
    .sort((a, b) => {
      const c = a.category_label.localeCompare(b.category_label);
      return c !== 0 ? c : a.name.localeCompare(b.name);
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Task Tile Review</h1>
      <p className="mt-2 text-muted-foreground">
        {tasks.length} generated tiles, served via jsDelivr from{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          MLS-Bench-dev/paper_assets/task_tiles
        </code>
        . Internal review only — not linked from navigation.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {tasks.map((t) => {
          const cat = categoryStyle(t.category);
          return (
            <div
              key={t.id}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="aspect-[2/1] w-full bg-muted/40">
                <img
                  src={`${TILE_BASE}/${t.id}.png`}
                  alt={t.name}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{t.name}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {t.id}
                    </div>
                  </div>
                  <span
                    className="shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: cat.bg,
                      borderColor: cat.border,
                      color: cat.text,
                    }}
                  >
                    {t.category_label}
                  </span>
                </div>
                {t.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t.summary}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
