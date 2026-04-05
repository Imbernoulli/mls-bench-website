import Link from "next/link";
import { getTasksStatic, getCategoriesStatic } from "@/lib/data";
import CategoryTreemap from "@/components/CategoryTreemap";

export default function HomePage() {
  const tasks = getTasksStatic();
  const categories = getCategoriesStatic();

  const totalTasks = tasks.length;
  const totalCategories = Object.keys(categories).filter(
    (k) => k !== "demo"
  ).length;
  const tasksWithLogs = tasks.filter((t) => t.has_agent_logs).length;
  const allPackages = new Set(tasks.flatMap((t) => t.packages));

  // Build hierarchical data: category → subcategory → tasks
  const catData = Object.values(categories)
    .filter((c) => c.id !== "demo")
    .map((c) => {
      // Derive subcategories from task IDs
      const subs: Record<string, string[]> = {};
      for (const tid of c.tasks) {
        const segs = tid.split("-");
        const sub = segs[0] === c.id && segs.length > 1 ? segs[1] : segs[0];
        (subs[sub] ??= []).push(tid);
      }
      return {
        name: c.label,
        id: c.id,
        count: c.tasks.length,
        subcategories: Object.entries(subs)
          .map(([sub, tasks]) => ({ name: sub, count: tasks.length }))
          .sort((a, b) => b.count - a.count),
      };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      {/* Hero */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            MLS-Bench
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Machine Learning Science Benchmark
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Evaluating whether LLM agents can make generalizable, atomic ML
            science contributions — the kind of discoveries researchers make
            daily by modifying model architectures, loss functions, optimization
            strategies, and training procedures.
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Link
              href="/tasks"
              className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              Explore Tasks
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Key distinction */}
      <section className="border-y border-border py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                ML Engineering
              </h3>
              <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">
                Holistic: combine many techniques (feature engineering,
                ensembling, hyperparameter tuning, data augmentation) to
                maximize a metric on one specific dataset.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                This is what MLE-Bench evaluates.
              </p>
            </div>
            <div className="rounded-lg border border-accent/40 bg-accent/5 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-accent">
                ML Science
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed">
                Atomic and generalizable: discover a single modular improvement
                — like replacing LayerNorm with RMSNorm, inventing a new
                activation function, designing a better learning rate schedule —
                that transfers across models, datasets, and tasks.
              </p>
              <p className="mt-3 text-xs font-medium text-accent">
                This is what MLS-Bench evaluates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Tasks", value: totalTasks },
              { label: "Categories", value: totalCategories },
              { label: "Packages", value: allPackages.size },
              { label: "Agent Logs", value: tasksWithLogs },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border p-5 text-center"
              >
                <div className="text-3xl font-semibold tabular-nums">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category distribution */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-xl font-semibold">Task Distribution</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalTasks} tasks across {totalCategories} categories. Click a
            category to explore.
          </p>
          <div className="mt-8">
            <CategoryTreemap data={catData} />
          </div>
        </div>
      </section>
    </div>
  );
}
