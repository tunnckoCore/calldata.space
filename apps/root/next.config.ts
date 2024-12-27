import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: { reactCompiler: true, dynamicIO: true, ppr: true },

  async rewrites() {
    return [
      {
        has: [{ type: 'host', value: 'api.calldata.space' }],
        source: '/:path*',
        destination: 'https://mainnet.api.calldata.space/:path*',
      },
    ];
  },
};

export default nextConfig;
