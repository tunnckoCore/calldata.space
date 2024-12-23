import { Hono } from 'hono';
import { handle } from 'hono/vercel';

import { BASE_API_URL } from '@/eths-library/constants.ts';
import { createApp } from './helpers.ts';
import { withRoutes } from './routes.ts';

export * from './endpoints-docs.ts';
export * from './helpers.ts';
export * from './routes.ts';
export * from './schemas.ts';

export function createRouteHandlers(baseURL = BASE_API_URL, prefix = '/') {
  // Creates Hono app with preconfigured middleware and Ethscriptions routes
  const eths = withRoutes(createApp(), baseURL || BASE_API_URL);
  const app = new Hono().basePath(prefix);

  // Mounts the eths app at the root of the new Hono app with `/api` base path
  app.route('/', eths);

  const GET = handle(app);
  const OPTIONS = handle(app);
  const POST = handle(app);

  return { eths, app, baseURL, prefix, GET, POST, OPTIONS };
}

export { handle as honoVercelHandle } from 'hono/vercel';
