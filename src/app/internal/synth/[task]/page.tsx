import Link from "next/link";
import data from "@/data/internal-synth.json";
import type { TaskMeta, LeaderboardData } from "@/lib/types";
import TaskDescription from "@/components/TaskDescription";
import TaskCodeViewer from "@/components/TaskCodeViewer";
import MetricBarChart from "@/components/MetricBarChart";
import { categoryStyle } from "@/lib/display";

const TASKS = data.tasks as unknown as TaskMeta[];
const LBS = data.leaderboards as unknown as Record<string, LeaderboardData>;
const shortId = (id: string) => id.replace(/^synth-/, "");

export function generateStaticParams() {
  return TASKS.map((t) => ({ task: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ task: string }>;
}) {
  const { task } = await params;
  const t = TASKS.find((x) => x.id === task);
  return {
    title: t ? `Internal · ${t.name}` : "Internal · Synth Task",
    robots: { index: false, follow: false },
  };
}

export default async function InternalSynthDetailPage({
  params,
}: {
  params: Promise<{ task: string }>;
}) {
  const { task: taskId } = await params;
  const task = TASKS.find((t) => t.id === taskId);

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

  const leaderboard = LBS[taskId] ?? null;
  const cat = categoryStyle(task.category);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/internal/synth" className="hover:text-primary">
          Synth Tasks
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{task.name}</span>
      </nav>

      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        Internal · not linked from the main site
      </div>

      {/* Header */}
      <h1 className="text-3xl font-bold">{task.name}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {task.summary}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {task.category_label && (
          <span
            className="inline-block rounded-full border px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: cat.bg,
              borderColor: cat.border,
              color: cat.text,
            }}
          >
            {task.category_label}
          </span>
        )}
        {task.packages?.map((pkg) => (
          <span
            key={pkg}
            className="inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
          >
            {pkg}
          </span>
        ))}
      </div>
      <div className="mt-5">
        <span className="rounded-md border border-border bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
          {shortId(taskId)}
        </span>
      </div>

      {/* Task description */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Description</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <TaskDescription markdown={task.description_md || ""} />
        </div>
      </section>

      {/* Editable scaffold + baseline implementations */}
      {task.files.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Code</h2>
          <TaskCodeViewer
            files={task.files}
            baselinesCode={task.baselines_code}
            proposals={null}
            models={[]}
            annotations={[]}
            baselineAnnotations={[]}
            sweeps={[]}
          />
        </section>
      )}

      {/* Reproduced leaderboard */}
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Results</h2>
        {leaderboard ? (
          <MetricBarChart data={leaderboard} models={[]} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No results available yet.
          </p>
        )}
      </section>
    </div>
  );
}
