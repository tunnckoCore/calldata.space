import { CacheHeaders } from "cdn-cache-control";
import type { EthscriptionBase, EthscriptionTransfer, NotOkShape, OkShape, PricesResult } from "./types.ts";
export declare function getPrices(speed?: string): Promise<OkShape<PricesResult> | NotOkShape>;
export declare function upstreamFetcher(options?: any, id?: string | null): Promise<OkShape<Uint8Array | Record<string, any>> | NotOkShape>;
export declare function normalizeAndSortTransfers(transfers: any[]): EthscriptionTransfer[];
export declare function normalizeResult(result: any, options?: any): EthscriptionBase;
export declare function filtersNormalizer(opts: Record<string, any>): Record<string, any>;
export declare function filtersNormalizerFromUrlSearchParams(searchParams: URLSearchParams): URLSearchParams;
export declare function resolveAddressPatches(options: any, ensHandler?: any): Promise<Record<string, any>>;
export declare function namesResolver(value: string, ensHandler?: any, options?: {
	resolveName?: boolean;
	primary?: boolean;
	checkCreator?: boolean;
	publicClient?: any;
	baseURL?: string;
}): Promise<string | null>;
export declare function ensApiHandler(val: string | `0x${string}`): Promise<Record<string, any> | null>;
export declare function ensBasicOnchainHandler(val: string, options?: {
	resolveName: boolean;
	publicClient: any;
	normalize: any;
}): Promise<{
	ens: string;
	address: `0x${string}`;
} | null>;
export declare function getHeaders(time?: number, additionalHeaders?: {}, cfType?: string): CacheHeaders;
export declare function createDigest(msg: string | Uint8Array, algo?: "SHA-1" | "SHA-256" | "SHA-512"): Promise<string>;
export declare function numfmt(x: string, delim?: string): string;
export declare function hex2bytes(str: string): Uint8Array;
export declare function bytes2hex(bytes: Uint8Array): string;
export declare function isAddress(val: string): boolean;
export declare function isHex(val: string, prefixed?: boolean): boolean;
