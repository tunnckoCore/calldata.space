import { createRouteHandlers } from 'ethscriptions-server';

// export const runtime = 'edge';
// export const runtime = 'nodejs';

// ?NOTE: Ooooh if only they both were consistent.. duh
export const { GET, POST } = createRouteHandlers('https://api.ethscriptions.com/v2');
