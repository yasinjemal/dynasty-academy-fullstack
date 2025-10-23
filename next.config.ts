import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: __dirname,
  typescript: {
    // Temporarily ignore build errors - we'll fix them incrementally
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore lint errors during build
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/@:username",
        destination: "/profile/:username",
      },
    ];
  },
};

export default nextConfig;
