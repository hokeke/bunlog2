import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/bunlog2",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
