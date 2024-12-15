import { getApp } from 'ethscriptions-server/server';
import { Hono } from 'hono';
import { handle } from 'hono/vercel';

// export const runtime = 'edge';
// export const runtime = 'nodejs';

const server = getApp();
const app = new Hono().basePath('/api');

app.route('/', server);

export const GET = handle(app);
export const POST = handle(app);
