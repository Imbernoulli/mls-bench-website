import {
  getTasksStatic,
  getCategoriesStatic,
} from "@/lib/data";
import ResourceButtons from "@/components/ResourceButtons";
import { getCategoryPerformanceStatic } from "@/lib/paper-results";
import CategoryGrid from "@/components/CategoryGrid";
import CategoryPerformanceCharts from "@/components/CategoryPerformanceCharts";
import HeroTaskGallery from "@/components/HeroTaskGallery";
import HeroSplash from "@/components/HeroSplash";
import Leaderboard from "@/components/Leaderboard";
import MethodGallery from "@/components/MethodGallery";

const INSTITUTIONS = [
  { name: "UC Berkeley", src: "/data/institutions/berkeley.png" },
  { name: "Princeton University", src: "/data/institutions/princeton.png" },
  { name: "Tsinghua University", src: "/data/institutions/tsinghua.svg" },
  { name: "Purdue University", src: "/data/institutions/purdue.png" },
  { name: "University of Washington", src: "/data/institutions/uw.png" },
  { name: "Harvard University", src: "/data/institutions/harvard.svg" },
  { name: "University of Pennsylvania", src: "/data/institutions/upenn.png" },
  { name: "Shanghai Jiao Tong University", src: "/data/institutions/sjtu.png" },
  { name: "UC San Diego", src: "/data/institutions/ucsd.png" },
  { name: "Carnegie Mellon University", src: "/data/institutions/cmu.png" },
];


const HERO_TASK_IDS = [
  "llm-qat-algorithm",
  "llm-pretrain-embedding",
  "llm-kv-structural-reduction",
  "robo-diffusion-sampling-method",
  "tdmpc2-planning",
  "cv-diffusion-efficiency",
  "cv-3dgs-densification",
  "ai4sci-climate-emulation",
  "ai4sci-inverse-diffusion-algo",
  "ai4bio-protein-inverse-folding",
  "rl-value-atari",
  "safe-rl",
  "optimization-gradient-compression",
  "optimization-evolution-strategy",
  "graph-signal-propagation",
  "causal-discovery-discrete",
  "security-adversarial-attack-black-box-score",
  "mlsys-fused-attention",
];

export default function HomePage() {
  const tasks = getTasksStatic().filter((task) => task.category !== "demo");
  const categories = getCategoriesStatic();
  const categoryPerformance = getCategoryPerformanceStatic();

  const totalTasks = tasks.length;
  const totalCategories = Object.keys(categories).filter(
    (key) => key !== "demo"
  ).length;

  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const heroTasks = HERO_TASK_IDS.map((taskId) => taskById.get(taskId))
    .filter((task): task is (typeof tasks)[number] => task != null)
    .map((task) => ({ id: task.id, name: task.name }));
  const categoryItems = Object.values(categories)
    .filter((category) => category.id !== "demo")
    .map((category) => ({
      category,
      tasks: category.tasks
        .map((taskId) => taskById.get(taskId))
        .filter((task): task is (typeof tasks)[number] => task != null)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));

  return (
    <div>
      <HeroSplash />
      <section className="pt-10 pb-16 sm:pt-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              MLS-Bench: A Holistic and Rigorous Assessment of AI Systems on
              Building Better AI
            </h1>
            <div className="mt-6 flex justify-center">
              <ResourceButtons />
            </div>
          </div>

          <figure className="mx-auto mt-8 max-w-[900px]">
            <img
              src="/data/paper_figs/mls-bench-title.webp"
              alt="MLS-Bench"
              className="h-auto w-full"
            />
          </figure>

          <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-foreground">
            MLS-Bench evaluates whether AI systems can invent generalizable and
            scalable ML methods. It spans {totalTasks} tasks across 12 domains
            &mdash; language models, vision and generation, reinforcement
            learning, robotics, ML systems, AI for science, optimization, time
            series, causal reasoning, and more.
          </p>

          <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {INSTITUTIONS.map((institution) => (
              <img
                key={institution.name}
                src={institution.src}
                alt={institution.name}
                className="max-h-10 w-auto max-w-[160px] opacity-85 transition hover:opacity-100"
              />
            ))}
          </div>
        </div>

        {/* ---- Methods band + Bitter Lesson quote: one continuous full-bleed
                muted block. Keeping them on the same background makes the
                "examples that stood the test of time" visually flow into
                the Sutton quote, instead of the quote drifting toward the
                white bridge below. */}
        <div className="relative mt-16 overflow-hidden border-y border-border bg-muted/40 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/70">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-[#10A37F]"
                />
                Why this benchmark
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
                Methods that stood the test of time and scale.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
                Modern AI progress is built on a small set of reusable ideas
                &mdash; convolutions, residual connections, attention,
                normalization &mdash; that generalize across architectures and
                survive every order-of-magnitude jump in scale.
              </p>
            </div>

            <div className="mt-10">
              <MethodGallery />
            </div>
          </div>
        </div>

        {/* ---- Bridge to MLS-Bench ---- */}
        <div className="mx-auto mt-14 max-w-4xl px-4 sm:mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
              MLS-Bench tests whether AI agents can invent the next ones.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
              Each task isolates a well-defined research question and asks the
              agent to propose a single modular improvement &mdash; a new loss,
              an attention variant, a sampler, a routing rule &mdash; then
              measures whether the change transfers across models, datasets,
              and seeds.
            </p>
          </div>

          <div className="mt-10">
            <HeroTaskGallery tasks={heroTasks} />
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-[14px] leading-relaxed text-foreground/75">
            {totalTasks} executable tasks across 12 domains, each built around a
            targeted ML component, a controlled edit surface, and
            multi-setting evidence for transfer.
          </p>
        </div>
      </section>

      <section className="border-t border-border py-14">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Leaderboard</h2>
            <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Score on the official 30-task MLS-Bench-Lite subset.
            </p>
          </div>
          <div className="mt-6">
            <Leaderboard />
          </div>
        </div>
      </section>

      <section className="border-t border-border py-14">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">
              Model Performance by Category
            </h2>
            <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Each model's bar shows Vanilla as the darker lower portion and
              Agent as the lighter overlay, against a translucent grey Human
              SOTA reference computed from the reproduced human baselines.
              Scores use the paper's normalized task metric.
            </p>
          </div>
          <div className="mt-6">
            <CategoryPerformanceCharts
              data={categoryPerformance.data}
              series={categoryPerformance.series}
            />
          </div>
        </div>
      </section>

      <section className="border-t border-border pt-12 pb-10">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Task Categories</h2>
            <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {totalTasks} tasks across {totalCategories} flat categories. Open a
              category to browse its tasks.
            </p>
          </div>
          <div className="mt-8">
            <CategoryGrid items={categoryItems} />
          </div>
        </div>
      </section>
    </div>
  );
}
