import type { StandardModel } from "./types";

export const BASELINE_COLOR = "#8a8f98";

export const CATEGORY_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  "language-models": { bg: "#eaf7f2", text: "#0b684f", border: "#b9e5d6" },
  "ai-for-science": { bg: "#fff3dc", text: "#8a5200", border: "#f6d59b" },
  "reinforcement-learning": { bg: "#e8f0ff", text: "#244b9a", border: "#b9ccff" },
  robotics: { bg: "#f7ece5", text: "#9a4b2f", border: "#e7c4b3" },
  "optimization-and-theory": {
    bg: "#f0f4e8",
    text: "#516b18",
    border: "#cbdba5",
  },
  "classical-and-adaptive-learning": {
    bg: "#eef8e9",
    text: "#2f6e24",
    border: "#bfe2b2",
  },
  "trustworthy-learning": { bg: "#ffecee", text: "#9a2437", border: "#f4b7c0" },
  "deep-learning": { bg: "#edf2f7", text: "#344658", border: "#cad6e3" },
  "time-series-and-forecasting": {
    bg: "#e8f7f6",
    text: "#176662",
    border: "#b8e0dd",
  },
  "structured-and-causal-reasoning": {
    bg: "#f1edff",
    text: "#5944a3",
    border: "#cec2f8",
  },
  "vision-and-generation": { bg: "#fff0f7", text: "#8b3362", border: "#efbfd7" },
  "ml-systems-and-efficient-ml": {
    bg: "#edf6ff",
    text: "#245d86",
    border: "#bdddf4",
  },
  demo: { bg: "#f5f5f5", text: "#555555", border: "#d7d7d7" },
};

export function categoryStyle(categoryId: string) {
  return (
    CATEGORY_STYLES[categoryId] ?? {
      bg: "#f4f4f5",
      text: "#52525b",
      border: "#d4d4d8",
    }
  );
}

export function metricLabel(metric: string): string {
  return metric
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bPpl\b/g, "PPL")
    .replace(/\bFid\b/g, "FID")
    .replace(/\bRfid\b/g, "rFID")
    .replace(/\bSsim\b/g, "SSIM")
    .replace(/\bPsnr\b/g, "PSNR")
    .replace(/\bLpips\b/g, "LPIPS")
    .replace(/\bMse\b/g, "MSE")
    .replace(/\bMae\b/g, "MAE");
}

export function modelDisplayName(model: string, models: StandardModel[]): string {
  if (model.startsWith("baseline:")) return model.replace("baseline:", "");
  if (model.startsWith("vanilla:")) {
    const id = model.replace("vanilla:", "");
    return `${models.find((m) => m.id === id)?.name ?? id} Vanilla`;
  }
  return models.find((m) => m.id === model)?.name ?? model;
}

/** Resolve any model alias (e.g. "anthropic/claude-opus-4.6") to its
 *  canonical models.json entry. Returns null if no match — callers
 *  filter unknowns out of the main-model views. */
export function resolveCanonicalModel(
  raw: string,
  models: StandardModel[]
): StandardModel | null {
  const lower = raw.toLowerCase();
  for (const m of models) {
    if (m.id.toLowerCase() === lower) return m;
    if ((m.aliases ?? []).some((a) => a.toLowerCase() === lower)) return m;
  }
  return null;
}

export function modelColor(model: string, models: StandardModel[]): string {
  if (model.startsWith("baseline:")) return BASELINE_COLOR;
  const id = model.startsWith("vanilla:") ? model.replace("vanilla:", "") : model;
  return models.find((m) => m.id === id)?.color ?? BASELINE_COLOR;
}
