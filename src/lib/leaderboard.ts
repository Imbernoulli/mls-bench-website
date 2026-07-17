import leaderboard from "../../public/data/leaderboard.json";
import { vendorForModel } from "./model-vendors";

/**
 * Human SOTA on the 30-task MLS-Bench-Lite subset, 0-100 scale.
 * Computed 2026-07-06 (Codex session 019f3742, verified again 2026-07-17):
 * per-task Human SOTA = max score over single `baseline:*` records in
 * tasks/<task>/leaderboard.csv via scripts/build_maintab.py::task_scores;
 * value = arithmetic mean over the 30 tasks (0.430098727585 x 100).
 */
export const HUMAN_SOTA_LITE = 43.01;

export interface LeaderboardRow {
  model: string;
  company: string;
  modelOpen: boolean;
  harness: string;
  harnessOpen: boolean;
  performance: number;
}

export interface LeaderboardChartDatum {
  key: string;
  name: string;
  effort: string;
  score: number;
  color: string;
  logo?: string;
  /** Optional vertical gradient stops [top, bottom]; overrides color. */
  gradient?: [string, string];
}

/** All leaderboard rows, best first. */
export function getLeaderboardRows(): LeaderboardRow[] {
  return (leaderboard.rows as LeaderboardRow[])
    .slice()
    .sort((a, b) => b.performance - a.performance);
}

export interface HarnessInfo {
  /** Harness name without the parenthesized part, e.g. "Codex". */
  name: string;
  /** "max" | "xhigh" | null (no effort recorded). */
  effort: string | null;
  /** e.g. "with fallback". */
  note: string | null;
}

/** "Claude Code (max effort, with fallback)" → { name: "Claude Code", effort: "max", note: "with fallback" } */
export function parseHarness(harness: string): HarnessInfo {
  const m = harness.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!m) return { name: harness, effort: null, note: null };
  const inner = m[2].toLowerCase();
  return {
    name: m[1],
    effort: inner.startsWith("max") ? "max" : inner,
    note: inner.includes("fallback") ? "with fallback" : null,
  };
}

/** Mix a 6-digit hex color toward white. f=0 keeps the color, f=1 gives white. */
function tint(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(v + (255 - v) * f);
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * One bar per leaderboard row (including effort variants of the same model).
 * Bars of one model share a color; models of one vendor get progressively
 * lighter tints of the vendor color (the vendor's best model keeps full color).
 * Moonshot bars use a blue-to-black vertical gradient instead of a flat tint.
 */
export function getLeaderboardChartData(): LeaderboardChartDatum[] {
  const rows = getLeaderboardRows();

  const bestByModel = new Map<string, number>();
  for (const row of rows) {
    const best = bestByModel.get(row.model);
    if (best === undefined || row.performance > best) {
      bestByModel.set(row.model, row.performance);
    }
  }

  const modelsByVendor = new Map<string, string[]>();
  for (const model of bestByModel.keys()) {
    const vendorId = vendorForModel(model).id;
    const list = modelsByVendor.get(vendorId) ?? [];
    list.push(model);
    modelsByVendor.set(vendorId, list);
  }

  const tintFactor = (idx: number) =>
    idx === 0 ? 0 : Math.min(0.18 + (idx - 1) * 0.11, 0.38);

  /** Moonshot gradient stops: bright blue at the top, near-black navy at the bottom. */
  const MOONSHOT_GRADIENT: [string, string] = ["#3D6FE8", "#17173D"];

  const colorByModel = new Map<string, string>();
  const gradientByModel = new Map<string, [string, string]>();
  for (const [vendorId, models] of modelsByVendor) {
    models.sort(
      (a, b) => (bestByModel.get(b) ?? 0) - (bestByModel.get(a) ?? 0)
    );
    const base = vendorForModel(models[0]).color;
    models.forEach((model, idx) => {
      const f = tintFactor(idx);
      if (vendorId === "moonshot") {
        gradientByModel.set(model, [
          tint(MOONSHOT_GRADIENT[0], f),
          tint(MOONSHOT_GRADIENT[1], f),
        ]);
        colorByModel.set(model, tint(base, f));
      } else {
        colorByModel.set(model, tint(base, f));
      }
    });
  }

  return rows.map((row) => {
    const harness = parseHarness(row.harness);
    const vendor = vendorForModel(row.model);
    return {
      key: `${row.model}|${row.harness}`,
      name: row.model,
      effort: harness.effort ?? "",
      score: row.performance,
      color: colorByModel.get(row.model) ?? vendor.color,
      logo: vendor.logo,
      gradient: gradientByModel.get(row.model),
    };
  });
}
