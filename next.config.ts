import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/mls-bench-website",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
