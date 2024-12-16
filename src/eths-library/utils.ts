/* eslint-disable @typescript-eslint/ban-ts-comment */
// SPDX-License-Identifier: MPL-2.0

import { CacheHeaders } from 'cdn-cache-control';
import * as qs from 'qs-esm';

import { BASE_API_URL } from './constants.ts';
import type { NotOkShape, OkShape, PricesResult } from './types.ts';

export async function getPrices(speed = 'normal'): Promise<OkShape<PricesResult> | NotOkShape> {
  try {
    const resp = await fetch(`https://www.ethgastracker.com/api/gas/latest`);

    if (!resp.ok) {
      return {
        ok: false,
        error: {
          message: `Failed to fetch gas prices: ${resp.statusText}`,
          httpStatus: resp.status || 500,
        },
      } as NotOkShape;
    }

    const { data } = await resp.json();
    // as {
    //   data: {
    //     network: string;
    //     blockNr: string;
    //     timestamp: number;
    //     ethPrice: number;
    //     baseFee: number;
    //     nextFee: number;
    //     difference: number;
    //     block: {
    //       gasLimit: number;
    //       gasUsed: number;
    //       utilization: number;
    //       transactionCount: number;
    //     };
    //     oracle: {
    //       slow: {
    //         gasFee: number;
    //         priorityFee: number;
    //         gwei: number;
    //       };
    //       normal: {
    //         gasFee: number;
    //         priorityFee: number;
    //         gwei: number;
    //       };
    //       fast: {
    //         gasFee: number;
    //         priorityFee: number;
    //         gwei: number;
    //       };
    //     };
    //     lastUpdate: number;
    //   };
    // };

    return {
      ok: true,
      result: {
        blockNumber: data.blockNr,
        baseFee: data.baseFee,
        nextFee: data.nextFee,
        ethPrice: data.ethPrice,
        gasPrice: data.oracle[speed].gwei,
        gasFee: data.oracle[speed].gasFee,
        priorityFee: data.oracle[speed].priorityFee,
      } as PricesResult,
    } as OkShape<PricesResult>;
  } catch (err: any) {
    return {
      ok: false,
      error: { message: `Failed to fetch prices from API: ${err.toString()}`, httpStatus: 500 },
    } as NotOkShape;
  }
}

export async function upstreamFetcher(
  options?: any,
  id?: string | null,
): Promise<OkShape<Uint8Array | Record<string, any>> | NotOkShape> {
  let opts = { resolve: false, baseURL: BASE_API_URL, ...filtersNormalizer({ ...options }) };

  if (opts.resolve) {
    opts = await resolveAddressPatches(opts);
  }

  const { baseURL } = opts;

  // @ts-ignore - we don't want to pass these to the fetch
  delete opts.resolve;
  // @ts-ignore - we don't want to pass these to the fetch
  delete opts.baseURL;

  const searchStr = qs.stringify(opts, { encode: false, indices: false });
  const searchParams = new URLSearchParams(searchStr);

  const isAttachment = id && /attach|blob/i.test(id);
  const fpath = (isAttachment ? [id.split('/')[0], 'attachment'] : [id || '']).join('/');
  const search = Object.entries(opts).length > 0 ? `?${searchParams}` : '';

  const resp = await fetch(`${baseURL}/ethscriptions${id ? `/${fpath}` : ''}${search}`);

  if (!resp.ok) {
    console.error('Failed to fetch data from API:', resp.status, resp.statusText);

    return {
      ok: false,
      error: {
        message: 'Transaction not found or it is not an Ethscription.',
        httpStatus: resp.status,
      },
    };
  }

  if (isAttachment) {
    return { ok: true, result: new Uint8Array(await resp.arrayBuffer()) };
  }

  const data: any = await resp.json();
  // const result = Array.isArray(data.result)
  //   ? data.result.map((x) => normalizeResult(x, url))
  //   : normalizeResult(data.result, url);

  const response = { ok: true, result: data.result as Record<string, any> } as OkShape<
    Uint8Array | Record<string, any>
  >;

  if (data.pagination) {
    response.pagination = data.pagination;
  }

  return response;
}

export function normalizeAndSortTransfers(transfers: any[]) {
  return (
    transfers

      .map(({ ethscription_transaction_hash, ...x }, idx) => ({
        ...x,
        is_esip0: idx === 0,
        // theoretically, it could be ESIP-1 Transfer too, but ESIP-2 is more used and more likely
        is_esip1: Boolean(x.event_log_index !== null),
        is_esip2: Boolean(x.event_log_index !== null),
      }))
      // sort by block number, newest fist
      .sort((a, b) => b.block_number - a.block_number)
  );
}

export function normalizeResult(result: any, options?: any) {
  const opts = { ...options };

  const keys = Object.keys(result || {});

  const withs = Array.isArray(opts.with) ? opts.with : opts.with?.split(',') || [];
  const onlys = Array.isArray(opts.only) ? opts.only : opts.only?.split(',') || [];
  const isTxOnly =
    (keys.length === 1 && keys[0] === 'transaction_hash') || opts.transaction_hash_only;

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
    transaction_value: String(result.value).replace(/\.0$/, ''),
    transaction_fee: String(result.transaction_fee).replace(/\.0$/, ''),
    gas_price: String(result.gas_price).replace(/\.0$/, ''),
    gas_used: String(result.gas_used),
    creator: result.creator,
    receiver: result.initial_owner,
    media_type: result.media_type,
    media_subtype: result.mime_subtype,
    content_type: result.mimetype,
    content_sha: result.content_sha,
    content_path: `/ethscriptions/${result.transaction_hash}/content`,
    // Note use `with=content_uri`
    // ...(withContent ? { content_uri: result.content_uri } : {}),
    ...(result.attachment_sha
      ? {
          attachment_content_type: result.attachment_content_type,
          attachment_media_type: result.attachment_content_type.split('/')?.at(0) || null,
          attachment_sha: result.attachment_sha,
          attachment_path: `/ethscriptions/${result.transaction_hash}/attachment`,
        }
      : {}),
    is_esip0: Boolean(result.event_log_index === null),
    is_esip3: Boolean(result.event_log_index !== null),
    is_esip4: result.content_uri?.includes('vnd.facet.tx+json') || false,
    is_esip6: result.esip6,
    is_esip8: Boolean(result.attachment_sha),
  };

  const onlyRes = Object.fromEntries(
    Object.entries(res).filter(([key]) => {
      if (onlys.length > 0) {
        return onlys.includes(key);
      }
      return true;
    }),
  );

  const withRes = withs.reduce((acc: typeof onlyRes, withKey: string) => {
    if (!acc[withKey]) {
      acc[withKey] = (res as any)[withKey] || result[withKey];
    }

    return acc;
  }, onlyRes);

  return withRes.length > 0 ? withRes : onlyRes;
}

export function filtersNormalizer(opts: Record<string, any>) {
  // consistency, we name mime_subtype as media_subtype, to be consistent with media_type
  // if (url.searchParams.get('media_subtype')) {
  //   url.searchParams.set('mime_subtype', url.searchParams.get('media_subtype') || '');
  //   url.searchParams.delete('media_subtype');
  // }

  if (opts.media_subtype) {
    opts.mime_subtype = opts.media_subtype;
    delete opts.media_subtype;
  }

  if (opts.per_page) {
    opts.max_results = opts.per_page;
    // delete opts.per_page;
  }

  if (opts.page_size) {
    opts.max_results = opts.page_size;
    // delete opts.per_page;
  }

  if (opts.cursor) {
    opts.page_key = opts.cursor;
    delete opts.cursor;
  }

  // patch `receiver` with `initial_owner` for consistency with other fields
  if (opts.receiver) {
    opts.initial_owner = opts.receiver;
    delete opts.receiver;
  }

  // patch `initial` with `initial_owner` for consistency with other fields
  if (opts.initial) {
    opts.initial_owner = opts.initial;
    delete opts.initial;
  }

  // patch `previous` with `previous_owner` for consistency with other fields
  if (opts.previous) {
    opts.previous_owner = opts.previous;
    delete opts.previous;
  }

  // patch `current` with `current_owner` for consistency with other fields
  if (opts.current) {
    opts.current_owner = opts.current;
    delete opts.current;
  }
  if (opts.owner) {
    opts.current_owner = opts.owner;
    delete opts.owner;
  }

  // content_type is equal to `<media_type>/<media_subtype>`, it's called "mimetype" in upstream
  if (opts.content_type) {
    opts.mimetype = opts.content_type;
    delete opts.content_type;
  }
  // if `content_type[]=foo/bar&content_type[]=abc/qux`, eg it's is multiples
  const params = Object.entries(opts);
  if (params.some(([key]) => key.startsWith('content_type'))) {
    const contentTypes = params
      .filter(([key]) => key.startsWith('content_type'))
      .map(([_, value]) => value);
    opts.mimetype = contentTypes;
  }

  // support `is_esip6` instead of just `esip6` for consistency with fields and other ESIPs fiekds
  // Note: no such `esip6` filter on upstream, i thought there is. But lets keep it for now
  if (opts.is_esip6) {
    opts.esip6 = opts.is_esip6;
    delete opts.is_esip6;
  }

  return { ...opts };
}

export function filtersNormalizerFromUrlSearchParams(
  searchParams: URLSearchParams,
): URLSearchParams {
  const params = Array.from(searchParams.entries());
  const opts = {};
  for (const entry of params) {
    const [key, value] = entry;

    opts[key] = opts[key]
      ? Array.isArray(opts[key])
        ? [...opts[key], value]
        : [opts[key], value]
      : value;
  }

  const normalizedOptions = filtersNormalizer(opts);
  const searchParamsStr = qs.stringify(normalizedOptions, { encode: false, indices: false });

  return new URLSearchParams(searchParamsStr);
}

export async function resolveAddressPatches(options: any, ensHandler?: any) {
  const opts = { ...options };

  const addressParams = Object.entries(opts).filter(
    ([key, value]: any) =>
      /creator|receiver|owner/i.test(key) && value.length > 0 && !isAddress(value),
  );

  const params = await Promise.all(
    addressParams.map(async (x: any) => {
      const [key, value] = x;

      // if it cannot resolve neither ENS, nor Ethscriptions Name, it returns null
      const val = await namesResolver(
        value,
        ensHandler,
        { ...options, resolveName: false } /* { publicClient } */,
      );

      // `val` is null, passthrough the `value`
      return [key, val || value];
    }),
  );

  return { ...opts, ...Object.fromEntries(params) };
}

export async function namesResolver(
  value: string,
  ensHandler?: any,
  options?: {
    resolveName?: boolean;
    primary?: boolean;
    checkCreator?: boolean;
    publicClient?: any;
    baseURL?: string;
  },
) {
  const opts = { baseURL: BASE_API_URL, ...options };
  const val = value.toLowerCase();
  const handler = ensHandler || ensApiHandler;

  const result = await handler(val, opts);

  // if ensdata API returns 404, or if there's no `address` and only `ens` then it's some mistake
  if (result && result.address && result.ens) {
    return (
      opts.resolveName ? (opts.primary ? result.ens_primary : result.ens) : result.address
    ).toLowerCase();
  }

  // thus if not properly resolved, we fallback to try to find address by Ethscription Name
  // NOTE 1: by default "Ethscription Name" is every ethscription like `data:,[a-z0-9]` (insensitive),
  // but the WGW API expand that definition to that it can be anything (like `59.eths` or `wgw.lol` too) that is not resolvable ENS domain
  //
  // NOTE 2: support reverse resolving, like passing an address and finding the primary Ethscription Name,
  // which could be tricky because one can have multiple. The only way,
  // is if they specifically set "primary" field in their Ethscription User Profile;
  // or just return the first from a list of owned Ethscription Names

  // NOTE 3: on `nameUri`. Should use the raw input and not force lowercase, because both are different things and SHAs.
  // By default the Ethscription Name is case-insensitive (regex /[a-z0-9]/gi), and force lowercase, which may lead to scams, confusion, etc,
  // For example: one can have `Foobie` and another have `foobie`, low-level stuff should be able to differentiate them.
  // Higher-level APIs and tools can enforce the case-insensitivity, if they want to, by lowercasing before passing it to this function.
  const nameUri = `data:,${value}`;

  const nameSha = await createDigest(nameUri);
  const resp: any = await fetch(`${opts.baseURL}/ethscriptions/exists/0x${nameSha}`).then((x) =>
    x.json(),
  );

  // console.log({ val, nameUri, nameSha, resp });

  if (resp.result.exists) {
    const eth = resp.result.ethscription;
    return (opts.checkCreator ? eth.creator : eth.current_owner).toLowerCase();
  }

  return null;
}

export async function ensApiHandler(val: string | `0x${string}`) {
  const resp = await fetch(`https://api.ensdata.net/${val}`);

  if (!resp.ok) {
    return null;
  }

  const data: any = await resp.json();

  return data;
}

export async function ensBasicOnchainHandler(
  val: string,
  options?: { resolveName: boolean; publicClient: any; normalize: any },
) {
  const opts = { ...options };

  const address = await opts.publicClient.getEnsAddress({
    name: opts.normalize(val),
  });

  // getEnsAddress never throws, it returns the input if it's not an ENS name
  if (address.toLowerCase() === val.toLowerCase()) {
    return null;
  }

  let ens = val;

  if (opts.resolveName) {
    ens = await opts.publicClient.getEnsName({
      address: val.toLowerCase(),
    });
  }

  return { ens, address };
}

export function getHeaders(time = 31_536_000, additionalHeaders = {}, cfType = 'must-revalidate') {
  // default time 1 YEAR
  // adds vary, cache-control, and cdn-cache-control headers
  const headers = new CacheHeaders({
    'Netlify-CDN-Cache-Control': `public,s-maxage=${time},must-revalidate,durable`,
    'Vercel-CDN-Cache-Control': `public,s-maxage=${time},must-revalidate`,
    'Cloudflare-CDN-Cache-Control': `public,s-maxage=${time},${cfType}`,
    ...additionalHeaders,
  }).ttl(time);

  return headers;
}

export async function createDigest(
  msg: string | Uint8Array,
  algo: 'SHA-1' | 'SHA-256' | 'SHA-512' = 'SHA-256',
) {
  const data = typeof msg === 'string' ? new TextEncoder().encode(msg) : msg;
  const hashBuffer = await crypto.subtle.digest(algo, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function numfmt(x, delim = ',') {
  return x
    .split('')
    .reverse()
    .join('')
    .match(/.{1,3}/g)
    .map((z) => z.split('').reverse().join(''))
    .reverse()
    .join(delim);
}

export function hex2bytes(str: string) {
  return new Uint8Array([...str.matchAll(/../g)].map((m) => Number.parseInt(m[0], 16)));
}

export function bytes2hex(bytes: Uint8Array) {
  return [...bytes].map((n) => n.toString(16)).join('');
}

export function isAddress(val: string) {
  return Boolean(val && val.startsWith('0x') && val.length === 42);
}

export function isHex(val: string, prefixed = false) {
  return Boolean(
    val &&
      /^[\dA-Fa-f]+$/.test(val) &&
      val.length % 2 === 0 &&
      (prefixed ? val.startsWith('0x') : true),
  );
}
