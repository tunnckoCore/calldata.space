// ?NOTE: pulled from `ethscriptions-server` package, with a bit of bugfixes and reorg of exports
import { createApp, withRoutes } from '@/eths-server/index.ts';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';

// export const runtime = 'edge';
// export const runtime = 'nodejs';

// Creates Hono app with preconfigured middleware and Ethscriptions routes
const eths = withRoutes(createApp());

const app = new Hono().basePath('/api');

// Mounts the eths app at the root of the new Hono app with `/api` base path
app.route('/', eths);

export const GET = handle(app);
export const POST = handle(app);
