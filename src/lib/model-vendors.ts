export interface VendorMeta {
  id: string;
  label: string;
  color: string;
  logo?: string;
}

const VENDORS: Record<string, VendorMeta> = {
  openai: { id: "openai", label: "OpenAI", color: "#10A37F", logo: "/data/vendors/openai.svg" },
  anthropic: { id: "anthropic", label: "Anthropic", color: "#D97757", logo: "/data/vendors/anthropic.svg" },
  google: { id: "google", label: "Google", color: "#4285F4" },
  deepseek: { id: "deepseek", label: "DeepSeek", color: "#4D6BFE", logo: "/data/vendors/deepseek.svg" },
  qwen: { id: "qwen", label: "Qwen", color: "#615CED", logo: "/data/vendors/qwen.svg" },
  moonshot: { id: "moonshot", label: "Moonshot", color: "#1F1F4D", logo: "/data/vendors/kimi.svg" },
  zhipu: { id: "zhipu", label: "Zhipu", color: "#2D2D2D", logo: "/data/vendors/zai.svg" },
  human: { id: "human", label: "Human", color: "#444444" },
  unknown: { id: "unknown", label: "Other", color: "#8a8f98" },
};

export function vendorForModel(modelId: string): VendorMeta {
  const id = modelId.toLowerCase();
  if (id.includes("human")) return VENDORS.human;
  if (id.includes("gpt") || id.includes("openai")) return VENDORS.openai;
  if (id.includes("claude") || id.includes("anthropic")) {
    return VENDORS.anthropic;
  }
  if (id.includes("gemini") || id.includes("google")) return VENDORS.google;
  if (id.includes("deepseek")) return VENDORS.deepseek;
  if (id.includes("qwen")) return VENDORS.qwen;
  if (id.includes("kimi") || id.includes("moonshot")) return VENDORS.moonshot;
  if (id.includes("glm") || id.includes("zhipu")) return VENDORS.zhipu;
  return VENDORS.unknown;
}

export function shortModelName(name: string): string {
  return name
    .replace("Claude ", "")
    .replace("Gemini 3.1 ", "Gemini ")
    .replace("DeepSeek-", "DS-")
    .replace("Qwen ", "Qwen ")
    .replace("Human SOTA", "Human");
}
