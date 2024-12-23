// ?NOTE: maybe switch to @hono/zod-openapi on next iteration
import { zValidator } from '@hono/zod-validator';
import { Hono, type Context, type ValidationTargets } from 'hono';
import { cors as corsMiddleware } from 'hono/cors';
import { etag as etagMiddleware } from 'hono/etag';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { ZodSchema } from 'zod';

export type Bindings = {
  VERCEL_GIT_COMMIT_REF: string;
};

export type Env = {
  VERCEL_GIT_COMMIT_REF: string;
  ENVIRONMENT: 'production' | 'development';
  UPLOADTHING_TOKEN: string;
};

export function createApp(cors = null) {
  const app = new Hono<{ Bindings: Bindings & Env }>();
  app.use(trimTrailingSlash());
  app.use(etagMiddleware({ weak: true }));
  app.use(corsMiddleware(cors || { origin: '*' }));
  app.use(secureHeaders());

  return app;
}

export function toHonoHandler(fn) {
  return async (ctx: Context) => {
    const resp = await fn(ctx);

    if (!resp.ok) {
      return ctx.json({ error: resp.error }, { status: resp.error.httpStatus });
    }
    const { result, pagination, headers } = resp;

    if (result instanceof Uint8Array) {
      return new Response(result, { headers });
    }
    if (pagination) {
      return ctx.json({ result, pagination }, { headers });
    }

    return ctx.json({ result }, { headers });
  };
}

export function validate(target: keyof ValidationTargets, schema: ZodSchema<any>) {
  return zValidator(target, schema, (res, ctx: Context) => {
    if (!res.success) {
      return ctx.json(
        {
          error: {
            message: 'Failure in validation',
            httpStatus: 400,
            issues: res.error.issues,
          },
        },
        { status: 400 },
      );
    }

    return res.data;
  });
}
