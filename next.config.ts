import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow image uploads through server actions (default is 1 MB)
  experimental: { serverActions: { bodySizeLimit: "25mb" } },
};

export default nextConfig;
