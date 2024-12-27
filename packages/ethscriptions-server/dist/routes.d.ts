import { type Context } from "hono";
import { createApp } from "./helpers.ts";
export declare function getEnv(ctx: Context, key?: string): string;
export declare function withRoutes(app: ReturnType<typeof createApp>, baseURL?: string): ReturnType<typeof createApp>;
