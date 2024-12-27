import { BASE_API_URL, checkExists, estimateDataCost, getAllEthscriptions, getDigestForData, getEthscriptionById, getEthscriptionDetailed, getUserCreatedEthscritions, getUserOwnedEthscriptions, getUserProfile, resolveUser } from "ethscriptions";
import { getHeaders, getPrices } from "ethscriptions/utils";
import { env as honoGetEnv } from "hono/adapter";
import { z } from "zod";
import { ENDPOINTS } from "./endpoints-docs.js";
import { toHonoHandler, validate } from "./helpers.js";
import { booleanSchema, DataURISchema, FilterSchema, HashSchema, IdSchema, UserSchema } from "./schemas.js";
export function getEnv(ctx, key = "VERCEL_GIT_COMMIT_SHA") {
	const ctxEnv = ctx.env || {};
	const runEnv = honoGetEnv(ctx) || {};
	return runEnv?.[key] || ctxEnv?.[key] || "local";
}
export function withRoutes(app, baseURL = BASE_API_URL) {
	app.get("/", async (ctx) => {
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
			if (!x) return "";
			const [key, desc] = x.split(" - ");
			if (!key?.startsWith("/")) {
				return `<h2>${key}</h2>`;
			}
			let k = key.includes("/ethscriptions/:id") ? key.replace(":id", "302469") : key;
			k = /attach|blob/i.test(key) ? key.replace(":id", "5743259") : k;
			return `<span><a href="${k}"><code>${key}</code></a> ${desc ? ` - ${desc}` : ""}</span><br>`;
		}).join("")}</div><br><br>
  </body>
  </html>`);
	});
	app.get("/endpoints", async (ctx) => {
		const commitsha = getEnv(ctx);
		return ctx.json({
			about: {
				source: "https://github.com/tunnckocore/calldata.space",
				commit: commitsha
			},
			endpoints: ENDPOINTS
		});
	});
	app.get("/prices", toHonoHandler((ctx) => getPrices(ctx.req.query("speed") || "normal")));
	app.all("/optimize/:modifiers/:data{.+}", validate("param", z.object({
		data: DataURISchema.or(z.string().url()),
		modifiers: z.string()
	}).strict()), async (ctx) => {
		const modifiers = ctx.req.param("modifiers");
		const data = ctx.req.param("data");
		const url = new URL(ctx.req.url);
		const upstreamUrl = new URL(url.pathname.replace("/optimize", ""), "https://ipx.wgw.lol");
		if (!data) {
			return new Response("Expected JSON or form-data", { status: 400 });
		}
		if (/basic|multiple/gi.test(modifiers) && !/f_webp/i.test(modifiers) && ctx.req.method === "POST") {
			const isFormData = ctx.req.header("content-type")?.includes("multipart/form-data");
			const isJSON = ctx.req.header("content-type")?.includes("application/json");
			if (!isFormData && !isJSON) {
				return new Response("Expected JSON or form-data", { status: 400 });
			}
			const body = isFormData ? await ctx.req.formData() : await ctx.req.json();
			const resp = await fetch(upstreamUrl, {
				method: "POST",
				body,
				headers: ctx.req.raw.headers
			});
			return new Response(new Uint8Array(await resp.arrayBuffer()), { headers: getHeaders(3600 * 24 * 7, { "content-type": resp.headers.get("content-type") }) });
		}
		return fetch(upstreamUrl);
	});
	app.get("/estimate/:data", validate("param", z.object({ data: DataURISchema })), validate("query", z.object({
		speed: z.union([z.literal("normal"), z.literal("fast")]).optional(),
		ethPrice: z.coerce.number().optional(),
		gasPrice: z.coerce.number().optional(),
		gasFee: z.coerce.number().optional(),
		baseFee: z.coerce.number().optional(),
		bufferFee: z.coerce.number().optional(),
		priorityFee: z.coerce.number().optional()
	}).strict()), toHonoHandler(async (ctx) => {
		console.log("bruh");
		const data = ctx.req.param("data");
		const { searchParams } = new URL(ctx.req.url);
		const settings = Object.fromEntries([...searchParams.entries()].map(([key, value]) => {
			const val = Number(value);
			return [key, Number.isNaN(val) ? value : val || 0];
		}));
		return estimateDataCost(data, settings);
	}));
	app.post("/estimate", validate("json", z.object({
		data: DataURISchema,
		speed: z.union([z.literal("normal"), z.literal("fast")]).optional(),
		ethPrice: z.coerce.number().optional(),
		gasPrice: z.coerce.number().optional(),
		gasFee: z.coerce.number().optional(),
		baseFee: z.coerce.number().optional(),
		bufferFee: z.coerce.number().optional(),
		priorityFee: z.coerce.number().optional()
	}).strict()), toHonoHandler(async (ctx) => {
		const { data,...settings } = await ctx.req.json();
		return estimateDataCost(data, settings);
	}));
	app.get("/sha/:data?", validate("param", z.object({ data: DataURISchema.optional() })), validate("query", z.object({
		data: DataURISchema.optional(),
		of: DataURISchema.optional()
	}).strict()), toHonoHandler((ctx) => {
		const dataParam = ctx.req.param("data");
		const dataQuery = ctx.req.query("of") || ctx.req.query("data");
		const input = dataParam || dataQuery;
		return getDigestForData(input, { checkExists: true });
	}));
	app.post("/sha", validate("json", z.object({
		data: DataURISchema,
		checkExists: z.coerce.boolean().or(z.literal(1)).optional()
	}).strict()), toHonoHandler(async (ctx) => {
		const { data,...settings } = await ctx.req.json();
		return getDigestForData(data, settings);
	}));
	app.get("/check/:sha", validate("param", z.object({ sha: HashSchema })), toHonoHandler((ctx) => checkExists(ctx.req.param("sha"), { baseURL })));
	app.get("/exists/:sha", validate("param", z.object({ sha: HashSchema })), toHonoHandler((ctx) => checkExists(ctx.req.param("sha"), { baseURL })));
	app.get("/resolve/:name", validate("param", z.object({ name: UserSchema })), validate("query", z.object({
		checkCreator: booleanSchema.optional(),
		creator: booleanSchema.optional()
	}).strict()), toHonoHandler(async (ctx) => {
		const checkCreator = Boolean(ctx.req.query("creator") || ctx.req.query("checkCreator"));
		return resolveUser(ctx.req.param("name"), {
			checkCreator,
			baseURL
		});
	}));
	app.get("/profiles/:name", validate("param", z.object({ name: UserSchema })), toHonoHandler((ctx) => getUserProfile(ctx.req.param("name"), { baseURL })));
	app.get("/profiles/:name/:mode", validate("param", z.object({
		name: UserSchema,
		mode: z.union([z.literal("created"), z.literal("owned")])
	})), validate("query", FilterSchema), toHonoHandler((ctx) => {
		const { searchParams } = new URL(ctx.req.url);
		const settings = Object.fromEntries([...searchParams.entries()]);
		const name = ctx.req.param("name");
		const mode = ctx.req.param("mode");
		const func = mode === "created" ? getUserCreatedEthscritions : getUserOwnedEthscriptions;
		if (mode === "created" || mode === "owned") {
			return func(name, {
				...settings,
				baseURL
			});
		}
		return { error: {
			message: "Invalid mode, accepts only `created` or `owned` mode",
			httpStatus: 400
		} };
	}));
	app.get("/:type{(blobscriptions|blobs|ethscriptions|eths)+}/:id?/:mode?", validate("param", z.object({
		type: z.union([
			z.literal("ethscriptions"),
			z.literal("eths"),
			z.literal("blobscriptions"),
			z.literal("blobs")
		]),
		id: IdSchema.optional(),
		mode: z.union([
			z.literal("meta"),
			z.literal("data"),
			z.literal("metadata"),
			z.literal("content"),
			z.literal("transfer"),
			z.literal("transfers"),
			z.literal("index"),
			z.literal("number"),
			z.literal("numbers"),
			z.literal("stats"),
			z.literal("info"),
			z.literal("owner"),
			z.literal("owners"),
			z.literal("creator"),
			z.literal("receiver"),
			z.literal("previous"),
			z.literal("initial"),
			z.literal("initial_owner"),
			z.literal("current_owner"),
			z.literal("previous_owner"),
			z.literal("attachment"),
			z.literal("blob")
		]).optional()
	}).strict()), validate("query", FilterSchema), toHonoHandler(async (ctx) => {
		const { searchParams } = new URL(ctx.req.url);
		const params = Array.from(searchParams.entries());
		const settings = { baseURL };
		for (const entry of params) {
			const [key, value] = entry;
			settings[key] = settings[key] ? Array.isArray(settings[key]) ? [...settings[key], value] : [settings[key], value] : value;
		}
		const type = ctx.req.param("type");
		const id = ctx.req.param("id");
		const mode = ctx.req.param("mode");
		if (!id) {
			console.log("no id, all eths");
			return getAllEthscriptions(type.includes("blob") ? {
				...settings,
				attachment_present: true
			} : settings);
		}
		if (!mode) {
			console.log("ethscription by id:", id);
			return getEthscriptionById(id.replaceAll(",", ""), settings);
		}
		return getEthscriptionDetailed(id.replaceAll(",", ""), mode, settings);
	}));
	return app;
}
