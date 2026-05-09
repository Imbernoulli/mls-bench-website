import Link from "next/link";
import Image from "next/image";
import {
  getTasksStatic,
  getModelsStatic,
  getLeaderboardStatic,
  getProposalsStatic,
} from "@/lib/data";
import MetricBarChart from "@/components/MetricBarChart";
import TaskDescription from "@/components/TaskDescription";
import TaskCodeViewer from "@/components/TaskCodeViewer";
import { categoryStyle } from "@/lib/display";
import { tileSrc } from "@/lib/tile-versions";

export function generateStaticParams() {
  const tasks = getTasksStatic().filter((t) => t.category !== "demo");
  return tasks.map((t) => ({ taskId: t.id }));
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const tasks = getTasksStatic();
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Task not found</h1>
        <Link href="/tasks" className="mt-4 text-primary hover:underline">
          Back to tasks
        </Link>
      </div>
    );
  }

  const leaderboard = getLeaderboardStatic(taskId);
  const models = getModelsStatic();
  const proposals = getProposalsStatic(taskId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/tasks" className="hover:text-primary">
          Tasks
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{task.name}</span>
      </nav>

      {/* Header */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">{task.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {task.summary}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className="inline-block rounded-full border px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: categoryStyle(task.category).bg,
                borderColor: categoryStyle(task.category).border,
                color: categoryStyle(task.category).text,
              }}
            >
              {task.category_label}
            </span>
            {task.packages.map((pkg) => (
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
              {taskId}
            </span>
          </div>
        </div>
        <Image
          src={tileSrc(taskId, "card")}
          alt=""
          width={720}
          height={360}
          priority
          className="aspect-[2/1] w-full rounded-lg border border-border object-cover"
        />
      </div>

      {/* Task description */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <TaskDescription markdown={task.description_md || ""} />
        </div>
      </section>

      {/* Source code with editable regions & baseline implementations */}
      {task.files.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Code</h2>
          <TaskCodeViewer
            files={task.files}
            baselinesCode={task.baselines_code}
            proposals={proposals}
            models={models}
          />
        </section>
      )}

      {/* Leaderboard (chart only — table removed during paper freeze) */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Results</h2>
        {leaderboard ? (
          <MetricBarChart data={leaderboard} models={models} />
        ) : (
          <p className="text-muted-foreground text-sm">
            No results available yet.
          </p>
        )}
      </section>
    </div>
  );
}
