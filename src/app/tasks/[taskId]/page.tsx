import Link from "next/link";
import {
  getTasksStatic,
  getLeaderboardStatic,
  getConversationIndexStatic,
} from "@/lib/data";
import LeaderboardTable from "@/components/LeaderboardTable";
import TaskDescription from "@/components/TaskDescription";

export function generateStaticParams() {
  const tasks = getTasksStatic();
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
  const convoIndex = getConversationIndexStatic();

  // Only show conversations for models that have final results
  const finalModels = new Set(
    (leaderboard?.rows || [])
      .filter((r) => r.is_final === true && !(r.model as string).startsWith("baseline:"))
      .map((r) => r.model as string)
  );
  const conversations = (convoIndex[taskId] || []).filter(
    (c) => finalModels.has(c.model)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/tasks" className="hover:text-primary">
          Tasks
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{taskId}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{taskId}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
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
            {task.rigorous_codebase && (
              <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                rigorous codebase
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Task description */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <TaskDescription markdown={task.description_md || ""} />
        </div>
      </section>

      {/* Editable files */}
      {task.files.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Editable Files</h2>
          <div className="rounded-xl border border-border bg-card p-4">
            <ul className="space-y-2">
              {task.files.map((f, i) => (
                <li key={i} className="text-sm">
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {f.filename}
                  </code>
                  {f.edit_ranges.length > 0 && (
                    <span className="ml-2 text-muted-foreground">
                      lines{" "}
                      {f.edit_ranges.map((r, j) => (
                        <span key={j}>
                          {j > 0 && ", "}
                          {r.start === -1 ? "all" : `${r.start}-${r.end}`}
                        </span>
                      ))}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Leaderboard */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Results</h2>
        {leaderboard ? (
          <LeaderboardTable data={leaderboard} />
        ) : (
          <p className="text-muted-foreground text-sm">
            No results available yet.
          </p>
        )}
      </section>

      {/* Agent conversations */}
      {conversations.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Agent Conversations</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {conversations.map((convo) => (
              <Link
                key={convo.slug}
                href={`/conversations/${taskId}/${convo.slug}`}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors"
              >
                <div className="font-medium">{convo.model}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {convo.total_steps} steps
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
