"use client";

import { useEffect, useRef, type ReactNode } from "react";

const SIZE = 64;
const SW = 1.6;

type IconProps = { color: string };
type LandscapeIcon = (props: IconProps) => ReactNode;

const C = {
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

const CirclePackingIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <rect
      x={6}
      y={6}
      width={52}
      height={52}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.04}
    />
    {[
      [13, 14],
      [25, 14],
      [37, 14],
      [49, 14],
      [13, 26],
      [25, 26],
      [37, 26],
      [49, 26],
      [13, 38],
      [25, 38],
      [37, 38],
    ].map(([cx, cy], i) => (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={6}
        stroke={color}
        strokeWidth={1.4}
        fill={color}
        fillOpacity={0.22}
      />
    ))}
  </IconBox>
);

const MatMulSchemeIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    {[
      [8, 8],
      [16, 8],
      [8, 16],
      [16, 16],
    ].map(([x, y], i) => (
      <rect
        key={`a-${i}`}
        x={x}
        y={y}
        width={7}
        height={7}
        stroke={color}
        strokeWidth={1.4}
        fill={color}
        fillOpacity={0.18}
      />
    ))}
    <text
      x={28}
      y={20}
      fontFamily="ui-serif, Georgia, serif"
      fontSize={11}
      textAnchor="middle"
      fill={color}
      fillOpacity={0.85}
    >
      ×
    </text>
    {[
      [33, 8],
      [41, 8],
      [33, 16],
      [41, 16],
    ].map(([x, y], i) => (
      <rect
        key={`b-${i}`}
        x={x}
        y={y}
        width={7}
        height={7}
        stroke={color}
        strokeWidth={1.4}
        fill={color}
        fillOpacity={0.18}
      />
    ))}
    <path d="M32 30 v8" stroke={color} strokeWidth={1.4} fill="none" />
    <path d="M28 35 l4 4 l4 -4" stroke={color} strokeWidth={1.4} fill="none" />
    <text
      x={32}
      y={58}
      fontFamily="ui-serif, Georgia, serif"
      fontSize={20}
      textAnchor="middle"
      fill={color}
      fontWeight={700}
    >
      7×
    </text>
  </IconBox>
);

const KernelTileIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    {Array.from({ length: 5 }, (_, i) =>
      Array.from({ length: 5 }, (_, j) => (
        <rect
          key={`${i}-${j}`}
          x={6 + j * 10}
          y={6 + i * 10}
          width={9.5}
          height={9.5}
          stroke={color}
          strokeWidth={0.7}
          strokeOpacity={0.5}
          fill="none"
        />
      )),
    )}
    <rect
      x={6}
      y={6}
      width={19.5}
      height={19.5}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.28}
    />
    <path d="M44 56 h12" stroke={color} strokeWidth={SW} />
    <path d="M52 53 l4 3 l-4 3" stroke={color} strokeWidth={SW} fill="none" />
  </IconBox>
);

const CircuitGateIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <line x1={3} y1={14} x2={14} y2={14} stroke={color} strokeWidth={SW} />
    <line x1={3} y1={26} x2={14} y2={26} stroke={color} strokeWidth={SW} />
    <path
      d="M14 8 L24 8 A12 12 0 0 1 24 32 L14 32 Z"
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.12}
    />
    <line x1={36} y1={20} x2={42} y2={20} stroke={color} strokeWidth={SW} />
    <line x1={42} y1={20} x2={42} y2={40} stroke={color} strokeWidth={SW} />
    <line x1={3} y1={52} x2={42} y2={52} stroke={color} strokeWidth={SW} />
    <path
      d="M42 36 L50 36 A10 10 0 0 1 50 56 L42 56 Z"
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.18}
    />
    <line x1={60} y1={46} x2={63} y2={46} stroke={color} strokeWidth={SW} />
  </IconBox>
);

const BinPackingIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    <path
      d="M8 12 L8 56 L24 56 L24 12"
      stroke={color}
      strokeWidth={SW}
      fill="none"
    />
    <rect x={9} y={42} width={14} height={13} fill={color} fillOpacity={0.4} />
    <rect x={9} y={30} width={14} height={11} fill={color} fillOpacity={0.55} />
    <rect x={9} y={22} width={14} height={7} fill={color} fillOpacity={0.7} />
    <path
      d="M28 12 L28 56 L44 56 L44 12"
      stroke={color}
      strokeWidth={SW}
      fill="none"
    />
    <rect x={29} y={36} width={14} height={19} fill={color} fillOpacity={0.4} />
    <rect x={29} y={26} width={14} height={9} fill={color} fillOpacity={0.6} />
    <rect
      x={50}
      y={20}
      width={10}
      height={10}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.7}
    />
    <line x1={48} y1={25} x2={45} y2={25} stroke={color} strokeWidth={SW} />
    <path d="M45 22 l-3 3 l3 3" stroke={color} strokeWidth={SW} fill="none" />
  </IconBox>
);

const CapSetIcon: LandscapeIcon = ({ color }) => (
  <IconBox>
    {Array.from({ length: 5 }, (_, i) =>
      Array.from({ length: 5 }, (_, j) => {
        const isCap =
          (i === 0 && j === 1) ||
          (i === 1 && j === 3) ||
          (i === 2 && j === 0) ||
          (i === 3 && j === 2) ||
          (i === 4 && j === 4);
        return (
          <circle
            key={`${i}-${j}`}
            cx={10 + j * 11}
            cy={10 + i * 11}
            r={isCap ? 3.5 : 1.6}
            stroke={color}
            strokeWidth={isCap ? SW : 0.6}
            strokeOpacity={isCap ? 1 : 0.4}
            fill={isCap ? color : "none"}
            fillOpacity={isCap ? 0.85 : 0}
          />
        );
      }),
    )}
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

const TASK_CARDS: LandscapeCardData[] = [
  {
    name: "Circle Packing",
    year: "2025",
    scope: "AlphaEvolve · pack N in a square",
    description:
      "Find a tighter packing of N equal circles in the unit square. Headline result: a slightly improved arrangement for n=11.",
    icon: CirclePackingIcon,
    color: C.rust,
  },
  {
    name: "2×2 Matmul Scheme",
    year: "2025",
    scope: "AlphaEvolve · scalar multiplications",
    description:
      "Multiply two 2×2 matrices in fewer than 8 elementary multiplications. Strassen reached 7 in 1969; the agent matched it.",
    icon: MatMulSchemeIcon,
    color: C.rust,
  },
  {
    name: "Matmul GPU Kernel",
    year: "2025",
    scope: "AlphaEvolve · one tile, one accelerator",
    description:
      "Discover a faster low-level kernel for one fixed tile size on one accelerator (e.g. a FlashAttention building block).",
    icon: KernelTileIcon,
    color: C.rust,
  },
  {
    name: "TPU Multiplier Circuit",
    year: "2025",
    scope: "AlphaEvolve · fixed bit-width",
    description:
      "Search for a smaller arithmetic circuit on one chip at a fixed bit-width, scored by gate / transistor count.",
    icon: CircuitGateIcon,
    color: C.rust,
  },
  {
    name: "Online Bin Packing",
    year: "2024",
    scope: "FunSearch · worst-case ratio",
    description:
      "Place arriving items into the fewest bins; tighten a small constant in the worst-case ratio of an online heuristic.",
    icon: BinPackingIcon,
    color: C.rust,
  },
  {
    name: "Cap Sets in F₃ⁿ",
    year: "2024",
    scope: "FunSearch · combinatorial bound",
    description:
      "Find a larger subset of {0,1,2}ⁿ with no 3-term arithmetic progression. New lower bound on a single combinatorial constant.",
    icon: CapSetIcon,
    color: C.rust,
  },
];

export default function BlogLandscape() {
  return (
    <section
      className="not-prose mt-12 mb-14 space-y-10"
      aria-labelledby="landscape-where"
    >
      <div className="space-y-3">
        <h2
          id="landscape-where"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          What the Field Is Actually Working On
        </h2>
        <p className="text-[15px] leading-relaxed text-foreground/75">
          One direction in agent research is conspicuously crowded right now:
          self-evolve. Search over executable artifacts, score the outputs,
          keep the best ones, repeat. Almost every recent &quot;AI discovers&quot;
          headline comes out of some version of this loop. The shape is real
          and the wins are real &mdash; the question is what the wins have
          actually been wins on.
        </p>
      </div>

      <HorizontalStrip
        title="The Self-Evolve Wave Everyone Is Riding"
        intro="A non-exhaustive snapshot of the systems in this cluster. Every one of them shares the same loop, and most of them cite each other in the same papers. Listed in no particular order."
        cards={EVOLUTION_CARDS}
      />

      <HorizontalStrip
        title="…And What Those Wins Are Actually On"
        intro="Run down the headline results from this cluster and a pattern jumps out. Pack circles in a square. Save one multiplication on 2×2 matmul. Trim a constant in an online bin-packing heuristic. Find a slightly larger cap set. Nudge a kernel or a multiplier circuit on one specific chip. They are exactly the right shape for an executable verifier — sharp, scalar, low-dimensional — and exactly the wrong shape for a claim about ML science."
        cards={TASK_CARDS}
      />

      <p className="text-[15px] leading-relaxed text-foreground/75">
        That is the gap MLS-Bench is built for. The executable, agentic shape
        these systems pioneered is genuinely powerful, but applying it to
        circle packing or 2&times;2 matmul schemes is not the same thing as
        discovering an ML method. MLS-Bench keeps the harness and moves the
        target: discover a real ML-science change &mdash; a model component,
        objective, optimizer, or training procedure &mdash; that survives
        across datasets, seeds, environments, and model scales.
      </p>
    </section>
  );
}
