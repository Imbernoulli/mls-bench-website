"use client";

import { useEffect, useRef, type ReactNode } from "react";

const SIZE = 64;
const SW = 1.6;

type IconProps = { color: string };
type LandscapeIcon = (props: IconProps) => ReactNode;

const C = {
  navy: "#1f5a86",
  violet: "#6244b0",
};

function IconBox({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const KaggleMedalIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <rect
      x={7}
      y={10}
      width={32}
      height={28}
      rx={2}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.08}
    />
    {[15, 23, 31].map((y) => (
      <line
        key={y}
        x1={12}
        y1={y}
        x2={34}
        y2={y}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.55}
      />
    ))}
    <path d="M43 20 l5 10 l5 -10" stroke={color} strokeWidth={SW} />
    <circle
      cx={48}
      cy={41}
      r={9}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.18}
    />
    <path d="M44 41 l3 3 l6 -7" stroke={color} strokeWidth={SW} />
  </IconBox>
);

const HRankIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <rect
      x={8}
      y={10}
      width={48}
      height={38}
      rx={3}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.07}
    />
    {[18, 26, 34].map((y, i) => (
      <g key={y}>
        <line
          x1={14}
          y1={y}
          x2={50}
          y2={y}
          stroke={color}
          strokeWidth={1}
          strokeOpacity={0.45 + i * 0.15}
        />
        <circle cx={16 + i * 11} cy={y} r={2.2} fill={color} fillOpacity={0.8} />
      </g>
    ))}
    <text
      x={32}
      y={59}
      fill={color}
      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      fontSize={9}
      textAnchor="middle"
    >
      H-rank
    </text>
  </IconBox>
);

const ExperimentIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <path
      d="M24 9 v17 l-12 20 c-2 4 1 8 5 8 h30 c4 0 7 -4 5 -8 l-12 -20 v-17"
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.08}
    />
    <line x1={20} y1={9} x2={44} y2={9} stroke={color} strokeWidth={SW} />
    <path d="M19 43 h26" stroke={color} strokeWidth={1} strokeOpacity={0.55} />
    {[22, 32, 42].map((x, i) => (
      <circle
        key={x}
        cx={x}
        cy={38 - i * 3}
        r={2}
        fill={color}
        fillOpacity={0.5 + i * 0.15}
      />
    ))}
  </IconBox>
);

const DiscoveryIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    {Array.from({ length: 4 }, (_, i) =>
      Array.from({ length: 4 }, (_, j) => (
        <rect
          key={`${i}-${j}`}
          x={8 + j * 8}
          y={9 + i * 8}
          width={7}
          height={7}
          stroke={color}
          strokeWidth={0.8}
          strokeOpacity={0.5}
          fill={i === 2 && j === 1 ? color : "none"}
          fillOpacity={0.5}
        />
      )),
    )}
    <circle
      cx={42}
      cy={42}
      r={10}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.12}
    />
    <path d="M49 49 l8 8" stroke={color} strokeWidth={SW} />
    <path d="M38 42 h8 M42 38 v8" stroke={color} strokeWidth={1.2} />
  </IconBox>
);

const RubricIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <rect
      x={13}
      y={7}
      width={38}
      height={50}
      rx={3}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.07}
    />
    {[18, 30, 42].map((y, i) => (
      <g key={y}>
        <rect
          x={19}
          y={y - 5}
          width={7}
          height={7}
          rx={1}
          stroke={color}
          strokeWidth={1}
          fill={i < 2 ? color : "none"}
          fillOpacity={0.35}
        />
        <line x1={31} y1={y} x2={45} y2={y} stroke={color} strokeWidth={1} />
      </g>
    ))}
    <path d="M20 18 l2 2 l4 -5" stroke={color} strokeWidth={1.2} />
    <path d="M20 30 l2 2 l4 -5" stroke={color} strokeWidth={1.2} />
  </IconBox>
);

const WorkflowJudgeIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    {[
      [13, 16],
      [32, 12],
      [51, 24],
      [24, 43],
      [46, 48],
    ].map(([x, y], i) => (
      <g key={`${x}-${y}`}>
        <circle
          cx={x}
          cy={y}
          r={5}
          stroke={color}
          strokeWidth={SW}
          fill={color}
          fillOpacity={i === 2 ? 0.5 : 0.12}
        />
      </g>
    ))}
    <path d="M18 15 l9 -2 M37 15 l10 6 M48 29 l-3 14 M41 47 l-12 -3 M22 39 l-7 -18" stroke={color} strokeWidth={1} />
    <path d="M47 24 l3 3 l6 -8" stroke={color} strokeWidth={SW} />
  </IconBox>
);

const AssistanceGridIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    {Array.from({ length: 3 }, (_, i) =>
      Array.from({ length: 3 }, (_, j) => {
        const active = (i + j) % 2 === 0;
        return (
          <rect
            key={`${i}-${j}`}
            x={12 + j * 14}
            y={11 + i * 14}
            width={10}
            height={10}
            rx={2}
            stroke={color}
            strokeWidth={SW}
            fill={active ? color : "none"}
            fillOpacity={active ? 0.22 : 0}
            opacity={active ? 1 : 0.55}
          />
        );
      }),
    )}
    <path d="M10 55 h44" stroke={color} strokeWidth={1} strokeOpacity={0.45} />
    <circle cx={32} cy={55} r={2.2} fill={color} />
  </IconBox>
);

const HeuristicIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <path
      d="M9 49 C 18 30, 23 39, 31 24 S 45 20, 55 9"
      stroke={color}
      strokeWidth={SW}
      fill="none"
    />
    {[10, 24, 38, 52].map((x, i) => (
      <circle
        key={x}
        cx={x}
        cy={49 - i * 12}
        r={3.5}
        stroke={color}
        strokeWidth={SW}
        fill={i === 3 ? color : "white"}
        fillOpacity={i === 3 ? 0.65 : 1}
      />
    ))}
    <path d="M47 10 h10 M52 5 v10" stroke={color} strokeWidth={1.2} />
  </IconBox>
);

const EvolutionTreeIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <rect
      x={7}
      y={8}
      width={22}
      height={14}
      rx={2}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.1}
    />
    <path d="M12 15 h4 m4 0 h4" stroke={color} strokeWidth={1} />
    {[
      [18, 33],
      [37, 32],
      [52, 47],
    ].map(([x, y], i) => (
      <circle
        key={`${x}-${y}`}
        cx={x}
        cy={y}
        r={5}
        stroke={color}
        strokeWidth={SW}
        fill={i === 2 ? color : "none"}
        fillOpacity={i === 2 ? 0.4 : 0}
      />
    ))}
    <path d="M20 22 l-2 6 M29 19 l8 8 M41 36 l8 8" stroke={color} strokeWidth={SW} />
    <path d="M48 47 l3 3 l6 -8" stroke={color} strokeWidth={1.2} />
  </IconBox>
);

const ProgramSearchIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <path
      d="M8 45 C 18 16, 27 50, 39 25 S 52 25, 58 13"
      stroke={color}
      strokeWidth={SW}
      fill="none"
    />
    <circle
      cx={39}
      cy={25}
      r={9}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.08}
    />
    <path d="M46 32 l9 9" stroke={color} strokeWidth={SW} />
    <text
      x={16}
      y={58}
      fill={color}
      fontFamily="ui-serif, Georgia, serif"
      fontSize={10}
      fontStyle="italic"
    >
      f(x)
    </text>
  </IconBox>
);

const OpenLoopIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <path d="M23 18 l-10 14 l10 14" stroke={color} strokeWidth={SW} />
    <path d="M41 18 l10 14 l-10 14" stroke={color} strokeWidth={SW} />
    <path
      d="M20 13 C 36 5, 53 16, 51 32"
      stroke={color}
      strokeWidth={SW}
      fill="none"
    />
    <path d="M51 32 l-3 -4 m3 4 l4 -3" stroke={color} strokeWidth={SW} />
    <path
      d="M44 51 C 28 59, 11 48, 13 32"
      stroke={color}
      strokeWidth={SW}
      fill="none"
      strokeOpacity={0.65}
    />
    <path d="M13 32 l3 4 m-3 -4 l-4 3" stroke={color} strokeWidth={SW} strokeOpacity={0.65} />
  </IconBox>
);

const ThetaLoopIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <circle
      cx={32}
      cy={32}
      r={18}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.08}
    />
    <line x1={17} y1={32} x2={47} y2={32} stroke={color} strokeWidth={SW} />
    <path
      d="M50 18 C 58 29, 56 45, 44 52"
      stroke={color}
      strokeWidth={SW}
      fill="none"
    />
    <path d="M44 52 l5 0 m-5 0 l2 -5" stroke={color} strokeWidth={SW} />
    <path d="M14 46 C 6 35, 8 19, 20 12" stroke={color} strokeWidth={SW} strokeOpacity={0.6} />
    <path d="M20 12 l-5 0 m5 0 l-2 5" stroke={color} strokeWidth={SW} strokeOpacity={0.6} />
  </IconBox>
);

const ShinkaLoopIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <path
      d="M32 53 C 18 47, 17 31, 30 28 C 43 25, 46 12, 31 9"
      stroke={color}
      strokeWidth={SW}
      fill="none"
    />
    <path
      d="M31 9 C 52 12, 57 38, 38 47"
      stroke={color}
      strokeWidth={SW}
      fill="none"
      strokeOpacity={0.65}
    />
    {[31, 30, 38].map((x, i) => (
      <circle
        key={i}
        cx={x}
        cy={[9, 28, 47][i]}
        r={3.5}
        fill={color}
        fillOpacity={0.45 + i * 0.15}
      />
    ))}
    <path d="M38 47 l5 1 m-5 -1 l3 -4" stroke={color} strokeWidth={SW} strokeOpacity={0.65} />
  </IconBox>
);

const ActivationCurveIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <line x1={9} y1={52} x2={57} y2={52} stroke={color} strokeWidth={1} />
    <line x1={17} y1={58} x2={17} y2={8} stroke={color} strokeWidth={1} />
    <path
      d="M10 49 C 22 49, 25 43, 29 32 S 39 13, 56 13"
      stroke={color}
      strokeWidth={SW}
      fill="none"
    />
    <path
      d="M10 37 C 26 37, 30 33, 35 27 S 45 19, 56 19"
      stroke={color}
      strokeWidth={SW}
      strokeOpacity={0.45}
      fill="none"
    />
    <circle cx={35} cy={27} r={3} fill={color} fillOpacity={0.8} />
  </IconBox>
);

const VariationOperatorIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <rect
      x={8}
      y={12}
      width={16}
      height={16}
      rx={2}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.12}
    />
    <rect
      x={8}
      y={38}
      width={16}
      height={16}
      rx={2}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.12}
    />
    <circle
      cx={48}
      cy={33}
      r={10}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.28}
    />
    <path d="M24 20 l14 9 M24 46 l14 -9" stroke={color} strokeWidth={SW} />
    <path d="M44 33 h8 M48 29 v8" stroke="white" strokeWidth={1.2} strokeOpacity={0.9} />
    <path d="M38 54 l4 4 l8 -12" stroke={color} strokeWidth={SW} />
  </IconBox>
);

const ScientistLoopIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <rect
      x={13}
      y={10}
      width={27}
      height={36}
      rx={3}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.08}
    />
    <line x1={18} y1={19} x2={34} y2={19} stroke={color} strokeWidth={1} />
    <line x1={18} y1={26} x2={35} y2={26} stroke={color} strokeWidth={1} />
    <line x1={18} y1={33} x2={30} y2={33} stroke={color} strokeWidth={1} />
    <path
      d="M43 16 C 55 21, 56 39, 45 47"
      stroke={color}
      strokeWidth={SW}
      fill="none"
    />
    <path d="M45 47 l5 0 m-5 0 l2 -5" stroke={color} strokeWidth={SW} />
    <path d="M19 51 h26" stroke={color} strokeWidth={1} strokeOpacity={0.5} />
    <circle cx={48} cy={31} r={3} fill={color} fillOpacity={0.7} />
  </IconBox>
);

type LandscapeCardData = {
  name: string;
  year: string;
  scope: string;
  description: string;
  icon: LandscapeIcon;
  color: string;
};

function LandscapeCard({ card }: { card: LandscapeCardData }) {
  const Icon = card.icon;

  return (
    <div
      className="relative flex w-[300px] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/30"
      style={{
        boxShadow:
          "0 1px 0 rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div
        aria-hidden="true"
        className="w-1 shrink-0"
        style={{ backgroundColor: card.color }}
      />
      <div
        className="flex w-[78px] shrink-0 items-center justify-center"
        style={{ color: card.color }}
      >
        <Icon color={card.color} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-3 pr-4">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[14px] font-semibold tracking-tight text-foreground">
            {card.name}
          </span>
          <span
            className="shrink-0 font-mono text-[10px] tabular-nums uppercase tracking-wider text-foreground/50"
            aria-hidden="true"
          >
            {card.year}
          </span>
        </div>
        <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-wide text-foreground/45">
          {card.scope}
        </p>
        <p className="mt-1.5 text-[12px] leading-snug text-foreground/75">
          {card.description}
        </p>
      </div>
    </div>
  );
}

function HorizontalStrip({
  title,
  intro,
  cards,
}: {
  title: string;
  intro: ReactNode;
  cards: LandscapeCardData[];
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let isDragging = false;
    let didMove = false;
    let startX = 0;
    let startScrollLeft = 0;
    let activePointerId: number | null = null;

    const begin = (e: PointerEvent) => {
      // Only mouse drag; let touch use native scroll/swipe.
      if (e.pointerType !== "mouse") return;
      isDragging = true;
      didMove = false;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      activePointerId = e.pointerId;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      el.style.cursor = "grabbing";
    };

    const move = (e: PointerEvent) => {
      if (!isDragging || e.pointerId !== activePointerId) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) didMove = true;
      el.scrollLeft = startScrollLeft - dx;
    };

    const end = (e: PointerEvent) => {
      if (!isDragging || e.pointerId !== activePointerId) return;
      isDragging = false;
      activePointerId = null;
      el.style.cursor = "grab";
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      // Suppress click that follows a drag (so cards don't trigger after a swipe).
      if (didMove) {
        const blockClick = (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
          el.removeEventListener("click", blockClick, true);
        };
        el.addEventListener("click", blockClick, true);
      }
    };

    el.addEventListener("pointerdown", begin);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);

    return () => {
      el.removeEventListener("pointerdown", begin);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-[14px] leading-relaxed text-foreground/70">
          {intro}
        </p>
      </div>
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--background), transparent)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10"
          style={{
            backgroundImage:
              "linear-gradient(to left, var(--background), transparent)",
          }}
        />
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden pb-3 select-none"
          style={{
            cursor: "grab",
            scrollbarWidth: "thin",
            scrollPaddingLeft: "0.25rem",
            scrollPaddingRight: "0.25rem",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {cards.map((card) => (
            <LandscapeCard key={card.name} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}

const BENCHMARK_CARDS: LandscapeCardData[] = [
  {
    name: "MLE-Bench",
    year: "2024",
    scope: "75 Kaggle competitions / medals",
    description:
      "ML engineering breadth, but optimized around one competition instance.",
    icon: KaggleMedalIcon,
    color: C.navy,
  },
  {
    name: "MLE-Dojo",
    year: "2025",
    scope: "200+ ML tasks / H-Rank",
    description:
      "Interactive engineering workflows, not reusable method discovery.",
    icon: HRankIcon,
    color: C.navy,
  },
  {
    name: "MLAgentBench",
    year: "2023",
    scope: "13 ML experiments / baselines",
    description:
      "Agent experimentation in compact tasks, with little transfer pressure.",
    icon: ExperimentIcon,
    color: C.navy,
  },
  {
    name: "DiscoveryBench",
    year: "2024",
    scope: "1167 data discoveries / facets",
    description:
      "Data-driven discovery across domains, not ML method invention.",
    icon: DiscoveryIcon,
    color: C.navy,
  },
  {
    name: "PaperBench",
    year: "2025",
    scope: "20 replications / judge rubric",
    description:
      "Paper reproduction and rubric scoring, not isolated method gains.",
    icon: RubricIcon,
    color: C.navy,
  },
  {
    name: "MLR-Bench",
    year: "2025",
    scope: "201 research workflows / judge",
    description:
      "Holistic research output, with broad and lenient success criteria.",
    icon: WorkflowJudgeIcon,
    color: C.navy,
  },
  {
    name: "AstaBench",
    year: "2025",
    scope: "2400+ assistance tasks",
    description:
      "Research-assistance coverage, but only an indirect signal on methods.",
    icon: AssistanceGridIcon,
    color: C.navy,
  },
  {
    name: "HeurekaBench",
    year: "2026",
    scope: "Heuristic-discovery tasks",
    description:
      "Searches for heuristics on expert problems, not broad ML transfer.",
    icon: HeuristicIcon,
    color: C.navy,
  },
];

const EVOLUTION_CARDS: LandscapeCardData[] = [
  {
    name: "AlphaEvolve",
    year: "2025",
    scope: "Programs · kernels · circuits · math",
    description:
      "DeepMind's tree-search code evolution, demonstrated on GPU/TPU kernels, TPU multiplier circuits, and math frontier problems.",
    icon: EvolutionTreeIcon,
    color: C.violet,
  },
  {
    name: "FunSearch",
    year: "2024",
    scope: "Programs for combinatorial search",
    description:
      "LLM-guided program search; new lower bounds on cap-set and online bin-packing.",
    icon: ProgramSearchIcon,
    color: C.violet,
  },
  {
    name: "OpenEvolve",
    year: "OSS",
    scope: "Open-source AlphaEvolve loop",
    description:
      "Community implementation evolving code against an executable scorer.",
    icon: OpenLoopIcon,
    color: C.violet,
  },
  {
    name: "ThetaEvolve",
    year: "2025",
    scope: "Test-time training runs",
    description:
      "Adapts solvers during test time using executable feedback on open problems.",
    icon: ThetaLoopIcon,
    color: C.violet,
  },
  {
    name: "ShinkaEvolve",
    year: "2025",
    scope: "Programs · sample-efficient evolution",
    description:
      "Self-improving program evolution focused on cheaper iteration steps.",
    icon: ShinkaLoopIcon,
    color: C.violet,
  },
  {
    name: "AlphaActivation",
    year: "2026",
    scope: "Activation functions",
    description:
      "Searches activation formulas and tests how well they transfer across model settings.",
    icon: ActivationCurveIcon,
    color: C.violet,
  },
  {
    name: "AVO",
    year: "2026",
    scope: "Execution-grounded operators",
    description:
      "Evolves variation operators using executable feedback from candidate runs.",
    icon: VariationOperatorIcon,
    color: C.violet,
  },
  {
    name: "AI Scientist v2",
    year: "2025",
    scope: "Autonomous research loops",
    description:
      "Sakana's loop spans ideation, experiments, writing, and self-review on small studies.",
    icon: ScientistLoopIcon,
    color: C.violet,
  },
];

export default function BlogLandscape() {
  return (
    <section
      className="not-prose mt-10 mb-12 space-y-10"
      aria-labelledby="background-landscape"
    >
      <div className="space-y-3">
        <h2
          id="background-landscape"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          Background &amp; Motivation
        </h2>
        <p className="text-[15px] leading-relaxed text-foreground/75">
          MLS-Bench sits between two crowded landscapes. On one side, agentic
          ML benchmarks that score engineering execution on a single dataset.
          On the other, the rapidly-growing self-evolve cluster &mdash; systems
          that search over executable artifacts at test time. Neither
          measures what we actually care about: a controlled, transferable ML
          method.
        </p>
      </div>

      <HorizontalStrip
        title="Existing ML Benchmarks"
        intro="The neighborhood is rich, but most suites evaluate engineering execution, research assistance, end-to-end replication, or data discovery — not the atomic step of inventing a method that survives outside the setting it was tuned in."
        cards={BENCHMARK_CARDS}
      />

      <HorizontalStrip
        title="The Self-Evolve Wave Is Hot — But Narrow"
        intro={
          <>
            Self-evolve is the hottest agent-research direction this cycle.
            AlphaEvolve, FunSearch, ShinkaEvolve, OpenEvolve, ThetaEvolve, AVO,
            AlphaActivation, and Sakana&apos;s AI Scientist all share one
            shape: search over executable artifacts, score, keep the best,
            repeat. But the headline demonstrations cluster into a handful of
            narrow, abstract targets &mdash; GPU/TPU kernel optimization,
            digital-circuit design, contest-style algorithmic problems, and a
            small set of math frontier problems (autocorrelation and
            uncertainty inequalities; packing and minimum / maximum distance
            problems; Erdős&apos;s minimum-overlap problem; sums and
            differences of finite sets). Broad ML method discovery &mdash; the
            kind that ships across datasets, seeds, and model scales &mdash;
            is conspicuously absent.
          </>
        }
        cards={EVOLUTION_CARDS}
      />

      <p className="text-[15px] leading-relaxed text-foreground/75">
        That gap is the motivation for MLS-Bench. We keep the executable,
        agentic shape these systems pioneered, but move the target from
        optimizing one sharp verifier to discovering ML methods that transfer
        across datasets, seeds, environments, and model scales &mdash; the
        atomic unit of real ML science progress.
      </p>
    </section>
  );
}
