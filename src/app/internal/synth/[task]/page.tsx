import Link from "next/link";
import data from "@/data/internal-synth.json";
import MarkdownContent from "@/components/MarkdownContent";

type Task = (typeof data.tasks)[number];

export function generateStaticParams() {
  return (data.tasks as Task[]).map((t) => ({ task: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ task: string }>;
}) {
  const { task } = await params;
  const t = (data.tasks as Task[]).find((x) => x.id === task);
  return {
    title: t ? `Internal · ${t.name}` : "Internal · Synth Task",
    robots: { index: false, follow: false },
  };
}

function fmt(v: string): string {
  if (v === "" || v == null) return "—";
  const n = Number(v);
  if (!Number.isFinite(n)) return v;
  if (Number.isInteger(n)) return String(n);
  if (Math.abs(n) !== 0 && (Math.abs(n) < 1e-3 || Math.abs(n) >= 1e5))
    return n.toExponential(2);
  return n.toFixed(4).replace(/\.?0+$/, "");
}

export default async function InternalSynthDetailPage({
  params,
}: {
  params: Promise<{ task: string }>;
}) {
  const { task: taskId } = await params;
  const task = (data.tasks as Task[]).find((t) => t.id === taskId);

  if (!task) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Task not found</h1>
        <Link
          href="/internal/synth"
          className="mt-4 inline-block text-primary hover:underline"
        >
          Back to synth tasks
        </Link>
      </div>
    );
  }

  const header = task.leaderboard_header;
  const scoreCols = new Set(task.score_columns);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/internal/synth" className="hover:text-primary">
          Synth Tasks
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{task.name}</span>
      </nav>

      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        Internal · not linked from the main site
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{task.name}</h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{task.id}</p>
      <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
        {task.summary}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-md border border-border px-2 py-1">
          {task.baselines.length} baselines
        </span>
        <span className="rounded-md border border-border px-2 py-1">
          {task.seeds.length === 1
            ? "1 seed (42)"
            : `${task.seeds.length} seeds (${task.seeds.join(", ")})`}
        </span>
        <span className="rounded-md border border-border px-2 py-1">
          {task.rigorous_codebase ? "rigorous codebase" : "command mode"}
        </span>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Reproduced leaderboard</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-muted">
                {header.map((h) => (
                  <th
                    key={h}
                    className={`whitespace-nowrap px-3 py-2 text-left font-medium ${
                      scoreCols.has(h) ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {task.leaderboard_rows.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  {header.map((h) => {
                    const r = row as Record<string, string>;
                    const isMeta = ["timestamp", "model", "is_final", "seed"].includes(
                      h,
                    );
                    return (
                      <td
                        key={h}
                        className={`whitespace-nowrap px-3 py-1.5 ${
                          scoreCols.has(h)
                            ? "font-semibold text-primary"
                            : isMeta
                              ? "text-muted-foreground"
                              : "text-foreground"
                        }`}
                      >
                        {isMeta ? r[h] : fmt(r[h])}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Score columns highlighted. Single-seed tasks show one row per
          baseline; multi-seed tasks show per-seed rows plus a{" "}
          <code>seed=mean</code> aggregate.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Task description</h2>
        <div className="mt-3 rounded-lg border border-border bg-white p-6">
          <MarkdownContent content={task.description_md} />
        </div>
      </section>
    </div>
  );
}
