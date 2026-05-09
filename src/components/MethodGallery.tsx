"use client";

import Marquee from "./Marquee";

/* -------------------------------------------------------------------------- */
/* Icon design system                                                         */
/* -------------------------------------------------------------------------- */
/* Every method icon is a 64×64 monoline SVG with stroke-width 1.6 and a      */
/* single accent color. Geometry is purpose-built per method (no generic      */
/* clip-art) but typography, padding, and the surrounding card frame are      */
/* shared so the row reads as a single visual rhythm.                         */
/* -------------------------------------------------------------------------- */

const SIZE = 64;
const SW = 1.6;

type IconProps = { color: string };
type Icon = (props: IconProps) => React.ReactElement;

function Box({ children }: { children: React.ReactNode }) {
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

/* ---- Convolution: kernel sliding over a grid ---------------------------- */
const ConvIcon: Icon = ({ color }) => (
  <Box>
    {/* input grid */}
    {Array.from({ length: 5 }, (_, i) =>
      Array.from({ length: 5 }, (_, j) => (
        <rect
          key={`g-${i}-${j}`}
          x={6 + j * 8}
          y={6 + i * 8}
          width={8}
          height={8}
          stroke={color}
          strokeOpacity={0.32}
          strokeWidth={0.9}
        />
      )),
    )}
    {/* highlighted 3×3 kernel */}
    <rect
      x={14}
      y={14}
      width={24}
      height={24}
      stroke={color}
      strokeWidth={SW + 0.4}
      fill={color}
      fillOpacity={0.12}
    />
    {/* output cell */}
    <rect
      x={48}
      y={28}
      width={10}
      height={10}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.7}
    />
    <path d="M40 33 l6 0" stroke={color} strokeWidth={SW} />
    <path d="M46 33 l-3 -2 m3 2 l-3 2" stroke={color} strokeWidth={SW} />
  </Box>
);

/* ---- BatchNorm: bars normalized to a unit band -------------------------- */
const BatchNormIcon: Icon = ({ color }) => (
  <Box>
    {/* raw bars (varied heights) */}
    {[16, 26, 12, 30, 18].map((h, i) => (
      <rect
        key={i}
        x={6 + i * 6}
        y={48 - h}
        width={4}
        height={h}
        fill={color}
        fillOpacity={0.32}
      />
    ))}
    {/* arrow */}
    <path d="M38 32 l8 0" stroke={color} strokeWidth={SW} />
    <path d="M46 32 l-3 -2 m3 2 l-3 2" stroke={color} strokeWidth={SW} />
    {/* normalized bars (uniform) */}
    {[20, 22, 18, 22, 20].map((h, i) => (
      <rect
        key={i}
        x={48 + i * 3}
        y={48 - h}
        width={2}
        height={h}
        fill={color}
        fillOpacity={0.85}
      />
    ))}
    <line
      x1={48}
      y1={48}
      x2={62}
      y2={48}
      stroke={color}
      strokeWidth={0.8}
      strokeOpacity={0.6}
    />
  </Box>
);

/* ---- LSTM: gated recurrent cell with carry line ------------------------- */
const LstmIcon: Icon = ({ color }) => (
  <Box>
    {/* carry line on top */}
    <line x1={4} y1={16} x2={60} y2={16} stroke={color} strokeWidth={SW} />
    {/* hidden line on bottom */}
    <line
      x1={4}
      y1={50}
      x2={60}
      y2={50}
      stroke={color}
      strokeWidth={SW}
      strokeOpacity={0.55}
    />
    {/* cell body */}
    <rect
      x={20}
      y={22}
      width={24}
      height={22}
      rx={3}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.1}
    />
    {/* gates */}
    <circle cx={26} cy={33} r={2.4} fill={color} fillOpacity={0.85} />
    <circle cx={32} cy={33} r={2.4} fill={color} fillOpacity={0.55} />
    <circle cx={38} cy={33} r={2.4} fill={color} fillOpacity={0.85} />
    {/* taps to carry/hidden */}
    <line x1={32} y1={22} x2={32} y2={16} stroke={color} strokeWidth={SW} />
    <line
      x1={32}
      y1={44}
      x2={32}
      y2={50}
      stroke={color}
      strokeWidth={SW}
      strokeOpacity={0.55}
    />
  </Box>
);

/* ---- Word2Vec: token mapped into vector space --------------------------- */
const Word2VecIcon: Icon = ({ color }) => (
  <Box>
    {/* token */}
    <rect
      x={4}
      y={26}
      width={18}
      height={12}
      rx={2}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.12}
    />
    <path d="M9 32 h8 M9 35 h6" stroke={color} strokeWidth={1} />
    {/* arrow */}
    <path d="M24 32 l6 0" stroke={color} strokeWidth={SW} />
    <path d="M30 32 l-3 -2 m3 2 l-3 2" stroke={color} strokeWidth={SW} />
    {/* embedding axes */}
    <line x1={36} y1={56} x2={60} y2={56} stroke={color} strokeWidth={1} />
    <line x1={36} y1={56} x2={36} y2={32} stroke={color} strokeWidth={1} />
    {/* vector points (semantically clustered) */}
    <circle cx={42} cy={42} r={2} fill={color} />
    <circle cx={46} cy={40} r={2} fill={color} />
    <circle cx={44} cy={45} r={2} fill={color} />
    <circle cx={56} cy={36} r={2} fill={color} fillOpacity={0.55} />
    <circle cx={54} cy={48} r={2} fill={color} fillOpacity={0.55} />
  </Box>
);

/* ---- Dropout: a row of units with some masked --------------------------- */
const DropoutIcon: Icon = ({ color }) => (
  <Box>
    {/* top row */}
    {[0, 1, 2, 3, 4].map((i) => {
      const dropped = i === 1 || i === 3;
      return (
        <circle
          key={`t-${i}`}
          cx={10 + i * 11}
          cy={20}
          r={4}
          stroke={color}
          strokeWidth={SW}
          fill={dropped ? "none" : color}
          fillOpacity={dropped ? 0 : 0.85}
          strokeDasharray={dropped ? "2 2" : undefined}
          opacity={dropped ? 0.5 : 1}
        />
      );
    })}
    {/* bottom row */}
    {[0, 1, 2, 3, 4].map((i) => {
      const dropped = i === 0 || i === 2;
      return (
        <circle
          key={`b-${i}`}
          cx={10 + i * 11}
          cy={48}
          r={4}
          stroke={color}
          strokeWidth={SW}
          fill={dropped ? "none" : color}
          fillOpacity={dropped ? 0 : 0.85}
          strokeDasharray={dropped ? "2 2" : undefined}
          opacity={dropped ? 0.5 : 1}
        />
      );
    })}
    {/* connections (only between active pairs) */}
    {[0, 1, 2, 3, 4].map((i) =>
      [0, 1, 2, 3, 4].map((j) => {
        const tDropped = i === 1 || i === 3;
        const bDropped = j === 0 || j === 2;
        if (tDropped || bDropped) return null;
        return (
          <line
            key={`l-${i}-${j}`}
            x1={10 + i * 11}
            y1={24}
            x2={10 + j * 11}
            y2={44}
            stroke={color}
            strokeWidth={0.6}
            strokeOpacity={0.45}
          />
        );
      }),
    )}
  </Box>
);

/* ---- ResNet: stacked blocks with a skip connection arc ------------------ */
const ResNetIcon: Icon = ({ color }) => (
  <Box>
    {[0, 1, 2].map((i) => (
      <rect
        key={i}
        x={10}
        y={42 - i * 12}
        width={28}
        height={8}
        rx={1.5}
        stroke={color}
        strokeWidth={SW}
        fill={color}
        fillOpacity={i === 1 ? 0.18 : 0.32}
      />
    ))}
    {/* + node */}
    <circle
      cx={48}
      cy={32}
      r={4.5}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.15}
    />
    <line x1={45} y1={32} x2={51} y2={32} stroke={color} strokeWidth={SW} />
    <line x1={48} y1={29} x2={48} y2={35} stroke={color} strokeWidth={SW} />
    {/* main path → + */}
    <line x1={38} y1={32} x2={43.5} y2={32} stroke={color} strokeWidth={SW} />
    {/* skip arc going around blocks */}
    <path
      d="M10 22 C 10 6, 56 6, 56 22 L 56 32"
      stroke={color}
      strokeWidth={SW}
      strokeOpacity={0.85}
      fill="none"
    />
    <line x1={56} y1={32} x2={52.5} y2={32} stroke={color} strokeWidth={SW} />
    <path d="M52.5 32 l3 -2 m-3 2 l3 2" stroke={color} strokeWidth={SW} />
  </Box>
);

/* ---- Adam: descending loss curve with adaptive step --------------------- */
const AdamIcon: Icon = ({ color }) => (
  <Box>
    {/* axes */}
    <line x1={6} y1={56} x2={60} y2={56} stroke={color} strokeWidth={1} />
    <line x1={6} y1={6} x2={6} y2={56} stroke={color} strokeWidth={1} />
    {/* loss curve */}
    <path
      d="M8 14 Q 18 18, 26 30 T 46 50 L 60 52"
      stroke={color}
      strokeWidth={SW}
      fill="none"
    />
    {/* steps along the curve, getting smaller (adaptive) */}
    <circle cx={14} cy={16} r={2.6} fill={color} />
    <circle cx={22} cy={23} r={2.2} fill={color} />
    <circle cx={30} cy={34} r={1.8} fill={color} />
    <circle cx={40} cy={44} r={1.5} fill={color} />
    <circle cx={50} cy={50} r={1.2} fill={color} />
  </Box>
);

/* ---- LayerNorm: per-token normalization across feature axis ------------- */
const LayerNormIcon: Icon = ({ color }) => (
  <Box>
    {/* highlighted row (the "layer") */}
    <rect
      x={4}
      y={26}
      width={56}
      height={12}
      rx={1.5}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.16}
    />
    {/* feature cells inside the highlighted row */}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <rect
        key={i}
        x={7 + i * 7.6}
        y={28.5}
        width={6.5}
        height={7}
        fill={color}
        fillOpacity={0.6 + (i % 3) * 0.1}
      />
    ))}
    {/* other (unnormalized) rows */}
    {[10, 46].map((y, k) => (
      <g key={k} opacity={0.45}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect
            key={i}
            x={7 + i * 7.6}
            y={y}
            width={6.5}
            height={7}
            stroke={color}
            strokeWidth={0.8}
            fill="none"
          />
        ))}
      </g>
    ))}
  </Box>
);

/* ---- Transformer: attention matrix -------------------------------------- */
const TransformerIcon: Icon = ({ color }) => {
  const cells = [
    [0.95, 0.55, 0.2, 0.1, 0.05],
    [0.45, 0.85, 0.55, 0.2, 0.1],
    [0.25, 0.55, 0.85, 0.5, 0.2],
    [0.1, 0.25, 0.55, 0.95, 0.5],
    [0.05, 0.15, 0.3, 0.55, 0.95],
  ];
  return (
    <Box>
      {/* axes brackets */}
      <path d="M6 4 L 4 4 L 4 60 L 6 60" stroke={color} strokeWidth={1} fill="none" />
      <path d="M58 4 L 60 4 L 60 60 L 58 60" stroke={color} strokeWidth={1} fill="none" />
      {cells.map((row, i) =>
        row.map((v, j) => (
          <rect
            key={`${i}-${j}`}
            x={10 + j * 9}
            y={10 + i * 9}
            width={8}
            height={8}
            fill={color}
            fillOpacity={v}
            rx={0.5}
          />
        )),
      )}
    </Box>
  );
};

/* ---- Mixup: two squares overlapping = linear interpolation -------------- */
const MixupIcon: Icon = ({ color }) => (
  <Box>
    {/* λ · A */}
    <rect
      x={10}
      y={14}
      width={28}
      height={28}
      rx={3}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.6}
    />
    {/* (1-λ) · B (offset to overlap A) */}
    <rect
      x={26}
      y={22}
      width={28}
      height={28}
      rx={3}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.25}
    />
    {/* λ label, indicating interpolation */}
    <text
      x={32}
      y={60}
      fontSize={10}
      fill={color}
      textAnchor="middle"
      fontFamily="ui-serif, Georgia, serif"
      fontStyle="italic"
    >
      λ A + (1−λ) B
    </text>
  </Box>
);

/* ---- Knowledge Distillation: large teacher → small student -------------- */
const DistillIcon: Icon = ({ color }) => (
  <Box>
    {/* teacher: large stack */}
    <rect
      x={4}
      y={14}
      width={22}
      height={36}
      rx={2}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.18}
    />
    {[20, 28, 36, 44].map((y, i) => (
      <line
        key={i}
        x1={8}
        y1={y}
        x2={22}
        y2={y}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.6}
      />
    ))}
    {/* arrow */}
    <path d="M28 32 l10 0" stroke={color} strokeWidth={SW} />
    <path d="M38 32 l-3 -2 m3 2 l-3 2" stroke={color} strokeWidth={SW} />
    {/* student: small block */}
    <rect
      x={42}
      y={22}
      width={18}
      height={20}
      rx={2}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.55}
    />
    {[28, 34].map((y, i) => (
      <line
        key={i}
        x1={45}
        y1={y}
        x2={57}
        y2={y}
        stroke="white"
        strokeWidth={1}
        strokeOpacity={0.85}
      />
    ))}
  </Box>
);

/* ---- RMSNorm: vector divided by its RMS magnitude ----------------------- */
const RmsNormIcon: Icon = ({ color }) => (
  <Box>
    {/* x bars */}
    {[18, 28, 14, 32, 22].map((h, i) => (
      <rect
        key={i}
        x={6 + i * 5}
        y={48 - h}
        width={3.5}
        height={h}
        fill={color}
        fillOpacity={0.4}
      />
    ))}
    {/* divider line at RMS */}
    <line
      x1={5}
      y1={28}
      x2={32}
      y2={28}
      stroke={color}
      strokeWidth={1}
      strokeDasharray="3 2"
    />
    {/* arrow */}
    <path d="M36 32 l6 0" stroke={color} strokeWidth={SW} />
    <path d="M42 32 l-3 -2 m3 2 l-3 2" stroke={color} strokeWidth={SW} />
    {/* normalized */}
    {[20, 22, 18, 22, 20].map((h, i) => (
      <rect
        key={i}
        x={46 + i * 3}
        y={48 - h}
        width={2}
        height={h}
        fill={color}
        fillOpacity={0.9}
      />
    ))}
    {/* RMS label tick */}
    <text
      x={38}
      y={20}
      fontSize={7}
      fill={color}
      fontFamily="ui-serif, Georgia, serif"
      fontStyle="italic"
    >
      ÷rms
    </text>
  </Box>
);

/* ---- MoE: a router selecting two experts -------------------------------- */
const MoeIcon: Icon = ({ color }) => (
  <Box>
    {/* router node */}
    <circle
      cx={12}
      cy={32}
      r={5}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.18}
    />
    {/* experts */}
    {[10, 24, 38, 52].map((y, i) => {
      const active = i === 1 || i === 3;
      return (
        <g key={i}>
          <rect
            x={42}
            y={y}
            width={18}
            height={9}
            rx={1.5}
            stroke={color}
            strokeWidth={SW}
            fill={active ? color : "none"}
            fillOpacity={active ? 0.65 : 0}
            opacity={active ? 1 : 0.45}
          />
          <line
            x1={17}
            y1={32}
            x2={42}
            y2={y + 4.5}
            stroke={color}
            strokeWidth={active ? SW : 0.8}
            strokeOpacity={active ? 0.9 : 0.35}
          />
        </g>
      );
    })}
  </Box>
);

/* ---- RoPE: vector rotated by an angle ----------------------------------- */
const RopeIcon: Icon = ({ color }) => (
  <Box>
    {/* unit circle */}
    <circle
      cx={32}
      cy={32}
      r={20}
      stroke={color}
      strokeWidth={SW}
      strokeOpacity={0.85}
      fill={color}
      fillOpacity={0.06}
    />
    {/* axes */}
    <line x1={12} y1={32} x2={52} y2={32} stroke={color} strokeWidth={0.8} strokeOpacity={0.6} />
    <line x1={32} y1={12} x2={32} y2={52} stroke={color} strokeWidth={0.8} strokeOpacity={0.6} />
    {/* original vector (right) */}
    <line x1={32} y1={32} x2={50} y2={32} stroke={color} strokeWidth={SW} strokeOpacity={0.45} />
    {/* rotated vector (up-right) */}
    <line x1={32} y1={32} x2={47} y2={20} stroke={color} strokeWidth={SW + 0.2} />
    <path d="M47 20 l-4 0 m4 0 l0 4" stroke={color} strokeWidth={SW} />
    {/* angle arc */}
    <path
      d="M44 32 A 12 12 0 0 0 41 23"
      stroke={color}
      strokeWidth={1.2}
      fill="none"
      strokeOpacity={0.9}
    />
  </Box>
);

/* ---- LoRA: frozen W + low-rank A·B path --------------------------------- */
const LoraIcon: Icon = ({ color }) => (
  <Box>
    {/* frozen W */}
    <rect
      x={6}
      y={18}
      width={22}
      height={28}
      rx={2}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.14}
    />
    <text
      x={17}
      y={36}
      fontSize={11}
      fill={color}
      textAnchor="middle"
      fontFamily="ui-serif, Georgia, serif"
      fontStyle="italic"
    >
      W
    </text>
    {/* + */}
    <line x1={30} y1={32} x2={36} y2={32} stroke={color} strokeWidth={SW} />
    <line x1={33} y1={29} x2={33} y2={35} stroke={color} strokeWidth={SW} />
    {/* A: tall thin */}
    <rect
      x={38}
      y={22}
      width={6}
      height={20}
      rx={1.5}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.55}
    />
    {/* B: wide short */}
    <rect
      x={46}
      y={28}
      width={14}
      height={6}
      rx={1.5}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.55}
    />
    {/* small label */}
    <text
      x={41}
      y={52}
      fontSize={7}
      fill={color}
      fontFamily="ui-sans-serif, system-ui"
    >
      A
    </text>
    <text
      x={51}
      y={52}
      fontSize={7}
      fill={color}
      fontFamily="ui-sans-serif, system-ui"
    >
      B
    </text>
  </Box>
);

/* ---- FlashAttention: tiled blocks streaming through SRAM ---------------- */
const FlashAttnIcon: Icon = ({ color }) => (
  <Box>
    {/* HBM matrix on the left, lots of small cells */}
    {Array.from({ length: 5 }, (_, i) =>
      Array.from({ length: 4 }, (_, j) => (
        <rect
          key={`h-${i}-${j}`}
          x={4 + j * 6}
          y={6 + i * 10}
          width={5}
          height={9}
          stroke={color}
          strokeWidth={0.8}
          strokeOpacity={0.55}
        />
      )),
    )}
    {/* tile being streamed */}
    <rect
      x={4}
      y={26}
      width={23}
      height={9}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.55}
    />
    {/* streaming arrow */}
    <path d="M30 32 l10 0" stroke={color} strokeWidth={SW} />
    <path d="M40 32 l-3 -2 m3 2 l-3 2" stroke={color} strokeWidth={SW} />
    {/* SRAM block (compact, fast) */}
    <rect
      x={42}
      y={20}
      width={18}
      height={24}
      rx={2}
      stroke={color}
      strokeWidth={SW}
      fill={color}
      fillOpacity={0.18}
    />
    <text
      x={51}
      y={35}
      fontSize={7}
      fill={color}
      textAnchor="middle"
      fontFamily="ui-sans-serif, system-ui"
      fontWeight={600}
    >
      SRAM
    </text>
  </Box>
);

/* ---- GAN: generator + discriminator with feedback loop ----------------- */
const GanIcon: Icon = ({ color }) => (
  <Box>
    {/* G box */}
    <rect x={6} y={20} width={18} height={24} rx={2} stroke={color} strokeWidth={SW} fill={color} fillOpacity={0.15} />
    <text x={15} y={35} fontSize={10} fill={color} textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontStyle="italic" fontWeight={600}>G</text>
    {/* arrow G -> D */}
    <path d="M26 32 l12 0" stroke={color} strokeWidth={SW} />
    <path d="M38 32 l-3 -2 m3 2 l-3 2" stroke={color} strokeWidth={SW} />
    {/* D box */}
    <rect x={40} y={20} width={18} height={24} rx={2} stroke={color} strokeWidth={SW} fill={color} fillOpacity={0.45} />
    <text x={49} y={35} fontSize={10} fill="#fff" textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontStyle="italic" fontWeight={600}>D</text>
    {/* feedback loop D -> G */}
    <path d="M49 20 c 0 -8 -34 -8 -34 0" stroke={color} strokeWidth={SW - 0.4} fill="none" strokeOpacity={0.7} />
    <path d="M15 20 l3 -3 m-3 3 l3 3" stroke={color} strokeWidth={SW - 0.4} strokeOpacity={0.7} />
  </Box>
);

/* ---- U-Net: encoder-bottleneck-decoder with skip connections ----------- */
const UNetIcon: Icon = ({ color }) => (
  <Box>
    {/* Left descending column */}
    <rect x={6}  y={10} width={10} height={10} rx={1.5} stroke={color} strokeWidth={SW} fill={color} fillOpacity={0.18} />
    <rect x={9}  y={22} width={10} height={10} rx={1.5} stroke={color} strokeWidth={SW} fill={color} fillOpacity={0.32} />
    {/* Bottleneck */}
    <rect x={22} y={32} width={20} height={10} rx={1.5} stroke={color} strokeWidth={SW} fill={color} fillOpacity={0.55} />
    {/* Right ascending column */}
    <rect x={45} y={22} width={10} height={10} rx={1.5} stroke={color} strokeWidth={SW} fill={color} fillOpacity={0.32} />
    <rect x={48} y={10} width={10} height={10} rx={1.5} stroke={color} strokeWidth={SW} fill={color} fillOpacity={0.18} />
    {/* Skip connections */}
    <path d="M16 15 l32 0" stroke={color} strokeWidth={SW - 0.4} strokeDasharray="3 3" strokeOpacity={0.75} />
    <path d="M19 27 l26 0" stroke={color} strokeWidth={SW - 0.4} strokeDasharray="3 3" strokeOpacity={0.75} />
  </Box>
);

/* ---- PPO: clipped policy ratio with bracket -------------------------- */
const PpoIcon: Icon = ({ color }) => (
  <Box>
    {/* x-axis */}
    <line x1={6} y1={48} x2={58} y2={48} stroke={color} strokeWidth={0.9} strokeOpacity={0.5} />
    {/* clipped curve: rises, plateaus inside the clip band, then plateaus again */}
    <path d="M6 48 L 18 38 L 28 24 L 36 18 L 44 18 L 58 18" stroke={color} strokeWidth={SW} fill="none" />
    {/* clip band */}
    <rect x={6} y={14} width={52} height={10} rx={2} stroke={color} strokeWidth={0.9} strokeDasharray="3 2" fill={color} fillOpacity={0.08} />
    {/* clip ratio label */}
    <text x={32} y={12} fontSize={7} fill={color} textAnchor="middle" fontFamily="ui-serif, Georgia, serif" fontStyle="italic">1±ε</text>
  </Box>
);

/* ---- DDPM: noise → image denoising trajectory ------------------------ */
const DdpmIcon: Icon = ({ color }) => (
  <Box>
    {/* noise dots cluster on left */}
    {Array.from({ length: 22 }).map((_, i) => {
      const seed = (i * 9301 + 49297) % 233280;
      const x = 4 + ((seed % 16));
      const y = 8 + ((seed >> 4) % 48);
      return <circle key={i} cx={x} cy={y} r={1.2} fill={color} fillOpacity={0.55} />;
    })}
    {/* denoising chain arrows */}
    <path d="M22 32 l8 0" stroke={color} strokeWidth={0.9} strokeOpacity={0.6} />
    <path d="M30 32 l-2 -1.4 m2 1.4 l-2 1.4" stroke={color} strokeWidth={0.9} strokeOpacity={0.6} />
    <path d="M34 32 l8 0" stroke={color} strokeWidth={0.9} strokeOpacity={0.6} />
    <path d="M42 32 l-2 -1.4 m2 1.4 l-2 1.4" stroke={color} strokeWidth={0.9} strokeOpacity={0.6} />
    {/* clean image */}
    <rect x={44} y={18} width={16} height={28} rx={2} stroke={color} strokeWidth={SW} fill={color} fillOpacity={0.22} />
    <circle cx={52} cy={28} r={3.2} stroke={color} strokeWidth={SW - 0.4} fill="none" />
    <path d="M44 40 l6 -6 l5 5 l5 -3 v 10 z" fill={color} fillOpacity={0.55} stroke="none" />
  </Box>
);

/* -------------------------------------------------------------------------- */
/* Method data                                                                */
/* -------------------------------------------------------------------------- */
/* Era is the year the canonical paper landed — gives a sense of how long     */
/* each idea has stood the test of time.                                      */

type Method = {
  name: string;
  era: string;
  description: string;
  icon: Icon;
  color: string;
};

// One palette across light/dark — saturated enough to read, calm enough to
// coexist on the same page. Picked by hand, not from Tailwind defaults, so the
// rhythm matches the rest of the site.
const C = {
  emerald: "#0f7a5e",
  indigo: "#3a4eb1",
  rose: "#a23a5a",
  violet: "#6244b0",
  amber: "#9a6500",
  teal: "#177067",
  navy: "#1f5a86",
  rust: "#a14a2c",
};

const METHODS: Method[] = [
  {
    name: "Convolution",
    era: "1989",
    description: "Weight-shared receptive fields that scaled vision models.",
    icon: ConvIcon,
    color: C.navy,
  },
  {
    name: "LSTM",
    era: "1997",
    description: "Gated recurrence enabling long-range sequence learning.",
    icon: LstmIcon,
    color: C.amber,
  },
  {
    name: "Word2Vec",
    era: "2013",
    description: "Distributed embeddings transferable across NLP tasks.",
    icon: Word2VecIcon,
    color: C.emerald,
  },
  {
    name: "Dropout",
    era: "2014",
    description: "Random unit masking that became the standard regularizer.",
    icon: DropoutIcon,
    color: C.teal,
  },
  {
    name: "GAN",
    era: "2014",
    description: "Adversarial generator–discriminator game for sample synthesis.",
    icon: GanIcon,
    color: C.rust,
  },
  {
    name: "BatchNorm",
    era: "2015",
    description: "Normalizing activations across the batch to stabilize training.",
    icon: BatchNormIcon,
    color: C.rose,
  },
  {
    name: "Adam",
    era: "2015",
    description: "Adaptive moment estimation that became the default optimizer.",
    icon: AdamIcon,
    color: C.indigo,
  },
  {
    name: "ResNet",
    era: "2015",
    description: "Residual connections enabling 100+ layer training.",
    icon: ResNetIcon,
    color: C.emerald,
  },
  {
    name: "U-Net",
    era: "2015",
    description: "Encoder–decoder with skip links — vision and diffusion staple.",
    icon: UNetIcon,
    color: C.teal,
  },
  {
    name: "Transformer",
    era: "2017",
    description: "Self-attention as the universal sequence operator.",
    icon: TransformerIcon,
    color: C.violet,
  },
  {
    name: "PPO",
    era: "2017",
    description: "Clipped policy ratio that made deep RL stable to scale.",
    icon: PpoIcon,
    color: C.amber,
  },
  {
    name: "Mixup",
    era: "2018",
    description: "Input–label interpolation that improved generalization.",
    icon: MixupIcon,
    color: C.rose,
  },
  {
    name: "RMSNorm",
    era: "2019",
    description: "Mean-free normalization, faster and surprisingly sufficient.",
    icon: RmsNormIcon,
    color: C.rust,
  },
  {
    name: "DDPM",
    era: "2020",
    description: "Denoising diffusion: learn to invert a noise process.",
    icon: DdpmIcon,
    color: C.indigo,
  },
  {
    name: "RoPE",
    era: "2021",
    description: "Rotary position encoding that scales with context length.",
    icon: RopeIcon,
    color: C.violet,
  },
  {
    name: "LoRA",
    era: "2021",
    description: "Low-rank adapters for parameter-efficient finetuning.",
    icon: LoraIcon,
    color: C.amber,
  },
  {
    name: "FlashAttention",
    era: "2022",
    description: "IO-aware exact attention that scaled context length.",
    icon: FlashAttnIcon,
    color: C.navy,
  },
];

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

function MethodCard({ method }: { method: Method }) {
  const Icon = method.icon;
  return (
    <div
      className="relative flex h-[112px] w-[298px] shrink-0 overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/30"
      style={{
        boxShadow:
          "0 1px 0 rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {/* accent stripe on the left */}
      <div
        aria-hidden="true"
        className="w-1 shrink-0"
        style={{ backgroundColor: method.color }}
      />
      {/* icon column */}
      <div
        className="flex w-[80px] shrink-0 items-center justify-center"
        style={{ color: method.color }}
      >
        <Icon color={method.color} />
      </div>
      {/* text column */}
      <div className="flex min-w-0 flex-1 flex-col justify-center pr-3.5 py-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            {method.name}
          </span>
          <span
            className="font-mono text-[10px] tabular-nums uppercase tracking-wider text-foreground/50"
            aria-hidden="true"
          >
            {method.era}
          </span>
        </div>
        <p className="mt-1 text-[12px] leading-snug text-foreground/75 line-clamp-2">
          {method.description}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Gallery — two opposite-direction marquees                                   */
/* -------------------------------------------------------------------------- */

export default function MethodGallery() {
  // Split methods into two visually balanced rows, then duplicate each row
  // so the marquee can loop seamlessly. Splitting by even/odd index keeps a
  // mix of categories on each row.
  const rowA = METHODS.filter((_, i) => i % 2 === 0);
  const rowB = METHODS.filter((_, i) => i % 2 === 1);

  return (
    <div className="space-y-3">
      <Marquee duration={95} rowClassName="flex w-max gap-3 px-1">
        {[...rowA, ...rowA].map((m, i) => (
          <MethodCard key={`a-${m.name}-${i}`} method={m} />
        ))}
      </Marquee>
      <Marquee duration={110} reverse rowClassName="flex w-max gap-3 px-1">
        {[...rowB, ...rowB].map((m, i) => (
          <MethodCard key={`b-${m.name}-${i}`} method={m} />
        ))}
      </Marquee>
    </div>
  );
}
