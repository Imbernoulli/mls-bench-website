import Link from "next/link";
import data from "@/data/internal-synth.json";

export const metadata = {
  title: "Internal · Synth Tasks",
  robots: { index: false, follow: false },
};

type Task = (typeof data.tasks)[number];

export default function InternalSynthListPage() {
  const tasks = data.tasks as Task[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        Internal · not linked from the main site
      </div>
      <h1 className="text-3xl font-bold tracking-tight">
        Synthetic-Learning Tasks
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        {tasks.length} ML-science benchmark tasks for internal development
        review. Generated {data.generated}. Click a task to see its research
        question, baselines, and reproduced leaderboard.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {tasks.map((t) => (
          <Link
            key={t.id}
            href={`/internal/synth/${t.id}`}
            className="group rounded-xl border border-border bg-white p-5 transition hover:border-primary hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold leading-snug group-hover:text-primary">
                {t.name}
              </h2>
              <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                {t.id}
              </span>
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {t.summary}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t.baselines.map((b) => (
                <span
                  key={b}
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground">
              {t.baselines.length} baselines ·{" "}
              {t.seeds.length === 1 ? "1 seed" : `${t.seeds.length} seeds`} ·{" "}
              {t.rigorous_codebase ? "rigorous codebase" : "command mode"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
