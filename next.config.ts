import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  outputFileTracingRoot: process.cwd(), // Verschoben aus experimental
};

export default nextConfig;
