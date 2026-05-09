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
    domains: [
      "lh3.googleusercontent.com",
      "localhost",
      process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, "") || "",
      // "/public",
    ],
    qualities: [20, 40, 75, 100],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
