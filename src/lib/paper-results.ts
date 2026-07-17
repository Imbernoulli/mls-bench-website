import categoryPerformance from "../../public/data/category_performance.json";
import models from "../../public/data/models.json";
import type { StandardModel } from "@/lib/types";

export const HUMAN_SOTA_ID = "human-sota";

export interface ChartSeries {
  id: string;
  name: string;
  color: string;
}

export function getCategoryPerformanceStatic(): {
  series: ChartSeries[];
  data: Record<string, string | number>[];
} {
  const colorByModel = new Map(
    (models as StandardModel[]).map((model) => [model.id, model.color])
  );
  const series = categoryPerformance.series.map((item) => ({
    ...item,
    color:
      item.id === HUMAN_SOTA_ID
        ? "#444444"
        : colorByModel.get(item.id) ?? "#777777",
  }));
  const data = categoryPerformance.data as Record<string, string | number>[];

  return { series, data };
}
