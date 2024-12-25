import { Hono } from 'hono';
import { handle } from 'hono/vercel';

import { BASE_API_URL } from '@/eths-library/constants.ts';
import { createApp } from './helpers.ts';
import { withRoutes } from './routes.ts';

export * from './endpoints-docs.ts';
export * from './helpers.ts';
export * from './routes.ts';
export * from './schemas.ts';

export function createRouteHandlers(
  baseURL?: string | null,
  prefix?: string | null,
  handler = handle,
) {
  // Creates Hono app with preconfigured middleware and Ethscriptions routes
  const eths = withRoutes(createApp(), baseURL || BASE_API_URL);
  const app = new Hono().basePath(prefix || '/');

  // Mounts the eths app at the root of the new Hono app with `/api` base path
  app.route('/', eths);

  const createHandler = handler || handle;
  const GET = createHandler(app);
  const PUT = createHandler(app);
  const POST = createHandler(app);
  const PATCH = createHandler(app);
  const DELETE = createHandler(app);
  const OPTIONS = createHandler(app);

  return {
    eths,
    app,

    baseURL,
    prefix,

    GET,
    PUT,
    POST,
    PATCH,
    DELETE,
    OPTIONS,
  };
}

export { handle as honoVercelHandle } from 'hono/vercel';
export { BASE_API_URL } from '@/eths-library/constants.ts';
