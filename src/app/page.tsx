import Link from "next/link";
import { getTasksStatic, getCategoriesStatic } from "@/lib/data";
import CategoryChart from "@/components/CategoryChart";

export default function HomePage() {
  const tasks = getTasksStatic();
  const categories = getCategoriesStatic();

  const totalTasks = tasks.length;
  const totalCategories = Object.keys(categories).filter(
    (k) => k !== "demo"
  ).length;
  const tasksWithLogs = tasks.filter((t) => t.has_agent_logs).length;
  const allPackages = new Set(tasks.flatMap((t) => t.packages));

  const catData = Object.values(categories)
    .filter((c) => c.id !== "demo")
    .map((c) => ({ name: c.label, count: c.tasks.length, id: c.id }))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            MLS-Bench
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Machine Learning Science Benchmark
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground">
            Evaluating whether LLM agents can make generalizable, atomic ML
            science contributions — the kind of discoveries researchers make
            daily by modifying model architectures, loss functions, optimization
            strategies, and training procedures.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/tasks"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Explore Tasks
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Key distinction */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-muted-foreground">
                ML Engineering
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Holistic: combine many techniques (feature engineering,
                ensembling, hyperparameter tuning, data augmentation) to
                maximize a metric on one specific dataset.
              </p>
              <p className="mt-2 text-xs text-muted-foreground italic">
                This is what MLE-Bench evaluates.
              </p>
            </div>
            <div className="rounded-xl border-2 border-primary bg-primary/5 p-6">
              <h3 className="text-lg font-semibold text-primary">
                ML Science
              </h3>
              <p className="mt-2 text-sm">
                Atomic and generalizable: discover a single modular improvement
                — like replacing LayerNorm with RMSNorm, inventing a new
                activation function, designing a better learning rate schedule —
                that transfers across models, datasets, and tasks.
              </p>
              <p className="mt-2 text-xs font-medium text-primary">
                This is what MLS-Bench evaluates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { label: "Tasks", value: totalTasks },
              { label: "Categories", value: totalCategories },
              { label: "Packages", value: allPackages.size },
              { label: "Agent Logs", value: tasksWithLogs },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-6 text-center"
              >
                <div className="text-3xl font-bold text-primary">
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
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold">Task Distribution</h2>
          <p className="mt-2 text-muted-foreground">
            Tasks span {totalCategories} categories across ML domains.
          </p>
          <div className="mt-8">
            <CategoryChart data={catData} />
          </div>
        </div>
      </section>
    </div>
  );
}
