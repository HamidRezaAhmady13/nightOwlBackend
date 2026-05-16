import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingRoot: __dirname,
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
      allowedOrigins: ["*"],
    },
  },
  images: {
    qualities: [20, 40, 75, 100],
    unoptimized: true,
  },
};

export default nextConfig;
