import { BASE_API_URL, CACHE_TTL } from "./constants.js";
import { bytes2hex, createDigest, getHeaders, getPrices, hex2bytes, isAddress, isHex, namesResolver, normalizeAndSortTransfers, normalizeResult, numfmt, upstreamFetcher } from "./utils.js";
export { BASE_API_URL, CACHE_TTL } from "./constants.js";
export async function checkExists(sha, options) {
	const opts = {
		baseURL: BASE_API_URL,
		...options
	};
	sha = (sha || "").replace("0x", "");
	if (!sha || sha && sha.length !== 64 || sha && !/^[\dA-Fa-f]{64,}$/.test(sha)) {
		return {
			ok: false,
			error: {
				message: "Invalid SHA-256 hash, must be 64 hex characters long, or 66 if 0x-prefixed",
				httpStatus: 400
			}
		};
	}
	const baseresp = await fetch(`${opts.baseURL}/ethscriptions/exists/0x${sha}`);
	if (!baseresp.ok) {
		return {
			ok: false,
			error: {
				message: "Cannot check if ethscription exists on the upstream api",
				httpStatus: baseresp.status
			}
		};
	}
	const resp = await baseresp.json();
	if (resp.result.exists) {
		const eth = resp.result.ethscription;
		return {
			ok: true,
			result: {
				exists: true,
				ethscription: normalizeResult(eth, opts)
			},
			headers: opts.headers || getHeaders(opts.cacheTtl ?? CACHE_TTL)
		};
	}
	return {
		ok: true,
		result: { exists: false },
		headers: opts.headers || getHeaders(opts.cacheTtl ?? CACHE_TTL)
	};
}
export async function resolveUser(val, options) {
	const opts = {
		checkCreator: false,
		...options
	};
	const resolveName = isAddress(val);
	const resolved = await namesResolver(val, null, {
		...opts,
		resolveName,
		checkCreator: opts.checkCreator
	});
	if (!resolved) {
		return {
			ok: false,
			error: {
				message: `Cannot resolve ${val}`,
				httpStatus: 404
			}
		};
	}
	const result = resolveName ? {
		name: resolved,
		address: val
	} : {
		name: val,
		address: resolved
	};
	return {
		ok: true,
		result,
		headers: opts.headers || getHeaders(opts.cacheTtl ?? 3600)
	};
}
export async function getUserProfile(val, options) {
	const opts = { ...options };
	const res = await upstreamFetcher({
		...opts,
		resolve: isAddress(val) === false,
		creator: val,
		media_type: "application",
		media_subtype: "vnd.esc.user.profile+json"
	});
	if (!res.ok) {
		return res;
	}
	const data = Array.isArray(res.result) ? res.result.map((x) => normalizeResult(x, {
		...opts,
		with: opts.with || "content_uri"
	})) : [normalizeResult(res.result, {
		...opts,
		with: opts.with || "content_uri"
	})];
	return {
		ok: true,
		result: {
			latest: data[0],
			previous: data.slice(1) || []
		},
		headers: opts.headers || getHeaders(opts.cacheTtl ?? 300)
	};
}
export async function getDigestForData(input, options) {
	const opts = { ...options };
	const isUint8 = input instanceof Uint8Array;
	const isRawData = isUint8 ? false : input?.startsWith("data:");
	const isHexData = isUint8 ? false : isHex(input?.replace(/^0x/, "")) && input?.replace(/^0x/, "")?.startsWith("646174613a");
	const isValid = [
		isUint8,
		isRawData,
		isHexData
	].includes(true);
	if (!isValid) {
		return {
			ok: false,
			error: {
				message: `Invalid data, must be a data URI, as Uint8Array encoded data URI, or hex encoded dataURI string`,
				httpStatus: 400
			}
		};
	}
	try {
		const data = isRawData ? new TextEncoder().encode(input) : isHexData ? hex2bytes(input.replace(/^0x/, "")) : input;
		const sha = await createDigest(data);
		const hexed = bytes2hex(data);
		const inputData = new TextDecoder("utf8").decode(data);
		if (opts.checkExists) {
			const resp = await checkExists(sha, opts);
			if (!resp.ok) {
				return resp;
			}
			return {
				ok: true,
				result: {
					sha,
					hex: `0x${hexed}`,
					input: inputData,
					exists: resp.result.exists,
					ethscription: resp.result.ethscription
				},
				headers: opts.headers || getHeaders(opts.cacheTtl ?? 300)
			};
		}
		return {
			ok: true,
			result: {
				sha,
				hex: `0x${hexed}`,
				input: inputData
			},
			headers: opts.headers || getHeaders(opts.cacheTtl ?? 300)
		};
	} catch (err) {
		return {
			ok: false,
			error: {
				message: `Failure in SHA generation: ${err.toString()}`,
				httpStatus: 400
			}
		};
	}
}
export async function getUserCreatedEthscritions(val, options) {
	const createdByUser = await getAllEthscriptions({
		...options,
		resolve: !isAddress(val),
		creator: val
	});
	return createdByUser;
}
export async function getUserOwnedEthscriptions(val, options) {
	const ownedByUser = await getAllEthscriptions({
		...options,
		resolve: !isAddress(val),
		current_owner: val
	});
	return ownedByUser;
}
export async function getAllEthscriptions(options) {
	const opts = { ...options };
	const data = await upstreamFetcher(opts);
	if (!data.ok) {
		return data;
	}
	return {
		ok: true,
		result: data.result.map((x) => normalizeResult(x, opts)),
		pagination: data.pagination,
		headers: opts.headers || getHeaders(opts.cacheTtl ?? 15)
	};
}
export async function getEthscriptionById(id, options) {
	return getEthscriptionDetailed(id, "meta", options);
}
export async function getEthscriptionDetailed(id, type, options) {
	if (!type) {
		return {
			ok: false,
			error: {
				message: "The `type` argument is required ",
				httpStatus: 500
			}
		};
	}
	const opts = { ...options };
	const data = await upstreamFetcher(opts, id);
	if (!data.ok) {
		return data;
	}
	const result = normalizeResult(data.result, opts);
	if (/meta/.test(type)) {
		return {
			ok: true,
			result,
			headers: opts.headers || getHeaders(CACHE_TTL)
		};
	}
	if (/content|data/i.test(type)) {
		const contentBuffer = await fetch(data.result.content_uri).then((res) => res.arrayBuffer());
		return {
			ok: true,
			result: new Uint8Array(contentBuffer),
			headers: opts.headers ? {
				...opts.headers,
				"content-type": result.content_type
			} : getHeaders(CACHE_TTL, { "content-type": result.content_type })
		};
	}
	if (/owner|creator|receiver|previous|initial/i.test(type)) {
		const transfers = normalizeAndSortTransfers(data.result.ethscription_transfers);
		return {
			ok: true,
			result: {
				latest_transfer_timestamp: transfers[0].block_timestamp,
				latest_transfer_datetime: new Date(Number(result.block_timestamp) * 1000).toISOString(),
				latest_transfer_block: transfers[0].block_number,
				creator: result.creator,
				initial: data.result.initial_owner,
				current: data.result.current_owner,
				previous: data.result.previous_owner
			},
			headers: opts.headers || getHeaders(45)
		};
	}
	if (/number|index|stat|info/i.test(type)) {
		return {
			ok: true,
			result: {
				block_timestamp: result.block_timestamp,
				block_datetime: new Date(Number(result.block_timestamp) * 1000).toISOString(),
				block_blockhash: result.block_blockhash,
				block_number: result.block_number,
				block_number_fmt: numfmt(result.block_number),
				transaction_index: result.transaction_index,
				event_log_index: result.event_log_index ?? null,
				ethscription_number: data.result.ethscription_number ?? null,
				ethscription_number_fmt: data.result.ethscription_number ? numfmt(data.result.ethscription_number ?? "") : "",
				ethscription_transfers: String(normalizeAndSortTransfers(data.result.ethscription_transfers).filter((x) => x.is_esip0 === false).length)
			},
			headers: opts.headers || getHeaders(60)
		};
	}
	if (/transfer/i.test(type)) {
		return {
			ok: true,
			result: normalizeAndSortTransfers(data.result.ethscription_transfers),
			pagination: data.pagination,
			headers: opts.headers || getHeaders(45)
		};
	}
	if (/attach|attachment|blob/i.test(type)) {
		if (!data.result.attachment_sha) {
			return {
				ok: false,
				error: {
					message: "No attachment for this ethscription, it is not an ESIP-8 compatible Blobscription",
					httpStatus: 404
				}
			};
		}
		const res = await upstreamFetcher(opts, `${id}/attachment`);
		if (!res.ok) {
			return res;
		}
		return {
			ok: true,
			result: res.result,
			headers: opts.headers ? {
				...opts.headers,
				"content-type": data.result.attachment_content_type
			} : getHeaders(CACHE_TTL, { "content-type": data.result.attachment_content_type })
		};
	}
	return {
		ok: false,
		error: {
			message: "Invalid request",
			httpStatus: 400
		}
	};
}
export async function estimateDataCost(input, options) {
	const cfg = {
		speed: "normal",
		usePrices: true,
		bufferFee: 0,
		...options
	};
	const prices = await getPrices(cfg.speed);
	if (!prices.ok) {
		return prices;
	}
	const opts = {
		...prices.result,
		...cfg
	};
	const isUint8 = input instanceof Uint8Array;
	const isRawData = isUint8 ? false : input?.startsWith("data:");
	const isHexData = isUint8 ? false : isHex(input?.replace(/^0x/, "")) && input?.replace(/^0x/, "")?.startsWith("646174613a");
	const isValid = [
		isUint8,
		isRawData,
		isHexData
	].includes(true);
	if (!isValid) {
		return {
			ok: false,
			error: {
				message: `Invalid data, must be a data URI as Uint8Array encoded data URI, or hex encoded dataURI string`,
				httpStatus: 400
			}
		};
	}
	try {
		const data = isRawData ? new TextEncoder().encode(input) : isHexData ? hex2bytes(input.replace(/^0x/, "")) : input;
		const dataWei = data.reduce((acc, byte) => acc + (byte === 0 ? 4 : 16), 0);
		const transferWei = 21_000;
		const bufferWei = opts.bufferFee || 0;
		const usedWei = dataWei + transferWei + bufferWei;
		const totalGasWei = opts.gasPrice ? opts.gasPrice * 1e9 : opts.baseFee + opts.priorityFee;
		const costWei = usedWei * totalGasWei;
		const eth = costWei / 1e18;
		const usd = eth * Number(opts.ethPrice);
		return {
			ok: true,
			result: {
				prices: opts,
				cost: {
					wei: costWei,
					eth,
					usd
				},
				meta: {
					gasNeeded: usedWei,
					inputLength: input.length
				}
			}
		};
	} catch (err) {
		return {
			ok: false,
			error: {
				message: `Failure in estimate: ${err.toString()}`,
				httpStatus: 500
			}
		};
	}
}
