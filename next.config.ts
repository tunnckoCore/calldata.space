import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
    ppr: true,
    reactCompiler: true,
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'api.calldata.space' }],
        destination: '/api/:path*',
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'wallet.calldata.space' }],
        destination: '/wallet/:path*',
      },
    ];
  },
};

export default nextConfig;
