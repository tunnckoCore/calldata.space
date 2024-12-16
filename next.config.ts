import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    dynamicIO: true,
    ppr: true,
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api-proxy/:path*',
      },
      // ?NOTE: why we need this while it's also required to have a `middleware` which actually rewrites?!
      // ?NOTE: Sure, one is Vercel-specific and the other is Next.js-specific, but duuh..
      {
        source: '/:path*',
        has: [
          // does this mean OR?! - Nope.. of course not.
          // { type: 'host', value: 'api.calldata.space' },
          { type: 'host', value: 'api.localhost:3000' },
        ],
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
