import { createNextRouteHandlers } from '@/eths-server';

// ?NOTE: Ooooh if only they both were consistent.. duh
export const { GET, POST } = createNextRouteHandlers('https://api.ethscriptions.com/v2');
