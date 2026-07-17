import { vendorForModel } from "@/lib/model-vendors";

interface Props {
  modelId: string;
  size?: number;
  className?: string;
}

/**
 * Vendor logo for a model. Falls back to a colored dot for vendors
 * without an SVG asset in public/data/vendors/.
 */
export default function VendorLogo({ modelId, size = 16, className = "" }: Props) {
  const vendor = vendorForModel(modelId);

  if (vendor.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={vendor.logo}
        alt={vendor.label}
        title={vendor.label}
        width={size}
        height={size}
        className={`shrink-0 ${className}`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={vendor.label}
      title={vendor.label}
      className={`inline-block shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: vendor.color, width: size * 0.6, height: size * 0.6 }}
    />
  );
}
