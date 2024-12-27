import { createRouteHandlers } from '@/eths-server';

// export const runtime = 'edge';
// export const runtime = 'nodejs';

// ?NOTE: Ooooh if only they both were consistent.. duh
export const { GET, POST } = createRouteHandlers('https://sepolia-api-v2.ethscriptions.com');
