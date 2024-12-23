import { type Context } from 'hono';
import { env as honoGetEnv } from 'hono/adapter';
import { z } from 'zod';

import { BASE_API_URL } from '@/eths-library/constants.ts';
import {
  checkExists,
  estimateDataCost,
  getAllEthscriptions,
  getDigestForData,
  getEthscriptionById,
  getEthscriptionDetailed,
  getUserCreatedEthscritions,
  getUserOwnedEthscriptions,
  getUserProfile,
  resolveUser,
} from '@/eths-library/index.ts';
import type { EnumAllDetailed } from '@/eths-library/types.ts';
import { getHeaders, getPrices } from '@/eths-library/utils.ts';
import { booleanSchema } from '@/utils/params-validation.ts';
import { ENDPOINTS } from './endpoints-docs.ts';
import { createApp, toHonoHandler, validate } from './helpers.ts';
import { DataURISchema, FilterSchema, HashSchema, IdSchema, UserSchema } from './schemas.ts';

export function getEnv(ctx: Context, key: string = 'VERCEL_GIT_COMMIT_SHA') {
  const ctxEnv = ctx.env;
  const runEnv = honoGetEnv<{ VERCEL_GIT_COMMIT_SHA: string }>(ctx);
  return runEnv[key] || ctxEnv[key] || 'local';
}

export function withRoutes(app: ReturnType<typeof createApp>, baseURL = BASE_API_URL) {
  app.get('/', async (ctx: Context) => {
    const commitsha = getEnv(ctx);

    return ctx.html(`<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width" />
    <meta name="generator" content="Hono/v4" />
    <title>Calldata API</title>
    <!-- <script src="https://cdn.tailwindcss.com"></script> -->
  </head>

  <body data-theme="dark" class="relative z-10 overflow-auto overflow-x-hidden bg-[#231631]">
      <div>
        <h1>Ethscriptions API</h1>
        <p>Build: <a href="https://github.com/tunnckoCore/calldata.space/commit/${commitsha}">${commitsha}</a></p>
        <p>Source: <a href="https://github.com/tunnckoCore/calldata.space">https://github.com/tunnckoCore/calldata.space</a></p>
      </div>
      <div>${ENDPOINTS.map((x) => {
        if (!x) return '';

        const [key, desc] = x.split(' - ');

        if (!key?.startsWith('/')) {
          return `<h2>${key}</h2>`;
        }

        let k = key.includes('/ethscriptions/:id') ? key.replace(':id', '302469') : key;
        k = /attach|blob/i.test(key) ? key.replace(':id', '5743259') : k;

        return `<span><a href="${k}"><code>${key}</code></a> ${desc ? ` - ${desc}` : ''}</span><br>`;
      }).join('')}</div><br><br>
  </body>
  </html>`);
  });

  app.get('/endpoints', async (ctx: Context) => {
    const commitsha = getEnv(ctx);

    return ctx.json({
      about: {
        source: 'https://github.com/tunnckocore/calldata.space',
        commit: commitsha,
      },
      endpoints: ENDPOINTS,
    });
  });

  app.get(
    '/prices',
    toHonoHandler((ctx: Context) => getPrices(ctx.req.query('speed') || 'normal')),
  );

  app.all(
    '/optimize/:modifiers/:data{.+}',
    validate(
      'param',
      z.object({ data: DataURISchema.or(z.string().url()), modifiers: z.string() }).strict(),
    ),
    async (ctx: Context) => {
      const modifiers = ctx.req.param('modifiers');
      const data = ctx.req.param('data');
      const url = new URL(ctx.req.url);
      const upstreamUrl = new URL(url.pathname.replace('/optimize', ''), 'https://ipx.wgw.lol');
      if (!data) {
        return new Response('Expected JSON or form-data', { status: 400 });
      }
      if (
        /basic|multiple/gi.test(modifiers) &&
        !/f_webp/i.test(modifiers) &&
        ctx.req.method === 'POST'
      ) {
        const isFormData = ctx.req.header('content-type')?.includes('multipart/form-data');
        const isJSON = ctx.req.header('content-type')?.includes('application/json');

        if (!isFormData && !isJSON) {
          return new Response('Expected JSON or form-data', { status: 400 });
        }

        const body = isFormData ? await ctx.req.formData() : await ctx.req.json();

        const resp = await fetch(upstreamUrl, {
          method: 'POST',
          body,
          headers: ctx.req.raw.headers,
        });

        return new Response(new Uint8Array(await resp.arrayBuffer()), {
          headers: getHeaders(3600 * 24 * 7, { 'content-type': resp.headers.get('content-type') }),
        });
      }

      return fetch(upstreamUrl);
      // const resp = await fetch(upstreamUrl);
      // return new Response(new Uint8Array(await resp.arrayBuffer()), {
      //   headers: getHeaders(3600 * 24 * 7, { 'content-type': resp.headers.get('content-type') }),
      // });
    },
  );

  app.get(
    '/estimate/:data',
    validate('param', z.object({ data: DataURISchema })),
    validate(
      'query',
      z
        .object({
          speed: z.union([z.literal('normal'), z.literal('fast')]).optional(),
          ethPrice: z.coerce.number().optional(),
          gasPrice: z.coerce.number().optional(),
          gasFee: z.coerce.number().optional(),
          baseFee: z.coerce.number().optional(),
          bufferFee: z.coerce.number().optional(),
          priorityFee: z.coerce.number().optional(),
        })
        .strict(),
    ),
    toHonoHandler(async (ctx: Context) => {
      console.log('bruh');
      const data = ctx.req.param('data');
      const { searchParams } = new URL(ctx.req.url);

      const settings = Object.fromEntries(
        [...searchParams.entries()].map(([key, value]) => {
          const val = Number(value);

          return [key, Number.isNaN(val) ? value : val || 0];
        }),
      );

      return estimateDataCost(data, settings);
    }),
  );

  app.post(
    '/estimate',
    validate(
      'json',
      z
        .object({
          data: DataURISchema,
          speed: z.union([z.literal('normal'), z.literal('fast')]).optional(),
          ethPrice: z.coerce.number().optional(),
          gasPrice: z.coerce.number().optional(),
          gasFee: z.coerce.number().optional(),
          baseFee: z.coerce.number().optional(),
          bufferFee: z.coerce.number().optional(),
          priorityFee: z.coerce.number().optional(),
        })
        .strict(),
    ),
    toHonoHandler(async (ctx: Context) => {
      const { data, ...settings } = await ctx.req.json();

      return estimateDataCost(data, settings);
    }),
  );

  app.get(
    '/sha/:data?',
    validate('param', z.object({ data: DataURISchema.optional() })),
    validate(
      'query',
      z.object({ data: DataURISchema.optional(), of: DataURISchema.optional() }).strict(),
    ),
    toHonoHandler((ctx: Context) => {
      const dataParam = ctx.req.param('data');
      const dataQuery = ctx.req.query('of') || ctx.req.query('data');

      const input = (dataParam || dataQuery) as `data:${string}` | `0x646174613a${string}`;

      return getDigestForData(input, { checkExists: true });
    }),
  );
  app.post(
    '/sha',
    validate(
      'json',
      z
        .object({
          data: DataURISchema,
          checkExists: z.coerce.boolean().or(z.literal(1)).optional(),
        })
        .strict(),
    ),
    toHonoHandler(async (ctx: Context) => {
      const { data, ...settings } = await ctx.req.json();

      return getDigestForData(data, settings);
    }),
  );

  app.get(
    '/check/:sha',
    validate('param', z.object({ sha: HashSchema })),
    toHonoHandler((ctx: Context) => checkExists(ctx.req.param('sha'), { baseURL })),
  );
  app.get(
    '/exists/:sha',
    validate('param', z.object({ sha: HashSchema })),
    toHonoHandler((ctx: Context) => checkExists(ctx.req.param('sha'), { baseURL })),
  );

  app.get(
    '/resolve/:name',
    validate('param', z.object({ name: UserSchema })),
    validate(
      'query',
      z
        .object({
          checkCreator: booleanSchema.optional(),
          creator: booleanSchema.optional(),
        })
        .strict(),
    ),
    toHonoHandler(async (ctx: Context) => {
      const checkCreator = Boolean(ctx.req.query('creator') || ctx.req.query('checkCreator'));

      return resolveUser(ctx.req.param('name'), { checkCreator, baseURL });
    }),
  );

  app.get(
    '/profiles/:name',
    validate('param', z.object({ name: UserSchema })),
    toHonoHandler((ctx: Context) => getUserProfile(ctx.req.param('name'), { baseURL })),
  );

  app.get(
    '/profiles/:name/:mode',
    validate(
      'param',
      z.object({
        name: UserSchema,
        mode: z.union([z.literal('created'), z.literal('owned')]),
      }),
    ),
    validate(
      'query',
      FilterSchema,
      // !NOTE: non-strict because we are passing through to upstream
      // .strict(),
    ),

    toHonoHandler((ctx: Context) => {
      const { searchParams } = new URL(ctx.req.url);
      const settings = Object.fromEntries([...searchParams.entries()]);

      const name = ctx.req.param('name');
      const mode = ctx.req.param('mode');
      const func = mode === 'created' ? getUserCreatedEthscritions : getUserOwnedEthscriptions;

      if (mode === 'created' || mode === 'owned') {
        return func(name, { ...settings, baseURL });
      }

      return {
        error: { message: 'Invalid mode, accepts only `created` or `owned` mode', httpStatus: 400 },
      };
    }),
  );

  // weird hack in hono, using named regex route like `/:routeparam{[a-z]+}`,
  // cuz it doesn't support basic regex routes like `/(ethscriptions|eths)`
  // came in handy for this case, because we have multiple types anyway
  // support for
  // - /ethscriptions & /eths
  // - /blobscriptions & /blobs
  //
  // - /ethscriptions/:id
  // - /ethscriptions/:id/owners
  // - /ethscriptions/:id/content
  // - /ethscriptions/:id/transfers
  //
  // - /blobscriptions/:id
  // - /blobscriptions/:id/owners
  // - /blobscriptions/:id/content
  // - /blobscriptions/:id/transfers
  app.get(
    '/:type{(blobscriptions|blobs|ethscriptions|eths)+}/:id?/:mode?',
    validate(
      'param',
      z
        .object({
          type: z.union([
            z.literal('ethscriptions'),
            z.literal('eths'),
            z.literal('blobscriptions'),
            z.literal('blobs'),
          ]),

          id: IdSchema.optional(),

          mode: z
            .union([
              z.literal('meta'),
              z.literal('data'),
              z.literal('metadata'),
              z.literal('content'),
              z.literal('transfer'),
              z.literal('transfers'),
              z.literal('index'),
              z.literal('number'),
              z.literal('numbers'),
              z.literal('stats'), // alias of `info`
              z.literal('info'),
              z.literal('owner'),
              z.literal('owners'),
              z.literal('creator'),
              z.literal('receiver'),
              z.literal('previous'),
              z.literal('initial'),
              z.literal('initial_owner'),
              z.literal('current_owner'),
              z.literal('previous_owner'),
              z.literal('attachment'),
              z.literal('blob'),
            ])
            .optional(),
        })
        .strict(),
    ),
    validate(
      'query',
      FilterSchema,
      // !NOTE: non-strict because we are passing through to upstream
      // .strict(),
    ),
    toHonoHandler(async (ctx: Context) => {
      const { searchParams } = new URL(ctx.req.url);
      const params = Array.from(searchParams.entries());
      const settings = { baseURL };
      for (const entry of params) {
        const [key, value] = entry;

        settings[key] = settings[key]
          ? Array.isArray(settings[key])
            ? [...settings[key], value]
            : [settings[key], value]
          : value;
      }

      const type = ctx.req.param('type');
      const id = ctx.req.param('id');
      const mode = ctx.req.param('mode');

      if (!id) {
        console.log('no id, all eths');
        return getAllEthscriptions(
          type.includes('blob') ? { ...settings, attachment_present: true } : settings,
        );
      }
      if (!mode) {
        console.log('ethscription by id:', id);
        return getEthscriptionById(id.replaceAll(',', ''), settings);
      }

      return getEthscriptionDetailed(id.replaceAll(',', ''), mode as EnumAllDetailed, settings);
    }),
  );

  return app;
}
