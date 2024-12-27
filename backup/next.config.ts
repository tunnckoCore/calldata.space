import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    reactCompiler: true,
    dynamicIO: true,
    ppr: true,
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'api.calldata.space' }, // defaults to mainnet
          { type: 'host', value: 'mainnet.api.calldata.space' },
          { type: 'host', value: 'sepolia.api.calldata.space' },

          { type: 'host', value: 'mainnet.api.localhost:3000' },
          { type: 'host', value: 'sepolia.api.localhost:3000' },

          // // ?NOTE: Maybe phase these out.
          // { type: 'host', value: 'api.mainnet.calldata.space' },
          // { type: 'host', value: 'api.sepolia.calldata.space' }, // makes sense, because there will be `sepolia.calldata.space` site too..
          // { type: 'host', value: 'api.mainnet.localhost:3000' },
          // { type: 'host', value: 'api.sepolia.localhost:3000' },
        ],
        destination: '/ethscom-proxy/:path*',
      },
      // ?NOTE: why we need this while it's also required to have a `middleware` which actually rewrites?!
      // ?NOTE: Sure, one is Vercel-specific and the other is Next.js-specific, but duuh..
      // {
      //   source: '/:path*',
      //   has: [
      //     // does this mean OR?! - Nope.. of course not.
      //     { type: 'host', value: 'indexer.calldata.space' },
      //     { type: 'host', value: 'api.localhost:3000' },
      //   ],
      //   destination: '/api-main/:path*',
      // },
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'wallet.calldata.space' },
          { type: 'host', value: 'facet.wallet.calldata.space' },
        ],
        destination: '/wallet/:path*',
      },
    ];
  },
};

export default nextConfig;
