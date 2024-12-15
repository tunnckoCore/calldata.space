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
        source: '/api/:path*',
        destination: '/api-proxy/:path*',
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'api.calldata.space' }],
        destination: '/api-main/:path*',
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
