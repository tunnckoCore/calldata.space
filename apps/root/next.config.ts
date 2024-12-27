import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: { reactCompiler: true, dynamicIO: true, ppr: true },
};

export default nextConfig;
