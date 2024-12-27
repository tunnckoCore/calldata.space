import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: { dynamicIO: true, ppr: true },
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'mainnet.api.calldata.space' },
          { type: 'host', value: 'mainnet.api.localhost:3001' },
        ],
        destination: '/mainnet/:path*',
      },
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'sepolia.api.calldata.space' },
          { type: 'host', value: 'sepolia.api.localhost:3000' },
        ],
        destination: '/sepolia/:path*',
      },
    ];
  },
};

export default nextConfig;
