import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

export const config = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// Why we even need that?! 🤔
declare module 'wagmi' {
  interface Register {
    // @ts-ignore bruh wtf is this err
    config: typeof config;
  }
}
