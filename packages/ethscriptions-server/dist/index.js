import { BASE_API_URL } from "ethscriptions";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { createApp } from "./helpers.js";
import { withRoutes } from "./routes.js";
export * from "./schemas.js";
export function createRouteHandlers(baseURL, prefix, handler) {
	const eths = withRoutes(createApp(), baseURL || BASE_API_URL);
	const app = new Hono().basePath(prefix || "/");
	app.route("/", eths);
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
		OPTIONS
	};
}
export { BASE_API_URL, CACHE_TTL } from "ethscriptions";
export { handle as honoVercelHandle } from "hono/vercel";
export { ENDPOINTS } from "./endpoints-docs.js";
export { createApp, toHonoHandler, validate } from "./helpers.js";
export { getEnv, withRoutes } from "./routes.js";
