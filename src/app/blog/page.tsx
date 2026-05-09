import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RESOURCE_LINKS } from "@/lib/resources";

export const metadata: Metadata = {
  title: "MLS-Bench Blog",
  description:
    "A long-form introduction to MLS-Bench and what it measures about AI systems doing ML science.",
};

const FIGURES = {
  compute: "/data/blog_figs/exp_compute.png",
  lite: "/data/blog_figs/lite_intelligence.png",
  ablations: "/data/blog_figs/exp_ablations.png",
  hack: "/data/blog_figs/exp_hack_ablation.png",
  hidden: "/data/blog_figs/exp_hidden_bias.png",
  scaling: "/data/blog_figs/exp_test_time_scaling.png",
  allocation: "/data/blog_figs/exp2_allocation.png",
  context: "/data/blog_figs/exp_context.png",
  innovation: "/data/blog_figs/exp_innovation.png",
} as const;

const RESOURCE_LINKS_ORDERED = [
  RESOURCE_LINKS.website,
  RESOURCE_LINKS.github,
  RESOURCE_LINKS.arxiv,
  RESOURCE_LINKS.discord,
  RESOURCE_LINKS.huggingFace,
];

const AUTHOR_BYLINE =
  "Bohan Lyu · Yucheng Yang · Siqiao Huang · Jiaru Zhang · Qixin Xu · Xinghan Li · Xinyang Han · Yicheng Zhang · Huaqing Zhang · Runhan Huang · Kaicheng Yang · Zitao Chen · Wentao Guo · Junlin Yang · Xinyue Ai · Wenhao Chai · Yadi Cao · Ziran Yang · Kun Wang · Dapeng Jiang · Huan-ang Gao · Shange Tang · Chengshuai Shi · Simon S. Du · Max Simchowitz · Jiantao Jiao · Dawn Song · Chi Jin";

function Figure({
  src,
  alt,
  caption,
  wide = false,
  narrow = false,
}: {
  src: string;
  alt: string;
  caption: string;
  wide?: boolean;
  narrow?: boolean;
}) {
  const figureCls = wide
    ? "my-10"
    : narrow
    ? "mx-auto my-8 max-w-xl"
    : "mx-auto my-8 max-w-3xl";
  const dim = wide
    ? { w: 1120, h: 520 }
    : narrow
    ? { w: 520, h: 320 }
    : { w: 760, h: 420 };
  return (
    <figure className={figureCls}>
      <a href={src} target="_blank" rel="noopener noreferrer">
        <Image
          src={src}
          alt={alt}
          width={dim.w}
          height={dim.h}
          className="h-auto w-full rounded-lg border border-border bg-white"
        />
      </a>
      <figcaption className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function BlogPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          MLS-Bench Paper Notes
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Can AI Systems Build Better AI?
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {AUTHOR_BYLINE}
        </p>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
          MLS-Bench asks whether an agent can make a reusable machine-learning
          science contribution: a new component, objective, optimizer, or
          training procedure that works beyond the exact setting where it was
          invented.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          {RESOURCE_LINKS_ORDERED.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href === "#" ? undefined : "_blank"}
              rel={link.href === "#" ? undefined : "noopener noreferrer"}
              className="rounded-md border border-border px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
      </header>

      <div className="prose prose-neutral mt-10 max-w-none prose-headings:tracking-tight prose-a:text-foreground">
        <p>
          Most agent benchmarks reward engineering around one fixed instance:
          clean the data, tune the pipeline, debug the run, select the model,
          and climb a leaderboard. Those skills matter, but they do not isolate
          the scientific step that changes how machine learning systems are
          built.
        </p>
        <p>
          MLS-Bench targets that narrower and harder question. Each task fixes a
          research scaffold, gives the agent the relevant source code and strong
          baseline implementations, then asks for one algorithmic change inside
          a controlled edit surface. The submitted result has to generalize
          across settings, seeds, datasets, environments, or model scales.
        </p>
        <p>
          The current result is clear: frontier agents can code and iterate, but
          they are still far from reliably surpassing strong human-designed
          methods. The gap is not just proposal quality. It is also scientific
          judgment: choosing what to test, spending limited compute, reading
          feedback, and knowing when a result supports a scalable claim.
        </p>

        <h2>What MLS-Bench Measures</h2>
        <p>
          A task is meant to feel like a small research iteration rather than a
          general coding assignment. The benchmark covers 140 tasks across 12
          areas, including language models, reinforcement learning, robotics,
          vision and generation, ML systems, AI for science, optimization, time
          series, causal reasoning, trustworthy learning, classical learning,
          and deep learning.
        </p>
        <p>
          The key design constraint is attribution. Agents can edit the target
          component, but they cannot rewrite the evaluation harness, change the
          shared training protocol, inflate model capacity, or probe hidden
          settings. Baselines are implemented in the same scaffold, so a score
          gain is measured against methods the task can already express.
        </p>
        <p>
          Scores are normalized per task. The weakest reproduced baseline
          anchors the floor, the strongest reproduced baseline anchors the
          human-SOTA reference, and each method is aggregated across metrics and
          settings. That makes cross-area comparisons possible without hiding
          the fact that raw metrics differ by domain.
        </p>
      </div>

      <Figure
        src={FIGURES.compute}
        alt="Compute profile showing GPU versus CPU tasks and per-task GPU-hour distribution."
        caption="Figure: compute profile for the benchmark. The full suite is intentionally broad, while MLS-Bench-Lite gives a smaller 30-task track for faster iteration."
        narrow
      />

      <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-foreground">
        <h2>Main Result</h2>
        <p>
          The main experiments evaluate Claude Opus 4.6, GPT-5.4, Gemini 3.1
          Pro, DeepSeek-V3.2, and Qwen 3.6 Plus on the full benchmark. Agents
          receive baseline implementations and can make up to three test calls
          before submitting a final result. The paper reports both the first
          proposal, called Vanilla, and the final submitted Agent result.
        </p>
        <p>
          Iteration helps, but mostly by narrowing the gap. The agents often
          improve over their first attempt, yet they do not reliably reach the
          best reproduced human method inside the same controlled scaffold. The
          benchmark is therefore unsaturated in the capability it is designed to
          measure.
        </p>
        <p>
          MLS-Bench-Lite tracks a broader model set on a 30-task subset. It is
          useful for rapid model comparisons, but it keeps the same central
          requirement: the score should reflect a first scientific proposal, not
          an unrestricted engineering search.
        </p>
      </div>

      <Figure
        src={FIGURES.lite}
        alt="MLS-Bench-Lite bar chart ranking models by average normalized score."
        caption="Figure: MLS-Bench-Lite intelligence chart. The Lite track gives a faster view of model progress across the same method-discovery framing."
        wide
      />

      <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-foreground">
        <h2>Why the Controls Matter</h2>
        <p>
          The ablations separate method discovery from easier ways to improve a
          number. When prompts invite engineering optimization, weaker agents
          can gain by tuning, recombining known tricks, or polishing an existing
          implementation. That improvement is real engineering work, but it is
          not the same as discovering a new method.
        </p>
        <p>
          Capacity checks are also necessary. If the task allows a model-size
          increase, some agents exploit the open surface and win by making the
          model larger rather than by improving the algorithm. The controlled
          benchmark closes that route so the remaining gain is tied to the
          intended research axis.
        </p>
        <p>
          Multi-setting evaluation is the other half of the control. A useful
          method should carry from in-domain settings to out-of-distribution
          ones. The benchmark tracks whether iteration improves both, rather
          than only fitting the cases the agent can see.
        </p>
      </div>

      <div className="my-10 grid gap-5 md:grid-cols-3">
        <Figure
          src={FIGURES.ablations}
          alt="Ablation chart comparing scientific innovation and engineering optimization prompts."
          caption="Innovation prompt versus engineering optimization prompt."
        />
        <Figure
          src={FIGURES.hack}
          alt="Ablation chart showing the effect of capacity-budget controls."
          caption="Capacity-budget control blocks model-size shortcuts."
        />
        <Figure
          src={FIGURES.hidden}
          alt="Ablation chart comparing in-distribution and out-of-distribution settings."
          caption="In-domain and OOD settings test whether improvements transfer."
        />
      </div>

      <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-foreground">
        <h2>More Compute Is Not Enough</h2>
        <p>
          Test-time scaling improves simpler tasks for a while. Sampling more
          first proposals or giving the agent more exploration rounds can raise
          the running-best score. But the gains saturate, and harder tasks keep
          a ceiling below human SOTA.
        </p>
        <p>
          Evolutionary search and test-time training expose a sharper failure
          mode under partial feedback. They can preserve or improve in-domain
          scores while damaging OOD settings. That is optimization of the
          observed verifier, not discovery of a method that transfers.
        </p>
      </div>

      <Figure
        src={FIGURES.scaling}
        alt="Test-time scaling chart comparing sampling, exploration, evolution, and training."
        caption="Figure: test-time scaling. Extra inference-time support helps in easier regimes but can overfit in-domain settings when feedback is incomplete."
        wide
      />

      <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-foreground">
        <h2>The Hard Part Is Evidence</h2>
        <p>
          Real ML science is verifier-limited. Running a proxy experiment is not
          the same as establishing that a method scales. MLS-Bench simulates
          this pressure in an adaptive compute-allocation experiment for LLM
          pretraining tasks: agents choose model sizes, token budgets, and how
          to spend limited trials.
        </p>
        <p>
          More freedom does not automatically help. Most agents perform worse
          under the adaptive protocol than under the simpler fixed one. This
          points to a capability gap beyond method proposal: current systems
          struggle to plan informative experiments and convert feedback into
          reliable evidence.
        </p>
      </div>

      <Figure
        src={FIGURES.allocation}
        alt="Adaptive compute-allocation figure showing exploration trajectories and final scores."
        caption="Figure: adaptive compute allocation. Giving agents more experimental choices can lower performance when they lack the judgment to spend compute well."
        wide
      />

      <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-foreground">
        <h2>Context Helps Less Than Expected</h2>
        <p>
          Extra context can help a strong model, but it does not remove the main
          bottleneck. Web search, detailed baseline explanations, and theory
          background produce modest gains, often comparable to ordinary
          iterative refinement.
        </p>
        <p>
          The failure is not simply missing knowledge. The harder step is
          turning context into a hypothesis that is relevant to the scaffold,
          implementable in the allowed edit surface, and robust across
          settings.
        </p>
      </div>

      <Figure
        src={FIGURES.context}
        alt="Context engineering chart comparing web search, baseline context, and theory context."
        caption="Figure: context engineering. Additional information helps selectively, but knowledge access is not the limiting factor by itself."
        narrow
      />

      <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-foreground">
        <h2>What Agents Actually Do</h2>
        <p>
          Expert assessment finds a recurring pattern. Agents often recombine
          ingredients from the baseline implementations they are shown and
          present the recombination as a new method. Truly new mechanisms are
          rarer, and when they appear, the justification for why they should
          work is often thin.
        </p>
        <p>
          Code-similarity analysis supports the same diagnosis. For weaker
          models, performance is strongly tied to resemblance to high-scoring
          baselines. That is useful signal: copying the shape of a strong method
          is a reasonable fallback, but it is not the capability MLS-Bench is
          meant to celebrate.
        </p>
      </div>

      <Figure
        src={FIGURES.innovation}
        alt="Innovation analysis scatter plot comparing baseline similarity weighted performance and agent score."
        caption="Figure: innovation analysis. Lower-performing agents are more likely to track the strong baselines their code resembles."
        narrow
      />

      <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-foreground">
        <h2>Where This Leaves the Benchmark</h2>
        <p>
          MLS-Bench is a measurement tool for a specific gap: turning an idea
          into a reusable machine-learning method. Stronger models, better
          agent harnesses, and self-improving discovery systems should move the
          leaderboard, but the target remains the same: improve the method, keep
          the evaluation fair, and show that the gain survives beyond the first
          setting.
        </p>
        <p>
          The project is maintained as a community platform. The task catalog,
          public repository, dataset, and discussion channel are open so new
          results and future task additions can be compared cumulatively.
        </p>
        <p>
          Continue with the task catalog on the{" "}
          <Link href="/tasks">Tasks page</Link>, or open the{" "}
          <a href={RESOURCE_LINKS.github.href}>GitHub repository</a> for the
          executable benchmark.
        </p>
      </div>
    </article>
  );
}
