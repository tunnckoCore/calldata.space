import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors as corsMiddleware } from "hono/cors";
import { etag as etagMiddleware } from "hono/etag";
import { secureHeaders } from "hono/secure-headers";
import { trimTrailingSlash } from "hono/trailing-slash";
export function createApp(cors = null) {
	const app = new Hono();
	app.use(trimTrailingSlash());
	app.use(etagMiddleware({ weak: true }));
	app.use(corsMiddleware(cors || { origin: "*" }));
	app.use(secureHeaders());
	return app;
}
export function toHonoHandler(fn) {
	return async (ctx) => {
		const resp = await fn(ctx);
		if (!resp.ok) {
			return ctx.json({ error: resp.error }, { status: resp.error.httpStatus });
		}
		const { result, pagination, headers } = resp;
		if (result instanceof Uint8Array) {
			return new Response(result, { headers });
		}
		if (pagination) {
			return ctx.json({
				result,
				pagination
			}, { headers });
		}
		return ctx.json({ result }, { headers });
	};
}
export function validate(target, schema) {
	return zValidator(target, schema, (res, ctx) => {
		if (!res.success) {
			return ctx.json({ error: {
				message: "Failure in validation",
				httpStatus: 400,
				issues: res.error.issues
			} }, { status: 400 });
		}
		return res.data;
	});
}
