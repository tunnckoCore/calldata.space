import { CacheHeaders } from "cdn-cache-control";
import * as qs from "qs-esm";
import { BASE_API_URL } from "./constants.js";
export async function getPrices(speed = "normal") {
	try {
		const resp = await fetch(`https://www.ethgastracker.com/api/gas/latest`);
		if (!resp.ok) {
			return {
				ok: false,
				error: {
					message: `Failed to fetch gas prices: ${resp.statusText}`,
					httpStatus: resp.status || 500
				}
			};
		}
		const { data } = await resp.json();
		return {
			ok: true,
			result: {
				blockNumber: data.blockNr,
				baseFee: data.baseFee,
				nextFee: data.nextFee,
				ethPrice: data.ethPrice,
				gasPrice: data.oracle[speed].gwei,
				gasFee: data.oracle[speed].gasFee,
				priorityFee: data.oracle[speed].priorityFee
			}
		};
	} catch (err) {
		return {
			ok: false,
			error: {
				message: `Failed to fetch prices from API: ${err.toString()}`,
				httpStatus: 500
			}
		};
	}
}
export async function upstreamFetcher(options, id) {
	let opts = {
		resolve: false,
		baseURL: BASE_API_URL,
		...filtersNormalizer({ ...options })
	};
	if (opts.resolve) {
		opts = await resolveAddressPatches(opts);
	}
	const { baseURL } = opts;
	delete opts.resolve;
	delete opts.baseURL;
	const searchStr = qs.stringify(opts, {
		encode: false,
		indices: false
	});
	const searchParams = new URLSearchParams(searchStr.replaceAll("+", "%2B"));
	const isAttachment = id && /attach|blob/i.test(id);
	const fpath = (isAttachment ? [id.split("/")[0], "attachment"] : [id || ""]).join("/");
	const search = Object.entries(opts).length > 0 ? `?${searchParams}` : "";
	let resp;
	try {
		resp = await fetch(`${baseURL}/ethscriptions${id ? `/${fpath}` : ""}${search}`);
	} catch (err) {
		return {
			ok: false,
			error: {
				message: `Fetch failed unexpectedly: ${err?.toString()}`,
				httpStatus: 500
			}
		};
	}
	if (!resp.ok) {
		console.error("Failed to fetch data from upstream API:", resp.status, resp.statusText);
		return {
			ok: false,
			error: {
				message: "Transaction not found or it is not an Ethscription.",
				httpStatus: resp.status
			}
		};
	}
	if (isAttachment) {
		return {
			ok: true,
			result: new Uint8Array(await resp.arrayBuffer())
		};
	}
	const data = await resp.json();
	const response = {
		ok: true,
		result: data.result
	};
	if (data.pagination) {
		response.pagination = data.pagination;
	}
	return response;
}
export function normalizeAndSortTransfers(transfers) {
	return transfers.map(({ ethscription_transaction_hash,...x }, idx) => ({
		...x,
		is_esip0: idx === 0,
		is_esip1: Boolean(x.event_log_index !== null),
		is_esip2: Boolean(x.event_log_index !== null)
	})).sort((a, b) => b.block_number - a.block_number);
}
export function normalizeResult(result, options) {
	const opts = { ...options };
	const keys = Object.keys(result || {});
	const withs = Array.isArray(opts.with) ? opts.with : opts.with?.split(",") || [];
	const onlys = Array.isArray(opts.only) ? opts.only : opts.only?.split(",") || [];
	const isTxOnly = keys.length === 1 && keys[0] === "transaction_hash" || opts.transaction_hash_only;
	if (isTxOnly) {
		console.log({ isTxOnly });
		return result;
	}
	const res = {
		block_number: String(result.block_number),
		block_blockhash: result.block_blockhash,
		block_timestamp: String(result.block_timestamp),
		block_datetime: new Date(Number(result.block_timestamp) * 1000).toISOString(),
		transaction_hash: result.transaction_hash,
		transaction_index: String(result.transaction_index),
		transaction_value: String(result.value).replace(/\.0$/, ""),
		transaction_fee: String(result.transaction_fee).replace(/\.0$/, ""),
		gas_price: String(result.gas_price).replace(/\.0$/, ""),
		gas_used: String(result.gas_used),
		creator: result.creator,
		receiver: result.initial_owner,
		media_type: result.media_type,
		media_subtype: result.mime_subtype,
		content_type: result.mimetype,
		content_sha: result.content_sha,
		content_path: `/ethscriptions/${result.transaction_hash}/content`,
		...result.attachment_sha ? {
			attachment_content_type: result.attachment_content_type,
			attachment_media_type: result.attachment_content_type.split("/")?.at(0) || null,
			attachment_sha: result.attachment_sha,
			attachment_path: `/ethscriptions/${result.transaction_hash}/attachment`
		} : {},
		is_esip0: Boolean(result.event_log_index === null),
		is_esip3: Boolean(result.event_log_index !== null),
		is_esip4: result.content_uri?.includes("vnd.facet.tx+json") || false,
		is_esip6: result.esip6,
		is_esip8: Boolean(result.attachment_sha)
	};
	const onlyRes = Object.fromEntries(Object.entries(res).filter(([key]) => {
		if (onlys.length > 0) {
			return onlys.includes(key);
		}
		return true;
	}));
	const withRes = withs.reduce((acc, withKey) => {
		if (!acc[withKey]) {
			acc[withKey] = res[withKey] || result[withKey];
		}
		return acc;
	}, onlyRes);
	return withRes.length > 0 ? withRes : onlyRes;
}
export function filtersNormalizer(opts) {
	if (opts.media_subtype) {
		opts.mime_subtype = opts.media_subtype;
		delete opts.media_subtype;
	}
	if (opts.per_page) {
		opts.max_results = opts.per_page;
	}
	if (opts.page_size) {
		opts.max_results = opts.page_size;
	}
	if (opts.cursor) {
		opts.page_key = opts.cursor;
		delete opts.cursor;
	}
	if (opts.receiver) {
		opts.initial_owner = opts.receiver;
		delete opts.receiver;
	}
	if (opts.initial) {
		opts.initial_owner = opts.initial;
		delete opts.initial;
	}
	if (opts.previous) {
		opts.previous_owner = opts.previous;
		delete opts.previous;
	}
	if (opts.current) {
		opts.current_owner = opts.current;
		delete opts.current;
	}
	if (opts.owner) {
		opts.current_owner = opts.owner;
		delete opts.owner;
	}
	if (opts.content_type) {
		opts.mimetype = opts.content_type;
		delete opts.content_type;
	}
	const params = Object.entries(opts);
	if (params.some(([key]) => key.startsWith("content_type"))) {
		const contentTypes = params.filter(([key]) => key.startsWith("content_type")).map(([_, value]) => value);
		opts.mimetype = contentTypes;
	}
	if (opts.is_esip6) {
		opts.esip6 = opts.is_esip6;
		delete opts.is_esip6;
	}
	return { ...opts };
}
export function filtersNormalizerFromUrlSearchParams(searchParams) {
	const params = Array.from(searchParams.entries());
	const opts = {};
	for (const entry of params) {
		const [key, value] = entry;
		opts[key] = opts[key] ? Array.isArray(opts[key]) ? [...opts[key], value] : [opts[key], value] : value;
	}
	const normalizedOptions = filtersNormalizer(opts);
	const searchParamsStr = qs.stringify(normalizedOptions, {
		encode: false,
		indices: false
	});
	return new URLSearchParams(searchParamsStr);
}
export async function resolveAddressPatches(options, ensHandler) {
	const opts = { ...options };
	const addressParams = Object.entries(opts).filter(([key, value]) => /creator|receiver|owner/i.test(key) && value.length > 0 && !isAddress(value));
	const params = await Promise.all(addressParams.map(async (x) => {
		const [key, value] = x;
		const val = await namesResolver(value, ensHandler, {
			...options,
			resolveName: false
		});
		return [key, val || value];
	}));
	return {
		...opts,
		...Object.fromEntries(params)
	};
}
export async function namesResolver(value, ensHandler, options) {
	const opts = {
		baseURL: BASE_API_URL,
		...options
	};
	const val = value.toLowerCase();
	const handler = ensHandler || ensApiHandler;
	const result = await handler(val, opts);
	if (result && result.address && result.ens) {
		return (opts.resolveName ? opts.primary ? result.ens_primary : result.ens : result.address).toLowerCase();
	}
	const nameUri = `data:,${value}`;
	const nameSha = await createDigest(nameUri);
	const resp = await fetch(`${opts.baseURL}/ethscriptions/exists/0x${nameSha}`).then((x) => x.json());
	if (resp.result.exists) {
		const eth = resp.result.ethscription;
		return (opts.checkCreator ? eth.creator : eth.current_owner).toLowerCase();
	}
	return null;
}
export async function ensApiHandler(val) {
	const resp = await fetch(`https://api.ensdata.net/${val}`);
	if (!resp.ok) {
		return null;
	}
	const data = await resp.json();
	return data;
}
export async function ensBasicOnchainHandler(val, options) {
	const opts = { ...options };
	const address = await opts.publicClient.getEnsAddress({ name: opts.normalize(val) });
	if (address.toLowerCase() === val.toLowerCase()) {
		return null;
	}
	let ens = val;
	if (opts.resolveName) {
		ens = await opts.publicClient.getEnsName({ address: val.toLowerCase() });
	}
	return {
		ens,
		address
	};
}
export function getHeaders(time = 31_536_000, additionalHeaders = {}, cfType = "must-revalidate") {
	const headers = new CacheHeaders({
		"Netlify-CDN-Cache-Control": `public,s-maxage=${time},must-revalidate,durable`,
		"Vercel-CDN-Cache-Control": `public,s-maxage=${time},must-revalidate`,
		"Cloudflare-CDN-Cache-Control": `public,s-maxage=${time},${cfType}`,
		...additionalHeaders
	}).ttl(time);
	return headers;
}
export async function createDigest(msg, algo = "SHA-256") {
	const data = typeof msg === "string" ? new TextEncoder().encode(msg) : msg;
	const hashBuffer = await crypto.subtle.digest(algo, data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	return hashHex;
}
export function numfmt(x, delim = ",") {
	if (!x) return "";
	const str = x.split("").reverse().join("");
	const mm = str.match(/.{1,3}/g);
	if (!mm) return x;
	return mm.map((z) => z.split("").reverse().join("")).reverse().join(delim);
}
export function hex2bytes(str) {
	return new Uint8Array([...str.matchAll(/../g)].map((m) => Number.parseInt(m[0], 16)));
}
export function bytes2hex(bytes) {
	return [...bytes].map((n) => n.toString(16)).join("");
}
export function isAddress(val) {
	return Boolean(val && val.startsWith("0x") && val.length === 42);
}
export function isHex(val, prefixed = false) {
	return Boolean(val && /^[\dA-Fa-f]+$/.test(val) && val.length % 2 === 0 && (prefixed ? val.startsWith("0x") : true));
}
