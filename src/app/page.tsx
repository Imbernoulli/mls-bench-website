import Link from "next/link";
import {
  getTasksStatic,
  getCategoriesStatic,
} from "@/lib/data";
import { RESOURCE_LINKS } from "@/lib/resources";
import {
  getLiteIntelligenceStatic,
  getCategoryPerformanceStatic,
} from "@/lib/paper-results";
import CategoryGrid from "@/components/CategoryGrid";
import CategoryPerformanceCharts from "@/components/CategoryPerformanceCharts";
import HeroTaskGallery from "@/components/HeroTaskGallery";
import LiteIntelligenceChart from "@/components/LiteIntelligenceChart";
import MethodGallery from "@/components/MethodGallery";

const INSTITUTIONS = [
  { name: "UC Berkeley", src: "/data/institutions/berkeley.svg" },
  { name: "Princeton University", src: "/data/institutions/princeton.png" },
  { name: "Tsinghua University", src: "/data/institutions/tsinghua.svg" },
  { name: "Purdue University", src: "/data/institutions/purdue.svg" },
  { name: "University of Washington", src: "/data/institutions/uw.svg" },
  { name: "Harvard University", src: "/data/institutions/harvard.svg" },
  { name: "University of Pennsylvania", src: "/data/institutions/upenn.svg" },
  { name: "Shanghai Jiao Tong University", src: "/data/institutions/sjtu.png" },
  { name: "UC San Diego", src: "/data/institutions/ucsd.png" },
  { name: "Carnegie Mellon University", src: "/data/institutions/cmu.svg" },
];

// Each pill = a solid 2-px brand-colored frame with a softly tinted inner
// surface. Text uses a slightly darker brand variant for legibility on the
// pale fill; on hover the inner tint deepens.
const RESOURCE_BUTTONS = [
  {
    link: RESOURCE_LINKS.website,
    icon: <GlobeIcon />,
    className:
      "border-2 border-[#10A37F] bg-[#10A37F]/8 text-[#085c46] hover:bg-[#10A37F]/16",
  },
  {
    link: RESOURCE_LINKS.github,
    icon: <GitHubIcon />,
    className:
      "border-2 border-[#181717] bg-[#181717]/5 text-[#181717] hover:bg-[#181717]/12",
  },
  {
    link: RESOURCE_LINKS.arxiv,
    icon: <ArxivIcon />,
    className:
      "border-2 border-[#B31B1B] bg-[#B31B1B]/8 text-[#7a1212] hover:bg-[#B31B1B]/16",
  },
  {
    link: RESOURCE_LINKS.discord,
    icon: <DiscordIcon />,
    className:
      "border-2 border-[#5865F2] bg-[#5865F2]/8 text-[#3845c5] hover:bg-[#5865F2]/16",
  },
  {
    link: RESOURCE_LINKS.huggingFace,
    icon: <span className="text-sm leading-none">🤗</span>,
    className:
      "border-2 border-[#E5B500] bg-[#FFD21E]/15 text-[#7a5d00] hover:bg-[#FFD21E]/30",
  },
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

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10h14M10 2.75c2 2 3 4.42 3 7.25s-1 5.25-3 7.25M10 2.75C8 4.75 7 7.17 7 10s1 5.25 3 7.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
      <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.52 7.52 0 0 1 8 3.86c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
    </svg>
  );
}

function ArxivIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
      <path d="m5 15 4.8-10M15 15 10.2 5M6.3 10h7.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M4 4.4c1.8 0 3.3 1 4.6 3M16 15.6c-1.8 0-3.3-1-4.6-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M19.5 5.2A16.7 16.7 0 0 0 15.4 4l-.2.4c1.5.4 2.2 1 2.2 1a13.5 13.5 0 0 0-10.8 0s.7-.7 2.3-1L8.6 4a16.7 16.7 0 0 0-4.1 1.2C1.9 9 1.2 12.8 1.5 16.5A16.8 16.8 0 0 0 6.5 19l.6-.9a9.7 9.7 0 0 1-1.6-.8l.4-.3c3.1 1.5 6.7 1.5 9.8 0l.4.3c-.5.3-1 .6-1.6.8l.6.9a16.8 16.8 0 0 0 5-2.5c.4-4.3-.7-8-2.6-11.3ZM8.3 14.2c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm7.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
    </svg>
  );
}

export default function HomePage() {
  const tasks = getTasksStatic().filter((task) => task.category !== "demo");
  const categories = getCategoriesStatic();
  const liteScores = getLiteIntelligenceStatic();
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
      <section className="pt-16 pb-20 sm:pt-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              MLS-Bench
            </h1>
            <p className="mt-4 text-base text-foreground">
              A holistic and rigorous assessment of AI systems on building
              better AI.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link
                href="/tasks"
                className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Explore Tasks
              </Link>
              {RESOURCE_BUTTONS.map((item) => {
                const { link } = item;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href === "#" ? undefined : "_blank"}
                    rel={link.href === "#" ? undefined : "noopener noreferrer"}
                    className={`inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${item.className}`}
                  >
                    {item.icon}
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <LiteIntelligenceChart data={liteScores} compact />
          </div>

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

        {/* ---- Methods band: full-bleed, distinct background ---- */}
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
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
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
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">
              Model Performance by Category
            </h2>
            <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Scores use the paper's normalized task metric, averaged by category.
              Human SOTA is computed from the reproduced human baselines and
              plotted alongside the model agents.
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
        <div className="mx-auto max-w-5xl px-4">
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
