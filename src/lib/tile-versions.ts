export const TILE_COLUMN_VERSION: "v1" | "v2" | "v3" | "v4" | "v5" = "v2";
export const TILE_CARD_VERSION: "v1" | "v2" | "v3" | "v4" | "v5" = "v2";

export function tileSrc(taskId: string, role: "column" | "card"): string {
  const v = role === "column" ? TILE_COLUMN_VERSION : TILE_CARD_VERSION;
  return `/data/task_tiles_${v}/${taskId}.png`;
}
