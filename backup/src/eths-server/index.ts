import { Hono } from 'hono';
import { handle } from 'hono/vercel';

import { BASE_API_URL } from '@/eths-library/constants.ts';
import { createApp } from './helpers.ts';
import { withRoutes } from './routes.ts';

export * from './endpoints-docs.ts';
export * from './helpers.ts';
export * from './routes.ts';
export * from './schemas.ts';

// indexer.calldata.space - indexer for eths & glyph, use the packages from the monorepo, deploy to Fly.io
// ipx.calldata.space - image optimize and tools; IPX serice (sharp), and imagemin-webp
// status.calldata.space - services monitoring, status page
// swipe.calldata.space - swipe app for ranking/voting Ethscriptions; includes its own api for voting trigger from explorer up-voting too
// develop.calldata.space - developer portal for webhooks, websockets, api keys; unkey
// api.calldata.space - main api endpoints, initially a proxy of eths com; unkey, eths lib/server
// docs.calldata.space - dev docs; mintlify
// learn.calldata.space - user docs and guides; mintlify
// studio.calldata.space - creator studio / launchpad; uploadthing, unkey
// wallet.calldata.space - wallet app for Ethscriptions
// facet.calldata.space - wallet for Facet
//
// monorepo for packages: eths lib, eths server, db, trpc, server / rpc actions, and indexer utils
//

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
