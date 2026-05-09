import type { ReactNode } from "react";

const SIZE = 64;
const SW = 1.6;

type IconProps = { color: string };
type LandscapeIcon = (props: IconProps) => ReactNode;

const C = {
  navy: "#1f5a86",
  violet: "#6244b0",
  rust: "#a14a2c",
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

const KernelSpeedIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    {Array.from({ length: 4 }, (_, i) =>
      Array.from({ length: 4 }, (_, j) => (
        <rect
          key={`${i}-${j}`}
          x={8 + j * 8}
          y={10 + i * 8}
          width={7}
          height={7}
          stroke={color}
          strokeWidth={0.8}
          strokeOpacity={0.45}
          fill={(i + j) % 3 === 0 ? color : "none"}
          fillOpacity={0.24}
        />
      )),
    )}
    <rect
      x={16}
      y={18}
      width={15}
      height={15}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.16}
    />
    <path d="M39 43 h15" stroke={color} strokeWidth={SW} />
    <path d="M54 43 l-5 -4 m5 4 l-5 4" stroke={color} strokeWidth={SW} />
    <path d="M42 52 C 47 50, 51 47, 55 40" stroke={color} strokeWidth={1} />
  </IconBox>
);

const CircuitIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <path
      d="M8 20 h13 c7 0 12 5 12 12 s-5 12 -12 12 h-13 z"
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.08}
    />
    <path
      d="M38 18 h8 c6 0 10 4 10 9 s-4 9 -10 9 h-8 z"
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.16}
    />
    <line x1={4} y1={26} x2={8} y2={26} stroke={color} strokeWidth={SW} />
    <line x1={4} y1={38} x2={8} y2={38} stroke={color} strokeWidth={SW} />
    <line x1={33} y1={32} x2={38} y2={27} stroke={color} strokeWidth={SW} />
    <line x1={33} y1={32} x2={38} y2={36} stroke={color} strokeWidth={SW} />
    <line x1={56} y1={27} x2={61} y2={27} stroke={color} strokeWidth={SW} />
    <path d="M43 49 h10 M48 44 v10" stroke={color} strokeWidth={1.2} />
  </IconBox>
);

const MathDomainIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    {[
      [12, 11, "A"],
      [36, 11, "G"],
      [24, 36, "C"],
    ].map(([x, y, label]) => (
      <g key={label}>
        <rect
          x={Number(x)}
          y={Number(y)}
          width={18}
          height={18}
          rx={3}
          stroke={color}
          strokeWidth={SW}
          fill={color}
          fillOpacity={0.1}
        />
        <text
          x={Number(x) + 9}
          y={Number(y) + 12}
          fill={color}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize={9}
          textAnchor="middle"
        >
          {label}
        </text>
      </g>
    ))}
    <path d="M30 20 h6 M22 29 l6 8 M42 29 l-7 8" stroke={color} strokeWidth={1} />
    <path d="M15 58 C 28 49, 41 49, 54 58" stroke={color} strokeWidth={1} strokeOpacity={0.55} />
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
      className="relative flex min-h-[132px] overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/30"
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
        className="flex w-[82px] shrink-0 items-center justify-center"
        style={{ color: card.color }}
      >
        <Icon color={card.color} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-3 pr-4">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            {card.name}
          </span>
          <span
            className="font-mono text-[10px] tabular-nums uppercase tracking-wider text-foreground/50"
            aria-hidden="true"
          >
            {card.year}
          </span>
        </div>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-foreground/45">
          {card.scope}
        </p>
        <p className="mt-1.5 text-[12px] leading-snug text-foreground/75">
          {card.description}
        </p>
      </div>
    </div>
  );
}

function LandscapeGallery({
  title,
  intro,
  cards,
  position,
  columns = "md:grid-cols-2",
  children,
}: {
  title: string;
  intro: string;
  cards: LandscapeCardData[];
  position: string;
  columns?: string;
  children?: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-foreground">
        <h3>{title}</h3>
        <p>{intro}</p>
      </div>
      <div className={`not-prose grid gap-3 ${columns}`}>
        {cards.map((card) => (
          <LandscapeCard key={card.name} card={card} />
        ))}
      </div>
      {children}
      <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-foreground">
        <p>{position}</p>
      </div>
    </section>
  );
}

const BENCHMARK_CARDS: LandscapeCardData[] = [
  {
    name: "MLE-Bench",
    year: "2024",
    scope: "75 Kaggle competitions / medals",
    description: "ML engineering breadth, but optimized around one competition instance.",
    icon: KaggleMedalIcon,
    color: C.navy,
  },
  {
    name: "MLE-Dojo",
    year: "2025",
    scope: "200+ ML tasks / H-Rank",
    description: "Interactive engineering workflows, not reusable method discovery.",
    icon: HRankIcon,
    color: C.navy,
  },
  {
    name: "MLAgentBench",
    year: "2023",
    scope: "13 ML experiments / baselines",
    description: "Agent experimentation in compact tasks, with little transfer pressure.",
    icon: ExperimentIcon,
    color: C.navy,
  },
  {
    name: "DiscoveryBench",
    year: "2024",
    scope: "1167 data discoveries / facets",
    description: "Data-driven discovery across domains, not ML method invention.",
    icon: DiscoveryIcon,
    color: C.navy,
  },
  {
    name: "PaperBench",
    year: "2025",
    scope: "20 replications / judge rubric",
    description: "Paper reproduction and scoring, rather than isolated method gains.",
    icon: RubricIcon,
    color: C.navy,
  },
  {
    name: "MLR-Bench",
    year: "2025",
    scope: "201 research workflows / judge",
    description: "Holistic research output, with broad success criteria.",
    icon: WorkflowJudgeIcon,
    color: C.navy,
  },
  {
    name: "AstaBench",
    year: "2025",
    scope: "2400+ assistance tasks / baselines",
    description: "Research-assistance coverage, but only indirect method signal.",
    icon: AssistanceGridIcon,
    color: C.navy,
  },
  {
    name: "HeurekaBench",
    year: "2026",
    scope: "Heuristic discovery / expert tasks",
    description: "Searches for heuristics, not broad ML-science transfer.",
    icon: HeuristicIcon,
    color: C.navy,
  },
];

const EVOLUTION_CARDS: LandscapeCardData[] = [
  {
    name: "AlphaEvolve",
    year: "2025",
    scope: "Programs, kernels, circuits",
    description: "DeepMind tree-search code evolution across narrow optimization modes.",
    icon: EvolutionTreeIcon,
    color: C.violet,
  },
  {
    name: "FunSearch",
    year: "2024",
    scope: "Programs for combinatorial search",
    description: "LLM-guided program search for cap-set and online bin-packing results.",
    icon: ProgramSearchIcon,
    color: C.violet,
  },
  {
    name: "OpenEvolve",
    year: "OSS",
    scope: "Open-source AlphaEvolve loop",
    description: "Community implementation for evolving code against executable scores.",
    icon: OpenLoopIcon,
    color: C.violet,
  },
  {
    name: "ThetaEvolve",
    year: "2025",
    scope: "Test-time training runs",
    description: "Adapts solvers during test time using feedback from open problems.",
    icon: ThetaLoopIcon,
    color: C.violet,
  },
  {
    name: "ShinkaEvolve",
    year: "2025",
    scope: "Programs and discovery loops",
    description: "Self-improving program evolution with sample-efficient iteration.",
    icon: ShinkaLoopIcon,
    color: C.violet,
  },
  {
    name: "AlphaActivation",
    year: "2026",
    scope: "Activation functions",
    description: "Searches activation formulas and tests transfer across model settings.",
    icon: ActivationCurveIcon,
    color: C.violet,
  },
  {
    name: "AVO",
    year: "2026",
    scope: "Execution-grounded operators",
    description: "Evolves variation operators using executable feedback from candidates.",
    icon: VariationOperatorIcon,
    color: C.violet,
  },
  {
    name: "AI Scientist v2",
    year: "2025",
    scope: "Autonomous research loops",
    description: "Sakana's loop spans ideation, experiments, writing, and review.",
    icon: ScientistLoopIcon,
    color: C.violet,
  },
];

const ALPHAEVOLVE_MODE_CARDS: LandscapeCardData[] = [
  {
    name: "Kernel Optimization",
    year: "mode 1",
    scope: "AlphaEvolve kernel-optimization subtask",
    description: "Discovering faster GPU/TPU kernels, including matrix multiplication and FlashAttention.",
    icon: KernelSpeedIcon,
    color: C.rust,
  },
  {
    name: "Circuit / Hardware Design",
    year: "mode 2",
    scope: "AlphaEvolve circuit-design subtask",
    description: "Searching for smaller or faster digital circuits, including TPU multiplier circuits and Strassen-style schemes.",
    icon: CircuitIcon,
    color: C.rust,
  },
  {
    name: "Mathematical Problems",
    year: "mode 3",
    scope: "AlphaEvolve math-discovery subtask",
    description: "Discovering improved bounds across analysis, geometry, and combinatorics.",
    icon: MathDomainIcon,
    color: C.rust,
  },
];

const MATH_SUBDOMAINS = [
  {
    name: "Analysis",
    description: "Autocorrelation inequalities; uncertainty inequalities.",
  },
  {
    name: "Geometry",
    description: "Packing problems; minimum / maximum distance problems.",
  },
  {
    name: "Combinatorics",
    description: "Erdős's minimum-overlap problem; sums and differences of finite sets.",
  },
];

function MathSubdomainCards() {
  return (
    <div className="not-prose grid gap-3 md:grid-cols-3">
      {MATH_SUBDOMAINS.map((item) => (
        <div
          key={item.name}
          className="relative min-h-[92px] overflow-hidden rounded-xl border border-border bg-card"
          style={{
            boxShadow:
              "0 1px 0 rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1"
            style={{ backgroundColor: C.rust }}
          />
          <div className="p-4 pl-5">
            <p className="text-[13px] font-semibold tracking-tight text-foreground">
              {item.name}
            </p>
            <p className="mt-1.5 text-[12px] leading-snug text-foreground/70">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BlogLandscape() {
  return (
    <section className="mt-12 space-y-12" aria-labelledby="related-landscape">
      <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-foreground">
        <h2 id="related-landscape">Related Work / Landscape</h2>
        <p>
          MLS-Bench sits between agentic ML engineering benchmarks, broader
          research-workflow evaluations, and the new wave of self-evolving
          discovery systems. The important distinction is the unit being
          measured: a controlled, transferable ML-science method rather than an
          unrestricted project score.
        </p>
      </div>

      <LandscapeGallery
        title="Existing Benchmark Landscape"
        intro="The neighboring benchmark landscape is rich, but most suites evaluate engineering execution, research assistance, data discovery, or end-to-end replication. Those are useful contexts for MLS-Bench, not substitutes for controlled method discovery."
        cards={BENCHMARK_CARDS}
        position="MLS-Bench keeps the ambition of these evaluations but narrows the artifact: the agent must change a bounded method component and show that the gain survives across settings. That makes attribution and transfer the center of the benchmark rather than a side effect."
      />

      <LandscapeGallery
        title="Self-Evolving and Test-Time-Evolve Systems"
        intro="A parallel cluster is moving quickly: systems that evolve code, kernels, activations, hyperparameters, or whole training runs at test time. So far, these demonstrations are primarily narrow optimization problems: kernel optimization, circuit design, contest-style algorithmic problems, and a handful of math frontier problems."
        cards={EVOLUTION_CARDS}
        position="MLS-Bench is the broad-domain counterpart to this cluster. Evolutionary loops are a promising agent harness, but the benchmark asks whether the evolved artifact is a reusable ML method under controlled, multi-setting evaluation."
      />

      <LandscapeGallery
        title="AlphaEvolve's Three Demonstration Modes"
        intro="AlphaEvolve makes the current self-evolution pattern especially concrete: search over executable code, score candidates, keep the best variants, and repeat. Its demonstrations cluster into three narrow modes."
        cards={ALPHAEVOLVE_MODE_CARDS}
        columns="lg:grid-cols-3"
        position="These modes show why MLS-Bench is a different measurement target. MLS-Bench cares less about whether a loop can optimize a sharp verifier and more about whether the discovered ML method remains useful beyond the first setting."
      >
        <MathSubdomainCards />
      </LandscapeGallery>

      <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-a:text-foreground">
        <p>
          These systems are narrow-domain by construction; MLS-Bench is the
          broad-domain counterpart. It keeps the same pressure for executable
          discovery, but moves the claim from a single optimized score to a
          controlled method that transfers across datasets, seeds,
          environments, model scales, or evaluation settings.
        </p>
      </div>
    </section>
  );
}
