import { vendorForModel } from "@/lib/model-vendors";

interface Props {
  modelId: string;
  className?: string;
}

export default function ModelVendorMark({ modelId, className = "" }: Props) {
  const vendor = vendorForModel(modelId);

  return (
    <span
      aria-label={vendor.label}
      title={vendor.label}
      className={`inline-block h-3 w-3 shrink-0 rounded-[3px] ${className}`}
      style={{ backgroundColor: vendor.color }}
    />
  );
}
