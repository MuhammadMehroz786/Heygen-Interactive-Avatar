import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    HEYGEN_API_KEY: process.env.HEYGEN_API_KEY,
  },
};

export default nextConfig;